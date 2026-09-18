import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SwaggerAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Swagger"');
      res.status(401).send('Authentication required');
      return;
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
    const [username, password] = credentials.split(':');

    const validUsername = process.env.SWAGGER_USER || 'admin';
    const validPassword = process.env.SWAGGER_PASSWORD || 'admin';

    if (username !== validUsername || password !== validPassword) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Swagger"');
      res.status(401).send('Authentication required');
      return;
    }

    next();
  }
}
