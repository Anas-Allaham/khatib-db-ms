import { INestApplication } from '@nestjs/common';
import { Request } from 'express';
import morgan from 'morgan';

/**
 * @description Enable Logging response and request using morgan package
 * skips healthcheck endpoint
 */
export function setupMorganLogger(app: INestApplication) {
  morgan.token('body', (req: Request, _: any, __: any) =>
    JSON.stringify(req.body),
  );
  app.use(
    morgan(
      `:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :body :status :res[content-length] ":referrer" ":user-agent"`,
      {
        skip: (req: any, _: any) => !!req.url?.includes('healthCheck'),
      },
    ),
  );
}
