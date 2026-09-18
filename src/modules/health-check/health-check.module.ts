import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthCheckController } from './health-check.controller';
import { LocalHealthCheckService } from './health-check.service';

@Module({
  imports: [TerminusModule],
  controllers: [HealthCheckController],
  providers: [LocalHealthCheckService],
})
export class HealthCheckModule {}
