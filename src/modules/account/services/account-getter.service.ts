import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { AccountRepository } from '../data/repositories/account.repository';
import { AccountWithTenant } from '../types/account-with-tenant.type';

@Injectable()
export class AccountGetterService {
  constructor(
    private readonly _accountRepository: AccountRepository
  ) { }

  async findByEmail(email: string) {
    const account = await this._accountRepository.findOne({ email })
    return account
  }

  async findPasswordByEmail(email: string) {
    const account = await this._accountRepository.findOne({ email }, { password: true })
    return account?.password
  }

  async findById(_id: Types.ObjectId) {
    const account = await this._accountRepository.findOne({ _id }).select('-password')
    return account
  }

  async findByIdWithTenant(_id: Types.ObjectId) {
    const account = await this._accountRepository.findOne<AccountWithTenant>({ _id }).populate('tenant').select('-password')
    return account
  }

  async findByTenantId(tenantId: Types.ObjectId) {
    return this._accountRepository.findOne({ tenant: tenantId })
  }

  async findAll() {
    return this._accountRepository.find().select('-password')
  }
}
