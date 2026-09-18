import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { TenantDashboardApiService } from './tenant-api-dashboard.service';
import { AuthenticationGuard } from 'src/modules/auth/common/decorators/authentication.decorator';
import { IsSuperAdminGuard } from 'src/modules/auth/account/guards/is-super-admin.guard';
import { CreateTenantDto } from '../dtos/create-tenant.dto';
import { Types } from 'mongoose';

@ApiTags('Tenant - Dashboard')
@Controller('dashboard/tenant')
@AuthenticationGuard('Account')
export class TenantApiDashboardController {
  constructor(private readonly tenantApiService: TenantDashboardApiService) { }

  @Post()
  @UseGuards(IsSuperAdminGuard)
  async create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantApiService.create(createTenantDto);
  }

  @Get()
  @UseGuards(IsSuperAdminGuard)
  async findAll() {
    return this.tenantApiService.findAll();
  }

  @Patch(':tenantId/client-secret/reset')
  @ApiParam({ name: 'tenantId', type: String })
  @UseGuards(IsSuperAdminGuard)
  async resetClientSecret(@Param('tenantId') tenantId: Types.ObjectId) {
    return this.tenantApiService.resetClientSecret(tenantId);
  }
}
