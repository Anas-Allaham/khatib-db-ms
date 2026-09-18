import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { hash } from 'bcrypt';
import { Model, Types } from 'mongoose';
import { AppModule } from '../src/app.module';
import { Patient } from '../src/modules/patient/data/schemas/patient.schema';
import { Biopsy } from '../src/modules/biopsy/data/schemas/biopsy.schema';
import { Result } from '../src/modules/result/data/schemas/result.schema';
import { ResultStatus } from '../src/modules/result/enums/result-status.enum';
import { Tenant } from '../src/modules/tenant/tenant/data/schemas/tenants-entity.schema';
import { MEDICAL_CASES } from './data/medical-cases.data';

const DEFAULT_CLIENT_ID = 'medical-lab-seed-client';
const DEFAULT_CLIENT_SECRET = 'medical-lab-seed-secret';
const SEED_PATIENT_PREFIX = 'SEED-MRN-';

function normalizePatientName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/ـ/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ');
}

async function resolveTenant(tenantModel: Model<Tenant>) {
  const explicitTenantId = process.env.SEED_TENANT_ID;

  if (explicitTenantId) {
    if (!Types.ObjectId.isValid(explicitTenantId)) {
      throw new Error('SEED_TENANT_ID is not a valid Mongo ObjectId.');
    }

    const tenant = await tenantModel.findById(explicitTenantId);
    if (!tenant) {
      throw new Error(`Tenant ${explicitTenantId} was not found.`);
    }

    return {
      tenant,
      createdSeedTenant: false,
      clientSecret: undefined as string | undefined,
    };
  }

  const clientId = process.env.SEED_TENANT_CLIENT_ID ?? DEFAULT_CLIENT_ID;
  const clientSecret = process.env.SEED_TENANT_CLIENT_SECRET ?? DEFAULT_CLIENT_SECRET;
  const hashedSecret = await hash(clientSecret, 10);

  let tenant = await tenantModel.findOne({ clientId });

  if (!tenant) {
    tenant = await tenantModel.create({
      name: 'Medical Lab Seed Tenant',
      clientId,
      clientSecret: hashedSecret,
      permissions: ['PATIENT_VERIFY', 'BIOPSY_READ'],
    });
  } else {
    tenant.clientSecret = hashedSecret;
    tenant.permissions = ['PATIENT_VERIFY', 'BIOPSY_READ'];
    await tenant.save();
  }

  return {
    tenant,
    createdSeedTenant: true,
    clientSecret,
  };
}

async function clearPreviousSeedData(
  tenantId: Types.ObjectId,
  patientModel: Model<Patient>,
  biopsyModel: Model<Biopsy>,
  resultModel: Model<Result>,
) {
  const oldPatients = await patientModel
    .find({
      tenant: tenantId,
      medicalRecordNumber: { $regex: `^${SEED_PATIENT_PREFIX}` },
    })
    .select('_id')
    .lean();

  const patientIds = oldPatients.map((patient) => patient._id);
  if (!patientIds.length) return;

  await resultModel.collection.deleteMany({
    tenant: tenantId,
    patient: { $in: patientIds },
  });

  await biopsyModel.collection.deleteMany({
    tenant: tenantId,
    patient: { $in: patientIds },
  });

  await patientModel.collection.deleteMany({
    tenant: tenantId,
    _id: { $in: patientIds },
  });
}

async function seed() {
  if (MEDICAL_CASES.length !== 40) {
    throw new Error(`Expected exactly 40 seed cases, found ${MEDICAL_CASES.length}.`);
  }

  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
    throw new Error(
      'Refusing to seed while NODE_ENV=production. Set ALLOW_PRODUCTION_SEED=true only if you intentionally want synthetic data there.',
    );
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const patientModel = app.get<Model<Patient>>(getModelToken(Patient.name), { strict: false });
    const biopsyModel = app.get<Model<Biopsy>>(getModelToken(Biopsy.name), { strict: false });
    const resultModel = app.get<Model<Result>>(getModelToken(Result.name), { strict: false });
    const tenantModel = app.get<Model<Tenant>>(getModelToken(Tenant.name), { strict: false });

    const { tenant, createdSeedTenant, clientSecret } = await resolveTenant(tenantModel);
    const tenantId = tenant._id as Types.ObjectId;

    await clearPreviousSeedData(tenantId, patientModel, biopsyModel, resultModel);

    const counts = {
      DRAFT: 0,
      NORMAL: 0,
      BENIGN: 0,
      MALIGNANT: 0,
      CRITICAL: 0,
    };

    for (const item of MEDICAL_CASES) {
      const patient = await patientModel.create({
        fullName: item.fullName,
        normalizedFullName: normalizePatientName(item.fullName),
        dateOfBirth: item.dateOfBirth,
        phoneLast4: item.phoneLast4,
        medicalRecordNumber: item.medicalRecordNumber,
        tenant: tenantId,
      });

      const expectedReadyAt = item.expectedReadyOffsetHours
        ? new Date(Date.now() + item.expectedReadyOffsetHours * 60 * 60 * 1000)
        : undefined;

      const biopsy = await biopsyModel.create({
        patient: patient._id,
        sampleNumber: item.sampleNumber,
        expectedReadyAt,
        tenant: tenantId,
      });

      await resultModel.create({
        biopsy: biopsy._id,
        patient: patient._id,
        status: item.result.status,
        classification: item.result.classification,
        rawReport: item.result.rawReport,
        issuedAt: item.result.status === ResultStatus.FINAL ? new Date() : undefined,
        tenant: tenantId,
      });

      if (item.result.status === ResultStatus.DRAFT) counts.DRAFT += 1;
      else counts[item.result.classification] += 1;
    }

    console.log('\nMedical seed completed successfully.');
    console.log(`Tenant ID: ${tenantId.toString()}`);
    console.log(`Cases: ${MEDICAL_CASES.length}`);
    console.log('Distribution:', counts);
    console.log('Example verification case:');
    console.log({
      fullName: MEDICAL_CASES[0].fullName,
      dateOfBirth: MEDICAL_CASES[0].dateOfBirth,
      phoneLast4: MEDICAL_CASES[0].phoneLast4,
    });

    if (createdSeedTenant && clientSecret) {
      console.log('\nSeed tenant credentials (development only):');
      console.log({
        clientId: tenant.clientId,
        clientSecret,
        grantType: 'client_credentials',
      });
    }
  } finally {
    await app.close();
  }
}

seed().catch((error) => {
  console.error('Medical seed failed:', error);
  process.exit(1);
});
