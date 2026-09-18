import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WebhookQueueRepository } from '../../webhook/data/repositories/webhook-queue.repository';
import { WebhookQueueStatus } from '../../webhook/enums/webhook-queue-status.enum';
import { WebhookProcessorService } from './webhook-processor.service';

@Injectable()
export class WebhookProcessorTask {
  private readonly _logger = new Logger(WebhookProcessorTask.name);

  constructor(
    private readonly _webhookQueueRepository: WebhookQueueRepository,
    private readonly _webhookProcessorService: WebhookProcessorService,
  ) { }

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledWebhooks() {
    try {
      const now = new Date();
      now.setSeconds(0, 0);
      now.setMinutes(now.getMinutes() + 1);
      const pendingWebhooks = await this._webhookQueueRepository.find({
        status: WebhookQueueStatus.PENDING,
        executeDate: { $lt: now },
      });

      if (pendingWebhooks.length === 0) {
        return;
      }

      this._logger.log(`Found ${pendingWebhooks.length} pending webhooks to process`);

      const webhookIds = pendingWebhooks.map(webhook => webhook._id);
      await this._webhookQueueRepository.updateMany(
        { _id: { $in: webhookIds } },
        { status: WebhookQueueStatus.PROCESSING }
      );

      const BATCH_SIZE = 10;
      for (let i = 0; i < pendingWebhooks.length; i += BATCH_SIZE) {
        const batch = pendingWebhooks.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(webhook =>
            this._webhookProcessorService.processWebhook(
              webhook._id,
              webhook.url,
              webhook.payload,
              webhook.headers,
            ).catch(error => {
              this._logger.error(
                `Failed to process webhook ${webhook._id}: ${error.message}`,
              );
            })
          )
        );
      }

      this._logger.log(`Processed ${pendingWebhooks.length} webhooks`);
    } catch (error) {
      this._logger.error(`Error in scheduled webhook processing: ${error.message}`);
    }
  }
}
