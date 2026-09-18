import { Injectable } from '@nestjs/common';
import { ClientSession, Types } from 'mongoose';
import { HashService } from 'src/common/services/hash.service';
import { EAccountRole } from '../enums/account-role.enum';
import { AccountRepository } from '../data/repositories/account.repository';

@Injectable()
export class AccountCreatorService {
  constructor(
    private readonly _accountRepository: AccountRepository,
    private readonly _hashService: HashService
  ) { }

  async create(data: ICreateAccount, session?: ClientSession) {
    const { name, email, tenantId, password, role } = data;
    const hashedPassword = await this._hashService.hash(password)
    const newAccount = await this._accountRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
      tenant: tenantId
    }, { session });

    return newAccount;
  }
}


interface ICreateAccount {
  name: string;
  email: string;
  password: string;
  tenantId?: Types.ObjectId
  role?: EAccountRole
}