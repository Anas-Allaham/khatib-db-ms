import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Webhook, WebhookSchema } from './data/schemas/webhook.schema';
import { WebhookService } from './services/webhook.service';
import { WebhookRepository } from './data/repositories/webhook.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Webhook.name, schema: WebhookSchema }]),
  ],
  providers: [WebhookService, WebhookRepository],
  exports: [WebhookService, WebhookRepository],
})
export class WebhookModule { }
