import { Module } from '@nestjs/common';
import { AccountCreatorService } from './services/account-creator.service';
import { AccountGetterService } from './services/account-getter.service';
import { AccountRepository } from './data/repositories/account.repository';
import { Account, AccountSchema } from 'src/modules/account/data/schemas/account-entity.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountSeed } from './data/seed/account.seed';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
  ],
  providers: [AccountCreatorService, AccountGetterService, AccountRepository, AccountSeed],
  exports: [AccountCreatorService, AccountGetterService, AccountRepository, AccountSeed],
})
export class AccountModule { };