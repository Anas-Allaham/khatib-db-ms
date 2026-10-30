import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'mongoose-delete';
import { BaseRepository } from '../../../../common/repositories/base.repository';
import { TenantContext } from '../../../../common/context/tenant.context';
import { AppConfig } from '../schemas/app-config-entity.schema';

@Injectable()
export class AppConfigRepository extends BaseRepository<AppConfig> {
  constructor(
    @InjectModel(AppConfig.name) _appConfigModel: SoftDeleteModel<AppConfig>,
    _clientStorageService: TenantContext
  ) {
    super(_appConfigModel, _clientStorageService);
  }
}
