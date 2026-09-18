import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'mongoose-delete';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { TenantContext } from 'src/common/context/tenant.context';
import { Result } from '../schemas/result.schema';

@Injectable()
export class ResultRepository extends BaseRepository<Result> {
  constructor(
    @InjectModel(Result.name) resultModel: SoftDeleteModel<Result>,
    tenantContext: TenantContext,
  ) {
    super(resultModel, tenantContext);
  }
}
