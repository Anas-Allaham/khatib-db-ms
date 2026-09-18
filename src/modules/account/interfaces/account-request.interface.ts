import { Request } from 'express';
import { AccountDto } from 'src/modules/account/dtos/account.dto';
import { TenantDto } from 'src/modules/tenant/tenant-api/dtos/tenant.dto';

export interface AccountRequest extends Request {
  account: AccountDto;
  tenant?: TenantDto
}
