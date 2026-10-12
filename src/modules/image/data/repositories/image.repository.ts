import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'mongoose-delete';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { TenantContext } from 'src/common/context/tenant.context';
import { Image } from '../schemas/image.schema';

@Injectable()
export class ImageRepository extends BaseRepository<Image> {
  constructor(
    @InjectModel(Image.name) imageModel: SoftDeleteModel<Image>,
    tenantContext: TenantContext,
  ) {
    super(imageModel, tenantContext);
  }
}
