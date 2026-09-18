import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function swagger(app: INestApplication) {
  const document = createDocument(app);
  SwaggerModule.setup('swagger', app, document);
}

const ENV = process.env.NODE_ENV ?? 'Dev';

function createDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle(`Nestjs Template ${ENV}`)
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
      name: 'Authorization',
      description: 'Enter your Bearer token',
    })
    .addSecurityRequirements('bearer')
    .build();
  return SwaggerModule.createDocument(app, config);
}
