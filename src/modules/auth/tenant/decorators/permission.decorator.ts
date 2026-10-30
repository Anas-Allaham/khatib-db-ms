import { SetMetadata } from '@nestjs/common';
import { ETenantPermission } from '../../../tenant/tenant/enums';

export const Permission = (permission: keyof typeof ETenantPermission) =>
  SetMetadata('permission', permission);
