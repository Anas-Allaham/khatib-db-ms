import { Injectable, Logger } from '@nestjs/common';
import { WebhookEvents } from '../../webhook/enums/webhook-events.enum';
import { WebhookRepository } from '../../webhook/data/repositories/webhook.repository';
import { WebhookQueueCreatorService } from '../../webhook/services/webhook-queue-creator.service';

@Injectable()
export class ClinicalWebhookPublisherService {
  private readonly _logger = new Logger(ClinicalWebhookPublisherService.name);

  constructor(
    private readonly _webhookRepository: WebhookRepository,
    private readonly _queueCreator: WebhookQueueCreatorService,
  ) {}

  async publish(event: WebhookEvents, payload: Record<string, unknown>) {
    try {
      const webhooks = await this._webhookRepository.find({
        isActive: true,
        events: event,
      });

      const results = await Promise.allSettled(
        webhooks.map((webhook) =>
          this._queueCreator.create({
            webhookId: webhook._id,
            url: webhook.url,
            payload: {
              event,
              occurredAt: new Date().toISOString(),
              data: payload,
            },
          }),
        ),
      );

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          this._logger.error(
            `Failed to queue ${event} webhook ${webhooks[index]._id}: ${result.reason?.message || result.reason}`,
          );
        }
      });
    } catch (error) {
      // Webhooks are side effects. They must not block verification or result retrieval.
      this._logger.error(`Failed to publish ${event}: ${error.message}`);
    }
  }
}
