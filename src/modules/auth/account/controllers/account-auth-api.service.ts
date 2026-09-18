import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountLoginDto } from '../dtos/account-login.dto';
import { SecretKeyGeneratorService } from 'src/common/services/secret-key-generator.service';
import { AccountAuthService } from '../services/account-auth.service';
import { AccountDto } from 'src/modules/account/dtos/account.dto';
import { AccountRepository } from 'src/modules/account/data/repositories/account.repository';
import { AccountResetPasswordDto } from '../dtos/account-reset-password.dto';
import { AccountPasswordVerifierService } from '../services/account-password-verifier.service';
import { AccountPasswordResetterService } from '../services/account-password-resetter.service';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { TenantRepository } from 'src/modules/tenant/tenant/data/repositories/tenant.repository';
import { Tenant } from 'src/modules/tenant/tenant/data/schemas/tenants-entity.schema';
import { AccountGetterService } from 'src/modules/account/services/account-getter.service';

@Injectable()
export class AccountAuthApiService {
  constructor(
    private readonly _tenantRepository: TenantRepository,
    private readonly _accountRepository: AccountRepository,
    private readonly _secretKeyGenerator: SecretKeyGeneratorService,
    private readonly _passwordVerifier: AccountPasswordVerifierService,
    private readonly _passwordResetter: AccountPasswordResetterService,
    private readonly _accountAuth: AccountAuthService,
    private readonly _accountGetter: AccountGetterService
  ) { }

  async me(reqAccount: AccountDto) {
    return this._accountGetter.findById(reqAccount._id)
  }


  async login(accountLoginDto: AccountLoginDto) {
    return this._accountAuth.generateToken(accountLoginDto)
  }


  async resetClientSecret(reqAccount: AccountDto) {
    const { clientSecret, hashedSecret } = await this._secretKeyGenerator.generateSecretKey()
    const account = await this._accountRepository.findOne({ _id: reqAccount._id }, {}, {}, { path: 'tenant' })
    if (!account?.tenant)
      throw new NotFoundException('This account does not belong to a tenant.')

    const tenant: Tenant = account?.tenant as any;

    await this._tenantRepository.updateOne({ clientId: tenant.clientId }, { clientSecret: hashedSecret })
    return { clientId: tenant.clientId, clientSecret }
  }

  async resetPassword(account: AccountDto, data: AccountResetPasswordDto) {
    const isVerified = await this._passwordVerifier.byEmail({ email: account.email, password: data.oldPassword })
    if (isVerified) {
      await this._passwordResetter.reset(account._id, data.newPassword)
      return new BaseResponseDto({ message: 'The password has been reset successfully.' })
    }
    throw new NotFoundException('Password is not correct.')
  }
}