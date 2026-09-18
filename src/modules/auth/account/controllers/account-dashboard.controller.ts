import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from '../../common/decorators/authentication.decorator';
import { AccountDashboardApiService } from './account-dashboard-api.service';
import { IsSuperAdminGuard } from '../guards/is-super-admin.guard';
import { DashboardAccountResetPasswordDto } from 'src/modules/auth/account/dtos/dashboard-account-reset-password.dto';
import { Types } from 'mongoose';

@ApiTags('Account - Dashboard')
@Controller('dashboard/account')
@AuthenticationGuard('Account')
export class AccountDashboardController {
  constructor(
    private readonly _accountDashboardApiService: AccountDashboardApiService,
  ) { }

  @Get()
  @UseGuards(IsSuperAdminGuard)
  async findAll() {
    return this._accountDashboardApiService.findAll();
  }

  @Patch(':accountId/password/update')
  @ApiParam({ name: 'accountId', type: String })
  @UseGuards(IsSuperAdminGuard)
  async updatePassword(
    @Param('accountId') accountId: Types.ObjectId,
    @Body() data: DashboardAccountResetPasswordDto,
  ) {
    return this._accountDashboardApiService.resetPassword(accountId, data);
  }
}
