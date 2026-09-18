import { Module } from '@nestjs/common';
import { AccountAuthController } from './controllers/account-auth.controller';
import { AccountAuthApiService } from './controllers/account-auth-api.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccountModule } from 'src/modules/account/account.module';
import { AccountAuthService } from './services/account-auth.service';
import { AccountPasswordResetterService } from './services/account-password-resetter.service';
import { AccountPasswordVerifierService } from './services/account-password-verifier.service';
import { AccountDashboardController } from './controllers/account-dashboard.controller';
import { AccountDashboardApiService } from './controllers/account-dashboard-api.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('ACCOUNT_JWT_SECRET'),
      }),
    }),
    AccountModule
  ],
  controllers: [AccountAuthController, AccountDashboardController],
  providers: [AccountAuthApiService, AccountAuthService, AccountPasswordResetterService, AccountPasswordVerifierService, AccountDashboardApiService],
  exports: [AccountPasswordResetterService]
})
export class AccountAuthModule { };