import { Injectable } from '@nestjs/common';
import { UpdateWebhookDto } from '../dtos/update-webhook.dto';
import { Types } from 'mongoose';
import { WebhookService } from '../../webhook/services/webhook.service';
import { CreateWebhookDashboardDto } from '../dtos/create-webhook-dashboard.dto';
import { TenantGetterService } from 'src/modules/tenant/tenant/services/tenant-getter.service';
import { WebhookDashboardFilter } from '../dtos/webhook-dashboard-filter.dto';
import { CreateWebhookQueueDto } from '../dtos/create-webhook-queue.dto';
import { WebhookQueueCreatorService } from '../../webhook/services/webhook-queue-creator.service';

@Injectable()
export class WebhookApiDashboardService {
  constructor(
    private readonly _webhookService: WebhookService,
    private readonly _tenantGetter: TenantGetterService,
    private readonly _webhookQueueCreator: WebhookQueueCreatorService
  ) { }

  async findAll(filter: WebhookDashboardFilter) {
    return this._webhookService.findAll(filter, true);
  }

  async findOne(id: Types.ObjectId) {
    return this._webhookService.findOne(id);
  }

  async create(data: CreateWebhookDashboardDto) {
    const clientId = await this._tenantGetter.getClientId(data.tenantId);
    return await this._webhookService.create({
      ...data,
      clientId,
    });
  }

  async testCreateQueue(id: Types.ObjectId,
    body: CreateWebhookQueueDto
  ) {
    return this._webhookQueueCreator.create({
      ...body,
      webhookId: new Types.ObjectId(id)
    })
  }

  async update(id: Types.ObjectId, body: UpdateWebhookDto) {
    return this._webhookService.update(id, body);
  }

  async delete(id: Types.ObjectId) {
    return this._webhookService.delete(id);
  }
}
