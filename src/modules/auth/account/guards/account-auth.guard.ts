
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AccountRequest } from '../../../account/interfaces/account-request.interface';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../tenant/decorators';
import { TenantContext } from 'src/common/context/tenant.context';
import { AccountGetterService } from 'src/modules/account/services/account-getter.service';
import { AccountDto } from 'src/modules/account/dtos/account.dto';

@Injectable()
export class AccountAuthGuard implements CanActivate {
  constructor(
    private readonly _jwtService: JwtService,
    private readonly _reflector: Reflector,
    private readonly _tenantContext: TenantContext,
    private readonly _accountGetter: AccountGetterService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this._reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AccountRequest>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this._jwtService.verifyAsync<AccountDto>(
        token,
        {
          secret: process.env.ACCOUNT_JWT_SECRET
        }
      );

      request.account = payload;

      const account = await this._accountGetter.findByIdWithTenant(payload._id)

      if (account?.tenant?.clientId) {
        this._tenantContext.setTenantId(account.tenant._id)

        request.tenant = {
          id: account.tenant._id,
          clientId: account.tenant.clientId,
        };
      }

    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
