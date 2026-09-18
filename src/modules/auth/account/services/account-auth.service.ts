import { Injectable, NotFoundException, Scope, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountLoginDto } from '../dtos/account-login.dto';
import { AccountDto } from 'src/modules/account/dtos/account.dto';
import { IAuthService } from '../../common/interfaces/auth-service.interface';
import { AccountPasswordVerifierService } from './account-password-verifier.service';
import { AccountGetterService } from 'src/modules/account/services/account-getter.service';
import { AccountLoginResponseDto } from '../dtos/account-login-response.dto';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.REQUEST })
export class AccountAuthService implements IAuthService<AccountLoginDto, AccountDto> {
  constructor(
    private readonly _jwtService: JwtService,
    private readonly _accountGetter: AccountGetterService,
    private readonly _passwordVerifier: AccountPasswordVerifierService,
    private readonly _configService: ConfigService,
  ) { }


  async validateClient({ email, password }: AccountLoginDto): Promise<AccountDto> {
    const isVerified = await this._passwordVerifier.byEmail({ email, password })

    if (isVerified) {
      const account = await this._accountGetter.findByEmail(email)

      if (account)
        return {
          _id: account._id,
          email: account.email,
          name: account.name
        };
    }
    throw new UnauthorizedException('Invalid credentials');

  }

  async generateToken(data: AccountLoginDto): Promise<AccountLoginResponseDto> {
    const payload = await this.validateClient(data);

    const account = await this._accountGetter.findById(payload._id)
    if (!account) throw new NotFoundException('Account is not found.')
    return {
      accessToken: this._jwtService.sign(payload, {
        secret: this._configService.get<string>('ACCOUNT_JWT_SECRET'),
        expiresIn: '1h',
      }),
      account
    };
  }


}
