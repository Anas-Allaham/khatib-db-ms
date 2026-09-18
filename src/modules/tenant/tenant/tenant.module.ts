import { Global, Module } from '@nestjs/common';
import { TenantCreatorService } from './services/tenant-creator.service';
import { TenantGetterService } from './services/tenant-getter.service';
import { AccountModule } from '../../account/account.module';
import { TenantRepository } from './data/repositories/tenant.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from './data/schemas/tenants-entity.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
    AccountModule,
  ],
  providers: [
    TenantCreatorService,
    TenantGetterService,
    TenantRepository,
  ],
  exports: [TenantCreatorService, TenantGetterService, TenantRepository],
})
export class TenantModule { }
