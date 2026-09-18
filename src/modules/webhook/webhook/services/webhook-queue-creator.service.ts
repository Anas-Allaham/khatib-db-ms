import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { WebhookQueue, } from '../data/schemas/webhook-queue.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebhookQueueRepository } from '../data/repositories/webhook-queue.repository';
import { WebhookQueueStatus } from '../enums/webhook-queue-status.enum';
import { WEBHOOK_PROCESS } from '../constraints/webhook-event.constraint';
import { AppConfigService } from 'src/common/app-config/services/app-config.service';
import { SettingKeys } from 'src/common/app-config/enums/settings-keys.enum';

@Injectable()
export class WebhookQueueCreatorService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly _webhookQueueRepository: WebhookQueueRepository,
    private readonly _appConfigService: AppConfigService,
  ) { }

  async create(
    data: ICreateWebhookQueue
  ): Promise<WebhookQueue> {
    const attemptNumber = data.attemptNumber || 1;
    const executeDate = this._calculateExecuteDate(attemptNumber);
    const isFirstAttempt = attemptNumber === 1
    const webhookQueue = await this._webhookQueueRepository.create({
      ...data,
      payload: data.payload || {},
      method: 'POST',
      headers: data.headers || {},
      status: isFirstAttempt ? WebhookQueueStatus.PROCESSING : WebhookQueueStatus.PENDING,
      attemptNumber,
      executeDate,
    })
    const savedWebhookQueue = await webhookQueue.save();

    if (isFirstAttempt) {
      this.eventEmitter.emit(WEBHOOK_PROCESS, {
        id: savedWebhookQueue._id.toString(),
        url: savedWebhookQueue.url,
        payload: savedWebhookQueue.payload,
        method: savedWebhookQueue.method,
        headers: savedWebhookQueue.headers,
      });
    }

    return savedWebhookQueue;
  }

  private _calculateExecuteDate(attemptNumber: number): Date {
    const now = new Date();
    now.setSeconds(0, 0)
    if (attemptNumber === 1) {
      return now;
    }

    const retryDelayMinutes = +this._appConfigService.getKeyValue(SettingKeys.WEBHOOK_RETRY_DELAY_MINUTES)!

    const delayMinutes = 1 + ((attemptNumber - 1) * retryDelayMinutes);
    const executeDate = new Date(now.getTime() + delayMinutes * 60 * 1000);

    return executeDate;
  }
}

interface ICreateWebhookQueue {
  webhookId: Types.ObjectId,
  url: string,
  payload?: any,
  headers?: any,
  attemptNumber?: number,
}