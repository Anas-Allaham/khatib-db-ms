import { applyDecorators, ConflictException, UseGuards } from '@nestjs/common';
import { AccountAuthGuard } from '../../account/guards/account-auth.guard';
import { TenantAuthGuard } from '../../tenant/guards/tenant-auth.guard';
import { TenantPermissionGuard } from '../../tenant/guards/tenant-permission.guard';

export function AuthenticationGuard(
  auth: 'Tenant' | 'Account',
) {
  if (auth === 'Tenant') {
    return applyDecorators(
      UseGuards(TenantAuthGuard, TenantPermissionGuard)
    );
  } else if (auth === 'Account') {
    return applyDecorators(
      UseGuards(AccountAuthGuard)
    );
  }
  else {
    throw new ConflictException(`${auth} is not implemented.`)
  }
}
