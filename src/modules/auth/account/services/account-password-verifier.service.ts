import { Injectable } from '@nestjs/common';
import { HashService } from 'src/common/services/hash.service';
import { AccountGetterService } from 'src/modules/account/services/account-getter.service';
import { AccountLoginDto } from '../dtos/account-login.dto';
import { AccountDto } from 'src/modules/account/dtos/account.dto';

@Injectable()
export class AccountPasswordVerifierService {
  constructor(
    private readonly _accountGetter: AccountGetterService,
    private readonly _hashService: HashService
  ) { }


  async byEmail({ email, password }: AccountLoginDto): Promise<boolean> {
    const passwordExists = await this._accountGetter.findPasswordByEmail(email);
    if (passwordExists) {
      const isMatch = await this._hashService.verify(
        password,
        passwordExists,
      );
      if (isMatch) {
        return true
      };
    }
    return false
  }
}
