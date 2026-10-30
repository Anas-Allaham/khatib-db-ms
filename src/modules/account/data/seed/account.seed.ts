import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import SUPER_ADMIN from './super-admin-seed.json'
import { AccountCreatorService } from '../../services/account-creator.service';
import { AccountGetterService } from '../../services/account-getter.service';
import { EAccountRole } from '../../enums/account-role.enum';

@Injectable()
export class AccountSeed {
  constructor(
    private readonly _accountCreator: AccountCreatorService,
    private readonly _accountGetter: AccountGetterService,
  ) { }

  private async createSuperAdmin() {
    if (process.env.NODE_ENV === 'production' && !process.env.SUPER_ADMIN_PASSWORD) {
      console.log('Skipping super admin seed: SUPER_ADMIN_PASSWORD must be set in production.');
      return;
    }

    const email = process.env.SUPER_ADMIN_EMAIL || SUPER_ADMIN.email;
    const password = process.env.SUPER_ADMIN_PASSWORD || SUPER_ADMIN.password;

    const account = await this._accountGetter.findByEmail(email)
    if (!account) {
      await this._accountCreator.create({
        name: SUPER_ADMIN.name,
        password,
        email,
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
