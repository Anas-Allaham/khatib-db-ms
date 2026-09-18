import { Module } from '@nestjs/common';
import { AccountAuthModule } from './account/account-auth.module';
import { TenantAuthModule } from './tenant/tenant-auth.module';

@Module({
  imports: [
    AccountAuthModule,
    TenantAuthModule
  ],
  controllers: [],
  providers: [],
})
export class AuthModule { };