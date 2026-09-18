import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WebhookQueue } from '../schemas/webhook-queue.schema';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { SoftDeleteModel } from 'mongoose-delete';
import { TenantContext } from 'src/common/context/tenant.context';

@Injectable()
export class WebhookQueueRepository extends BaseRepository<WebhookQueue> {
  constructor(
    @InjectModel(WebhookQueue.name)
    webhookQueueModel: SoftDeleteModel<WebhookQueue>,
    _clientStorageService: TenantContext,
  ) {
    super(webhookQueueModel, _clientStorageService);
  }
}
