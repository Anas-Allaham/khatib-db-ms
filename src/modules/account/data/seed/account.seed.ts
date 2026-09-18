import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import SUPER_ADMIN from './super-admin-seed.json'
import { AccountCreatorService } from 'src/modules/account/services/account-creator.service';
import { AccountGetterService } from 'src/modules/account/services/account-getter.service';
import { EAccountRole } from 'src/modules/account/enums/account-role.enum';

@Injectable()
export class AccountSeed {
  constructor(
    private readonly _accountCreator: AccountCreatorService,
    private readonly _accountGetter: AccountGetterService,
  ) { }

  private async createSuperAdmin() {
    const account = await this._accountGetter.findByEmail(SUPER_ADMIN.email)
    if (!account) {
      await this._accountCreator.create({
        name: SUPER_ADMIN.name,
        password: SUPER_ADMIN.password,
        email: SUPER_ADMIN.email,
        role: SUPER_ADMIN.role as EAccountRole
      })
    }
  }



  @Command({ command: 'seed:account' })
  async run() {
    try {
      // Seeds
      await this.createSuperAdmin();

      // Done
      console.log('Seed is done.');
    } catch (e) {
      console.log(e);
    }
  }
}
