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

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
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

  const configService = app.get(ConfigService);
  const port = +configService.get('PORT');

  app.use('/swagger', new SwaggerAuthMiddleware().use);
  swagger(app);
  await setupRedoc(app)
  setupMorganLogger(app);

  await app.listen(port);
  console.log(`The application is listening on port ${port}`);
}
bootstrap();
