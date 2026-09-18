import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { HashService } from 'src/common/services/hash.service';
import { AccountRepository } from 'src/modules/account/data/repositories/account.repository';

@Injectable()
export class AccountPasswordResetterService {
  constructor(
    private readonly _accountRepository: AccountRepository,
    private readonly _hashService: HashService
  ) { }

  async reset(accountId: Types.ObjectId, password: string) {
    const hashedPassword = await this._hashService.hash(password)
    return this._accountRepository.updateOne({ _id: accountId }, { password: hashedPassword })
  }
}