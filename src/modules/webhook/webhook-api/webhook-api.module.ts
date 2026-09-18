import { Module } from '@nestjs/common';
import { WebhookApiAdminController } from './controllers/webhook-api-admin.controller';
import { WebhookApiDashboardController } from './controllers/webhook-api-dashboard.controller';
import { WebhookApiAdminService } from './controllers/webhook-api-admin.service';
import { WebhookApiDashboardService } from './controllers/webhook-api-dashboard.service';
import { WebhookModule } from '../webhook/webhook.module';
import { WebhookQueueModule } from '../webhook-queue/webhook-queue.module';
import { AccountModule } from 'src/modules/account/account.module';

@Module({
  imports: [WebhookModule, WebhookQueueModule, AccountModule],
  controllers: [WebhookApiAdminController, WebhookApiDashboardController],
  providers: [WebhookApiAdminService, WebhookApiDashboardService]
})
export class WebhookApiModule { }
