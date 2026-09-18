import { Global, Module } from '@nestjs/common';
import { TenantApiDashboardController } from './controllers/tenant-api-dashboard.controller';
import { TenantDashboardApiService } from './controllers/tenant-api-dashboard.service';
import { TenantModule } from '../tenant/tenant.module';
import { AccountModule } from 'src/modules/account/account.module';
import { AccountAuthModule } from 'src/modules/auth/account/account-auth.module';

@Global()
@Module({
  imports: [TenantModule, AccountModule, AccountAuthModule],
  controllers: [TenantApiDashboardController],
  providers: [TenantDashboardApiService],
})
export class TenantApiModule { }
