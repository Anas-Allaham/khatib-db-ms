import { SetMetadata } from '@nestjs/common';
import { ETenantPermission } from 'src/modules/tenant/tenant/enums';

export const Permission = (permission: keyof typeof ETenantPermission) =>
  SetMetadata('permission', permission);
