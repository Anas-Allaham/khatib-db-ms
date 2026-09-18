import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'mongoose-delete';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { TenantContext } from 'src/common/context/tenant.context';
import { Webhook } from '../schemas/webhook.schema';

@Injectable()
export class WebhookRepository extends BaseRepository<Webhook> {
  constructor(
    @InjectModel(Webhook.name) _mediaModel: SoftDeleteModel<Webhook>,
    _clientStorageService: TenantContext
  ) {
    super(_mediaModel, _clientStorageService);
  }
}
