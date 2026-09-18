import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators';
import { TenantDto } from 'src/modules/tenant/tenant-api/dtos/tenant.dto';
import { TenantContext } from 'src/common/context/tenant.context';
import { TenantRequest } from 'src/modules/tenant/tenant/interfaces/tenant-request.interface';
import { TenantGetterService } from 'src/modules/tenant/tenant/services/tenant-getter.service';

@Injectable()
export class TenantAuthGuard implements CanActivate {
  constructor(
    private readonly _reflector: Reflector,
    private readonly _jwtService: JwtService,
    private readonly _tenantContext: TenantContext,
    private readonly _tenantGetter: TenantGetterService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this._reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<TenantRequest>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this._jwtService.verifyAsync<{ clientId: string; type?: string }>(
        token,
        {
          secret: process.env.TENANT_JWT_SECRET
        }
      );

      if (payload.type === 'refresh') {
        throw new UnauthorizedException('Refresh tokens cannot be used as access tokens');
      }

      const tenant = await this._tenantGetter.findByClientId(payload.clientId)


      request.tenant = {
        id: tenant._id,
        clientId: tenant.clientId,
      };

      this._tenantContext.setTenantId(tenant._id)


    } catch (e) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
