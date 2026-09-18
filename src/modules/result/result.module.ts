import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Result, ResultSchema } from './data/schemas/result.schema';
import { ResultRepository } from './data/repositories/result.repository';
import { ResultService } from './services/result.service';
import { ResultPolicyService } from './services/result-policy.service';
import { ResultAdminController } from './controllers/result-admin.controller';
import { ResultAgentController } from './controllers/result-agent.controller';
import { BiopsyModule } from 'src/modules/biopsy/biopsy.module';
import { PatientModule } from 'src/modules/patient/patient.module';
import { WebhookQueueModule } from 'src/modules/webhook/webhook-queue/webhook-queue.module';
import { AccountModule } from 'src/modules/account/account.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Result.name, schema: ResultSchema }]),
    BiopsyModule,
    PatientModule,
    WebhookQueueModule,
    AccountModule,
  ],
  controllers: [ResultAdminController, ResultAgentController],
  providers: [ResultRepository, ResultService, ResultPolicyService],
  exports: [ResultService],
})
export class ResultModule {}
