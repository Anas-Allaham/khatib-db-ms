import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'mongoose-delete';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { TenantContext } from 'src/common/context/tenant.context';
import { Account } from 'src/modules/account/data/schemas/account-entity.schema';

@Injectable()
export class AccountRepository extends BaseRepository<Account> {
  constructor(
    @InjectModel(Account.name) _accountModel: SoftDeleteModel<Account>,
    _clientStorageService: TenantContext
  ) {
    super(_accountModel, _clientStorageService);
  }
}
