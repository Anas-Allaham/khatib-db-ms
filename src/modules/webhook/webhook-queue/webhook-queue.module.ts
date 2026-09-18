import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhookQueue, WebhookQueueSchema } from '../webhook/data/schemas/webhook-queue.schema';
import { WebhookQueueCreatorService } from '../webhook/services/webhook-queue-creator.service';
import { WebhookQueueRepository } from '../webhook/data/repositories/webhook-queue.repository';
import { WebhookProcessorService } from './services/webhook-processor.service';
import { HttpModule } from '@nestjs/axios';
import { WebhookModule } from '../webhook/webhook.module';
import { WebhookQueueUpdaterService } from '../webhook/services/webhook-queue-updater.service';
import { WebhookProcessorTask } from './services/webhook-processor.task';
import { ClinicalWebhookPublisherService } from './services/clinical-webhook-publisher.service';

@Module({
  imports: [
    HttpModule,
    WebhookModule,
    MongooseModule.forFeature([{ name: WebhookQueue.name, schema: WebhookQueueSchema }]),
  ],
  providers: [
    WebhookQueueCreatorService,
    WebhookQueueRepository,
    WebhookProcessorService,
    WebhookQueueUpdaterService,
    WebhookProcessorTask,
    ClinicalWebhookPublisherService,
  ],
  exports: [
    WebhookQueueCreatorService,
    WebhookQueueRepository,
    WebhookProcessorService,
    WebhookQueueUpdaterService,
    ClinicalWebhookPublisherService,
  ],
})
export class WebhookQueueModule { }