import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongoTransactionService } from './services/mongo-transaction.service';
import { HashService } from './services/hash.service';
import { SecretKeyGeneratorService } from './services/secret-key-generator.service';
import { TenantContext } from './context/tenant.context';
import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { AppConfigModule } from './app-config/app-config.module';

const services = [
  MongoTransactionService,
  HashService,
  SecretKeyGeneratorService,
  TenantContext,

];

@Global()
@Module({
  imports: [AppConfigModule],
  providers: [...services,

  {
    provide: AsyncLocalStorage,
    useValue: new AsyncLocalStorage(),
  },
  ],
  exports: [...services, AsyncLocalStorage],
})
export class CommonModule implements NestModule {
  constructor(
    private readonly _tenantContext: TenantContext
  ) { }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: Request, res: Response, next: any) => {
        const store = new Map<string, Types.ObjectId>()
        this._tenantContext.run(store, () => next());
      })
      .forRoutes('{*splat}');
  }
}