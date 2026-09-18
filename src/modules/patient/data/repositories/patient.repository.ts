import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'mongoose-delete';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { TenantContext } from 'src/common/context/tenant.context';
import { Patient } from '../schemas/patient.schema';

@Injectable()
export class PatientRepository extends BaseRepository<Patient> {
  constructor(
    @InjectModel(Patient.name) patientModel: SoftDeleteModel<Patient>,
    tenantContext: TenantContext,
  ) {
    super(patientModel, tenantContext);
  }
}
