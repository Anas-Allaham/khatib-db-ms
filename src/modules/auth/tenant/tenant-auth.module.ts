import { Module } from '@nestjs/common';
import { TenantAuthController } from './controllers/tenant-auth.controller';
import { TenantAuthApiService } from './controllers/tenant-auth-api.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TenantAuthService } from './services/tenant-auth.service';
import { TenantAuthGuard } from './guards/tenant-auth.guard';
import { TenantPermissionGuard } from './guards/tenant-permission.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('TENANT_JWT_SECRET'),
        signOptions: { expiresIn: '3600s' },
      }),
    }),
  ],
  controllers: [TenantAuthController],
  providers: [
    TenantAuthApiService,
    TenantAuthService,
    TenantAuthGuard,
    TenantPermissionGuard
  ],
  exports: [
    TenantAuthGuard,
    TenantPermissionGuard
  ]
})
export class TenantAuthModule { };