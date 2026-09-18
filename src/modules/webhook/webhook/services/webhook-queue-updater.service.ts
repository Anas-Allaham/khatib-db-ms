import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { WebhookQueueStatus } from '../enums/webhook-queue-status.enum';
import { WebhookQueueRepository } from '../data/repositories/webhook-queue.repository';

@Injectable()
export class WebhookQueueUpdaterService {
  constructor(
    private readonly _webhookQueueRepository: WebhookQueueRepository,
  ) { }

  async update(id: Types.ObjectId, data: IUpdateWebhookQueue) {
    return await this._webhookQueueRepository.updateOne(
      { _id: id },
      {
        status: data.status,
        statusCode: data.statusCode,
        response: data.response,
      },
      { new: true },
    );
  }
}

interface IUpdateWebhookQueue {
  status: WebhookQueueStatus;
  statusCode?: number;
  response?: string;
}
