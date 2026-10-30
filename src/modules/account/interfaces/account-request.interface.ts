import { Request } from 'express';
import { AccountDto } from '../dtos/account.dto';
import { TenantDto } from '../../tenant/tenant-api/dtos/tenant.dto';

export interface AccountRequest extends Request {
  account: AccountDto;
  tenant?: TenantDto
}
