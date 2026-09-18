import { Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TenantDto } from 'src/modules/tenant/tenant-api/dtos/tenant.dto';
import { HashService } from 'src/common/services/hash.service';
import { TenantLoginDto } from '../dtos/tenant-login.dto';
import { IAuthService } from '../../common/interfaces/auth-service.interface';
import { TenantGetterService } from 'src/modules/tenant/tenant/services/tenant-getter.service';
import { TenantRefreshTokenDto } from '../dtos/tenant-refresh-token.dto';
import { RefreshTokenDto } from '../../common/dtos/refresh-token.dto';

@Injectable({ scope: Scope.REQUEST })
export class TenantAuthService implements IAuthService<TenantLoginDto, TenantDto> {
  constructor(
    private readonly _jwtService: JwtService,
    private readonly _tenantGetter: TenantGetterService,
    private readonly _hashService: HashService,
    private readonly _configService: ConfigService
  ) { }


  async validateClient({ clientId, clientSecret, grantType }: TenantLoginDto): Promise<TenantDto> {
    if (grantType !== 'client_credentials') {
      throw new UnauthorizedException('Invalid grant type');
    }
    const tenant = await this._tenantGetter.findByClientId(clientId);
    if (!tenant) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await this._hashService.verify(
      clientSecret,
      tenant.clientSecret,
    );


    if (isMatch) {
      return {
        id: tenant._id,
        clientId: tenant.clientId,
      };
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async generateToken(data: TenantLoginDto): Promise<RefreshTokenDto> {
    const payload = await this.validateClient(data);
    return this._generateTokenResponse(payload.clientId);
  }

  async refreshAccessToken(data: TenantRefreshTokenDto): Promise<RefreshTokenDto> {
    try {
      const payload = await this._jwtService.verifyAsync<{ clientId: string; type: string }>(
        data.refreshToken,
        {
          secret: this._configService.get<string>('TENANT_JWT_SECRET')
        }
      );

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      await this._tenantGetter.findByClientId(payload.clientId);

      return this._generateTokenResponse(payload.clientId);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async _generateTokenResponse(clientId: string): Promise<RefreshTokenDto> {
    const expiresIn = 3600;
    const accessToken = this._jwtService.sign(
      { clientId },
      {
        secret: this._configService.get<string>('TENANT_JWT_SECRET'),
        expiresIn: `${expiresIn}s`,
      }
    );

    const refreshToken = this._jwtService.sign(
      { clientId, type: 'refresh' },
      {
        secret: this._configService.get<string>('TENANT_JWT_SECRET'),
        expiresIn: '7d'
      }
    );

    return {
      accessToken,
      expiresIn,
      refreshToken,
    };
  }
}
