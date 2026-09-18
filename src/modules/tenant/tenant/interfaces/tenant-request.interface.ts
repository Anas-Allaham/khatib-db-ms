import { Request } from 'express';
import { TenantDto } from 'src/modules/tenant/tenant-api/dtos/tenant.dto';

export interface TenantRequest extends Request {
  tenant: TenantDto;
}
