import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { enableVersioning } from './common/utils/versioning';
import { swagger } from './common/utils/swagger';
import { setupMorganLogger } from './common/morgan/morgan';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { setupRedoc } from './common/utils/docs';
import { MongooseExceptionFilter } from './common/error-handling/mongoose-exception.filter';
import { SwaggerAuthMiddleware } from './common/middlewares/swagger-auth.middleware';
import { ValidationPipe } from '@nestjs/common';
import { IMAGE_PUBLIC_PREFIX, IMAGE_UPLOAD_ROOT } from './modules/image/constants/image-upload.constants';
import type { Express } from 'express';
import type { IncomingMessage, ServerResponse } from 'http';
import { AppConfigSeed } from './modules/app-config/data/seed/app-config.seed';
import { AccountSeed } from './modules/account/data/seed/account.seed';

async function createApp() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Seeds are idempotent. They run before init so SynAppConfigService caches the seeded app config.
  await app.get(AppConfigSeed).run();
  await app.get(AccountSeed).run();
  app.set('query parser', 'extended');

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new MongooseExceptionFilter());

  app.enableCors();
  app.useStaticAssets(IMAGE_UPLOAD_ROOT, {
    prefix: IMAGE_PUBLIC_PREFIX,
    index: false,
    dotfiles: 'deny',
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
  });

  enableVersioning(app);

  app.use('/swagger', new SwaggerAuthMiddleware().use);
  swagger(app);
  await setupRedoc(app)
  setupMorganLogger(app);

  return app;
}

async function bootstrap() {
  const app = await createApp();
  const configService = app.get(ConfigService);
  const port = +configService.get('PORT');

  await app.listen(port);
  console.log(`The application is listening on port ${port}`);
}

// Vercel imports this file as a serverless function and calls the default export per request,
// so the app is initialised once per instance instead of listening on a port.
let server: Promise<Express> | undefined;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  server ??= createApp().then(async (app) => {
    await app.init();
    return app.getHttpAdapter().getInstance() as Express;
  });
  (await server)(req, res);
}

if (!process.env.VERCEL) {
  bootstrap();
}
