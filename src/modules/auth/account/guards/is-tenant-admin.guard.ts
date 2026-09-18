import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AccountRequest } from '../../../account/interfaces/account-request.interface';
import { AccountGetterService } from 'src/modules/account/services/account-getter.service';
import { EAccountRole } from 'src/modules/account/enums/account-role.enum';

@Injectable()
export class IsTenantAdminGuard implements CanActivate {
  constructor(
    private readonly _accountGetter: AccountGetterService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AccountRequest>();

    const accountId = request?.account?._id

    const account = await this._accountGetter.findById(accountId)
    if (!account) throw new UnauthorizedException('You are not authorized.')

    if (account.role !== EAccountRole.ADMIN) throw new UnauthorizedException('You do not have the required role.');

    return true;
  }
}
