import { Injectable } from '@nestjs/common';
import { TenantLoginDto } from '../dtos/tenant-login.dto';
import { TenantRefreshTokenDto } from '../dtos/tenant-refresh-token.dto';
import { TenantAuthService } from '../services/tenant-auth.service';

@Injectable()
export class TenantAuthApiService {
  constructor(
    private readonly _tenantAuth: TenantAuthService
  ) { }

  async login(tenantLoginDto: TenantLoginDto) {
    return this._tenantAuth.generateToken(tenantLoginDto)
  }

  async refresh(tenantRefreshTokenDto: TenantRefreshTokenDto) {
    return this._tenantAuth.refreshAccessToken(tenantRefreshTokenDto);
  }
}