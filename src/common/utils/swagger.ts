import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Vercel only bundles files that are require()d, so swagger-ui-dist's static assets are missing there.
const SWAGGER_UI_CDN = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.31.0';

export function swagger(app: INestApplication) {
  const document = createDocument(app);
  SwaggerModule.setup('swagger', app, document, process.env.VERCEL ? {
    customCssUrl: `${SWAGGER_UI_CDN}/swagger-ui.css`,
    customJs: [`${SWAGGER_UI_CDN}/swagger-ui-bundle.js`, `${SWAGGER_UI_CDN}/swagger-ui-standalone-preset.js`],
    customfavIcon: `${SWAGGER_UI_CDN}/favicon-32x32.png`,
  } : undefined);
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
