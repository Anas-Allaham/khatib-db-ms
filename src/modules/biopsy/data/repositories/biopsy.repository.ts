import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'mongoose-delete';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { TenantContext } from 'src/common/context/tenant.context';
import { Biopsy } from '../schemas/biopsy.schema';

@Injectable()
export class BiopsyRepository extends BaseRepository<Biopsy> {
  constructor(
    @InjectModel(Biopsy.name) biopsyModel: SoftDeleteModel<Biopsy>,
    tenantContext: TenantContext,
  ) {
    super(biopsyModel, tenantContext);
  }
}
