import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthCheckModule } from './modules/health-check/health-check.module';
import { UserModule } from './modules/user/user.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';
import { AccountModule } from './modules/account/account.module';
import { CommandModule } from 'nestjs-command';
import { JwtModule } from '@nestjs/jwt';
import { TenantApiModule } from './modules/tenant/tenant-api/tenant-api.module';
import { mongoTransformIdPlugin } from './mongo-plugins/mongo-transform-id-plugin';
import { AppConfigApiModule } from './modules/app-config/app-config-api.module';
import { WebhookApiModule } from './modules/webhook/webhook-api/webhook-api.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { PatientModule } from './modules/patient/patient.module';
import { BiopsyModule } from './modules/biopsy/biopsy.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: async () => {
        mongoose.plugin((schema) => {
          mongoTransformIdPlugin(schema)
        })
        mongoose.plugin(mongooseDelete, {
          deletedAt: true,
          overrideMethods: 'all',
        });
        return {
          uri: process.env.DATABASE_URL,
        };
      },
    }),
    JwtModule.register({ global: true }),
    CommandModule,
    CommonModule,
    AppConfigApiModule,
    HealthCheckModule,
    UserModule,
    AuthModule,
    AccountModule,
    TenantApiModule,
    WebhookApiModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    PatientModule,
    BiopsyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
