import { Global, Module } from '@nestjs/common';
import { AppConfigService } from './services/app-config.service';
import { SynAppConfigService } from './services/sync-app-config.service';
import { AppConfigApiModule } from 'src/modules/app-config/app-config-api.module';

@Global()
@Module({
  imports: [AppConfigApiModule],
  providers: [
    AppConfigService,
    SynAppConfigService
  ],
  exports: [
    AppConfigService,
    SynAppConfigService
  ]
})
export class AppConfigModule { }
