import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { Types } from 'mongoose';
import { WebhookRepository } from '../../webhook/data/repositories/webhook.repository';
import { firstValueFrom } from 'rxjs';
import { WEBHOOK_PROCESS } from '../../webhook/constraints/webhook-event.constraint';
import { WebhookQueueStatus } from '../../webhook/enums/webhook-queue-status.enum';
import { WebhookQueueUpdaterService } from '../../webhook/services/webhook-queue-updater.service';
import { WebhookQueueCreatorService } from '../../webhook/services/webhook-queue-creator.service';
import { WebhookQueueRepository } from '../../webhook/data/repositories/webhook-queue.repository';

@Injectable()
export class WebhookProcessorService {
  private readonly _logger = new Logger(WebhookProcessorService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly _webhookQueueService: WebhookQueueUpdaterService,
    private readonly _webhookQueueCreator: WebhookQueueCreatorService,
    private readonly _webhookRepository: WebhookRepository,
    private readonly _webhookQueueRepository: WebhookQueueRepository,
  ) { }

  @OnEvent(WEBHOOK_PROCESS)
  async handleWebhookEvent(data: {
    id: Types.ObjectId;
    url: string;
    payload: any;
    headers: any;
  }) {
    await this.processWebhook(
      new Types.ObjectId(data.id),
      data.url,
      data.payload,
      data.headers,
    );
  }

  async processWebhook(
    id: Types.ObjectId,
    url: string,
    payload: any,
    headers: any = {},
  ): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.httpService.request({
          url,
          data: payload,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        }),
      );

      if (response.status == 200 || response.status == 201) {
        await this._webhookQueueService.update(id, {
          status: WebhookQueueStatus.SUCCEEDED,
          statusCode: response.status,
          response: response.data,
        });
      } else {
        await this.handleWebhookFailure(id, response.status, response.data);
      }
    } catch (error) {
      this._logger.error(`Webhook error for ID ${id}: ${error.message}`);
      await this.handleWebhookFailure(
        id,
        error.response?.status,
        error.message,
      );
    }
  }

  private async handleWebhookFailure(
    id: Types.ObjectId,
    statusCode: number,
    response: string,
  ): Promise<void> {
    const webhookQueue = await this._webhookQueueRepository.findOne({
      _id: id,
    });

    if (!webhookQueue) {
      this._logger.error(`Webhook queue item not found: ${id}`);
      return;
    }

    const webhook = await this._webhookRepository.findOne({
      _id: webhookQueue.webhookId,
    });

    if (!webhook) {
      this._logger.error(
        `Original webhook not found: ${webhookQueue.webhookId}`,
      );
      await this._webhookQueueService.update(id, {
        status: WebhookQueueStatus.FAILED,
        statusCode,
        response,
      });
      return;
    }

    const newAttemptNumber = webhookQueue.attemptNumber + 1;

    await this._webhookQueueService.update(id, {
      status: WebhookQueueStatus.FAILED,
      statusCode,
      response,
    });

    if (newAttemptNumber <= webhook.maxRetryAttempts) {
      const newWebhookQueue = await this._webhookQueueCreator.create({
        url: webhookQueue.url,
        payload: webhookQueue.payload,
        headers: webhookQueue.headers,
        attemptNumber: newAttemptNumber,
        webhookId: webhookQueue.webhookId,
      });

      await newWebhookQueue.save();
    }
  }
}
