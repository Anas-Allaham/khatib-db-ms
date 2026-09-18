import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PatientModule } from 'src/modules/patient/patient.module';
import { Biopsy, BiopsySchema } from './data/schemas/biopsy.schema';
import { BiopsyRepository } from './data/repositories/biopsy.repository';
import { BiopsyService } from './services/biopsy.service';
import { BiopsyResultPolicyService } from './services/biopsy-result-policy.service';
import { BiopsyAgentController } from './controllers/biopsy-agent.controller';
import { BiopsyAdminController } from './controllers/biopsy-admin.controller';
import { WebhookQueueModule } from 'src/modules/webhook/webhook-queue/webhook-queue.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Biopsy.name, schema: BiopsySchema }]),
    PatientModule,
    WebhookQueueModule,
  ],
  controllers: [BiopsyAgentController, BiopsyAdminController],
  providers: [BiopsyRepository, BiopsyService, BiopsyResultPolicyService],
  exports: [BiopsyRepository, BiopsyService],
})
export class BiopsyModule {}
