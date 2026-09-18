import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { TenantContext } from 'src/common/context/tenant.context';
import { ETenantPermission } from 'src/modules/tenant/tenant/enums';
import { TenantGetterService } from 'src/modules/tenant/tenant/services/tenant-getter.service';

@Injectable()
export class TenantPermissionGuard implements CanActivate {
  constructor(
    private _reflector: Reflector,
    private readonly _tenantContext: TenantContext,
    private readonly _tenantGetter: TenantGetterService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const permission = this._reflector.get<ETenantPermission>(
      'permission',
      context.getHandler(),
    );

    const tenantId = this._tenantContext.getTenantId();
    if (!tenantId) throw new NotFoundException('Tenant ID is not provided.');
    const tenant = await this._tenantGetter.findOne(tenantId);

    if (!tenant) throw new UnauthorizedException('Tenant not found.');

    if (tenant.permissions.includes(ETenantPermission.ALL)) {
      return true;
    }

    if (permission && tenant.permissions.includes(permission)) {
      return true;
    }

    throw new UnauthorizedException('You do not have the required permissions.');
  }
}
