import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TenantAuthApiService } from './tenant-auth-api.service';
import { TenantLoginDto } from '../dtos/tenant-login.dto';
import { TenantRefreshTokenDto } from '../dtos/tenant-refresh-token.dto';

@ApiTags('Tenant Auth')
@Controller('auth/tenant')
export class TenantAuthController {
  constructor(private readonly tenantAuthApiService: TenantAuthApiService) { }

  @Post('login')
  async login(@Body() tenantLoginDto: TenantLoginDto) {
    return this.tenantAuthApiService.login(tenantLoginDto);
  }

  @Post('refresh')
  async refresh(@Body() tenantRefreshTokenDto: TenantRefreshTokenDto) {
    return this.tenantAuthApiService.refresh(tenantRefreshTokenDto);
  }
}
