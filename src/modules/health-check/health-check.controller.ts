import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck } from '@nestjs/terminus';
import { LocalHealthCheckService } from './health-check.service';
import { SkipAuth } from '../auth/tenant/decorators';

@ApiTags('Health Check')
@SkipAuth()
@Controller({ path: 'healthCheck', version: VERSION_NEUTRAL })
export class HealthCheckController {
  constructor(private readonly healthCheckService: LocalHealthCheckService) { }

  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check();
  }
}
