import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigApiDashboardController } from './app-config-api-dashboard.controller';
import { AppConfigApiDashboardService } from './app-config-api-dashboard.service';
import { AppConfigRepository } from './data/repositories/app-config.repository';
import { AppConfigSeed } from './data/seed/app-config.seed';
import { AppConfig, appConfigSchema } from './data/schemas/app-config-entity.schema';
import { AccountModule } from '../account/account.module';



@Module({
  imports: [
    AccountModule,
    MongooseModule.forFeature([{ name: AppConfig.name, schema: appConfigSchema }])
  ],
  controllers: [AppConfigApiDashboardController],
  providers: [AppConfigApiDashboardService, AppConfigRepository, AppConfigSeed],
  exports: [AppConfigRepository, AppConfigSeed]
})
export class AppConfigApiModule { }
