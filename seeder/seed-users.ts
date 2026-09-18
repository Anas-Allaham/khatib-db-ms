import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { hash } from 'bcrypt';
import { Model, Types } from 'mongoose';
import { AppModule } from '../src/app.module';
import { User } from '../src/modules/user/data/schemas/user-entity.schema';
import { Tenant } from '../src/modules/tenant/tenant/data/schemas/tenants-entity.schema';
import { SEED_USERS } from './data/users.data';

const DEFAULT_CLIENT_ID = 'medical-lab-seed-client';
const DEFAULT_CLIENT_SECRET = 'medical-lab-seed-secret';
const SEED_USER_PREFIX = 'seed-user-';

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

async function seedUsers() {
  if (SEED_USERS.length !== 40) {
    throw new Error(`Expected exactly 40 seed users, found ${SEED_USERS.length}.`);
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
    const userModel = app.get<Model<User>>(getModelToken(User.name), { strict: false });
    const tenantModel = app.get<Model<Tenant>>(getModelToken(Tenant.name), { strict: false });

    const { tenant, createdSeedTenant, clientSecret } = await resolveTenant(tenantModel);
    const tenantId = tenant._id as Types.ObjectId;

    // Only remove users created by this seeder.
    await userModel.collection.deleteMany({
      tenant: tenantId,
      ownerId: { $regex: `^${SEED_USER_PREFIX}` },
    });

    await userModel.insertMany(
      SEED_USERS.map((user) => ({
        ownerId: user.ownerId,
        tenant: tenantId,
      })),
    );

    console.log('\nUser seed completed successfully.');
    console.log(`Tenant ID: ${tenantId.toString()}`);
    console.log(`Users: ${SEED_USERS.length}`);
    console.log(`First user ownerId: ${SEED_USERS[0].ownerId}`);
    console.log(`Last user ownerId: ${SEED_USERS[SEED_USERS.length - 1].ownerId}`);

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

seedUsers().catch((error) => {
  console.error('User seed failed:', error);
  process.exit(1);
});
