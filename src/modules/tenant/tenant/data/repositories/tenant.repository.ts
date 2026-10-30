import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'mongoose-delete';
import { BaseRepository } from '../../../../../common/repositories/base.repository';
import { TenantContext } from '../../../../../common/context/tenant.context';
import { Tenant } from '../schemas/tenants-entity.schema';

@Injectable()
export class TenantRepository extends BaseRepository<Tenant> {
  constructor(
    @InjectModel(Tenant.name) _tenantModel: SoftDeleteModel<Tenant>,
    _clientStorageService: TenantContext,
  ) {
    super(_tenantModel, _clientStorageService);
  }
}
