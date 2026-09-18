import { Injectable } from '@nestjs/common';
import { CreateWebhookDto } from '../dtos/create-webhook.dto';
import { UpdateWebhookDto } from '../dtos/update-webhook.dto';
import { Types } from 'mongoose';
import { WebhookService } from '../../webhook/services/webhook.service';
import { WebhookFilter } from '../dtos/webhook-filter.dto';

@Injectable()
export class WebhookApiAdminService {
  constructor(private readonly _webhookService: WebhookService) { }

  async findAll(filter: WebhookFilter) {
    return this._webhookService.findAll(filter);
  }

  async findOne(id: Types.ObjectId) {
    return this._webhookService.findOne(id);
  }

  async create(data: CreateWebhookDto) {
    return await this._webhookService.create(data);
  }

  async update(id: Types.ObjectId, body: UpdateWebhookDto) {
    return this._webhookService.update(id, body);
  }

  async delete(id: Types.ObjectId) {
    return this._webhookService.delete(id);
  }
}
