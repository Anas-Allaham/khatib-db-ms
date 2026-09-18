import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AccountCreatorService } from 'src/modules/account/services/account-creator.service';
import { MongoTransactionService } from 'src/common/services/mongo-transaction.service';
import { AccountGetterService } from 'src/modules/account/services/account-getter.service';
import { TenantCreatorService } from '../../tenant/services/tenant-creator.service';
import { TenantGetterService } from '../../tenant/services/tenant-getter.service';
import { CreateTenantDto } from '../dtos/create-tenant.dto';
import { Types } from 'mongoose';
import { Tenant } from '../../tenant/data/schemas/tenants-entity.schema';
import { AccountRepository } from 'src/modules/account/data/repositories/account.repository';
import { SecretKeyGeneratorService } from 'src/common/services/secret-key-generator.service';
import { TenantRepository } from '../../tenant/data/repositories/tenant.repository';
import { AccountPasswordResetterService } from 'src/modules/auth/account/services/account-password-resetter.service';

@Injectable()
export class TenantDashboardApiService {
  constructor(
    private readonly _tenantCreator: TenantCreatorService,
    private readonly _accountCreator: AccountCreatorService,
    private readonly _accountGetter: AccountGetterService,
    private readonly _tenantGetter: TenantGetterService,
    private readonly _transaction: MongoTransactionService,
    private readonly _accountRepository: AccountRepository,
    private readonly _secretKeyGenerator: SecretKeyGeneratorService,
    private readonly _tenantRepository: TenantRepository,
    private readonly _passwordResetter: AccountPasswordResetterService
  ) { }

  async create({ account: createAccountDto, ...createTenantDto }: CreateTenantDto) {
    const emailExists = await this._accountGetter.findByEmail(createAccountDto.email)
    if (emailExists) throw new BadRequestException('Email is taken.')

    return this._transaction.apply(async (session) => {
      const tenant = await this._tenantCreator.create(createTenantDto, session);
      await this._accountCreator.create({ ...createAccountDto, tenantId: tenant._id }, session);
      return { clientId: tenant.clientId, clientSecret: tenant.clientSecret };
    })
  }

  async findAll() {
    return this._tenantGetter.getTenants();
  }


  async resetClientSecret(tenantId: Types.ObjectId) {
    const tenantAccount = await this._accountGetter.findByTenantId(tenantId)
    if (!tenantAccount) throw new NotFoundException('Tenant Account is not found.')

    const { clientSecret, hashedSecret } = await this._secretKeyGenerator.generateSecretKey()
    const account = await this._accountRepository.findOne({ _id: tenantAccount._id }, {}, {}, { path: 'tenant' })
    const tenant: Tenant = account?.tenant as any;

    await this._tenantRepository.updateOne({ clientId: tenant.clientId }, { clientSecret: hashedSecret })
    return { clientId: tenant.clientId, clientSecret }
  }

}
