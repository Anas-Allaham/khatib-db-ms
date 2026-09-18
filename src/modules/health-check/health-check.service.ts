import { Injectable } from '@nestjs/common';
import { HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';

@Injectable()
export class LocalHealthCheckService {
  constructor(
    private healthCheckService: HealthCheckService,
    private db: MongooseHealthIndicator,
  ) {}

  async check() {
    return this.healthCheckService
      .check([() => this.db.pingCheck('mongoose')])
      .then(() => {
        return { status: 'available', code: 200 };
      })
      .catch((error) => {
        return { status: error.status, message: error.message };
      });
  }
}
