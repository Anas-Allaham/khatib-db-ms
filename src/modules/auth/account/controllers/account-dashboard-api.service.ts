import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountPasswordResetterService } from '../services/account-password-resetter.service';
import { AccountGetterService } from 'src/modules/account/services/account-getter.service';
import { Types } from 'mongoose';
import { DashboardAccountResetPasswordDto } from '../dtos/dashboard-account-reset-password.dto';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';

@Injectable()
export class AccountDashboardApiService {
  constructor(
    private readonly _passwordResetter: AccountPasswordResetterService,
    private readonly _accountGetter: AccountGetterService
  ) { }

  async findAll() {
    return this._accountGetter.findAll()
  }


  async resetPassword(accountId: Types.ObjectId, data: DashboardAccountResetPasswordDto) {
    const account = await this._accountGetter.findById(accountId)
    if (!account) throw new NotFoundException('Account is not found.')

    await this._passwordResetter.reset(account._id, data.password)

    return new BaseResponseDto({ message: 'SUCCESS' })
  }
}