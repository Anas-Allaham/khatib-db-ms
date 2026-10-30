import { Request } from 'express';
import { TenantDto } from '../../tenant-api/dtos/tenant.dto';

export interface TenantRequest extends Request {
  tenant: TenantDto;
}
