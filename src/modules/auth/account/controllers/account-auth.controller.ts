import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountAuthApiService } from './account-auth-api.service';
import { AccountLoginDto } from '../dtos/account-login.dto';
import { SkipAuth } from '../../tenant/decorators';
import { AccountDto } from 'src/modules/account/dtos/account.dto';
import { AccountResetPasswordDto } from '../dtos/account-reset-password.dto';
import { AuthenticationGuard } from '../../common/decorators/authentication.decorator';
import { ReqAccount } from 'src/modules/account/decorators/req-account.decorator';
import { IsTenantAdminGuard } from '../guards/is-tenant-admin.guard';

@ApiTags('Account Auth')
@Controller('auth/account')
@AuthenticationGuard('Account')
export class AccountAuthController {
  constructor(
    private readonly _accountAuthApiService: AccountAuthApiService,
  ) { }


  @Get('me')
  async me(@ReqAccount() account: AccountDto) {
    return this._accountAuthApiService.me(account);
  }

  @Post('login')
  @SkipAuth()
  async login(@Body() accountLoginDto: AccountLoginDto) {
    return this._accountAuthApiService.login(accountLoginDto);
  }

  @Patch('client-secret/reset')
  @UseGuards(IsTenantAdminGuard)
  async resetClientSecret(@ReqAccount() account: AccountDto) {
    return this._accountAuthApiService.resetClientSecret(account);
  }


  @Patch('password/update')
  async updatePassword(@ReqAccount() account: AccountDto, @Body() data: AccountResetPasswordDto) {
    return this._accountAuthApiService.resetPassword(account, data);
  }
}
