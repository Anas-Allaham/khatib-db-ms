import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Patient, PatientSchema } from './data/schemas/patient.schema';
import { PatientRepository } from './data/repositories/patient.repository';
import { PatientService } from './services/patient.service';
import { PatientNameNormalizerService } from './services/patient-name-normalizer.service';
import { PatientVerificationService } from './services/patient-verification.service';
import { PatientAgentController } from './controllers/patient-agent.controller';
import { PatientAdminController } from './controllers/patient-admin.controller';
import { WebhookQueueModule } from 'src/modules/webhook/webhook-queue/webhook-queue.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Patient.name, schema: PatientSchema }]),
    WebhookQueueModule,
  ],
  controllers: [PatientAgentController, PatientAdminController],
  providers: [
    PatientRepository,
    PatientService,
    PatientNameNormalizerService,
    PatientVerificationService,
  ],
  exports: [PatientRepository, PatientService, PatientVerificationService],
})
export class PatientModule {}
