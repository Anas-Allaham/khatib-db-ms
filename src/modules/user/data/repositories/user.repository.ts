import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SoftDeleteModel } from 'mongoose-delete';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { TenantContext } from 'src/common/context/tenant.context';
import { User } from 'src/modules/user/data/schemas/user-entity.schema';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectModel(User.name) userModel: SoftDeleteModel<User>,
    _clientStorageService: TenantContext
  ) {

    super(userModel, _clientStorageService);
  }
}
