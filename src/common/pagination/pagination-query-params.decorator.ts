import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { LIMIT_DEFAULT, PaginationDto, SKIP_DEFAULT } from './pagination.dto';

export const PaginationQuery = createParamDecorator(
  (pass: 'DEFAULT' | 'NONE' = 'DEFAULT', context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    const query = request.query;
    if (pass == 'DEFAULT') {
      const limit = query.limit
        ? parseInt(query.limit?.toString())
        : LIMIT_DEFAULT;
      const skip = query.skip ? parseInt(query.skip?.toString()) : SKIP_DEFAULT;
      return new PaginationDto({ limit, skip });
    } else {
      const limit = query.limit ? parseInt(query.limit?.toString()) : undefined;
      const skip = query.skip ? parseInt(query.skip?.toString()) : undefined;
      return new PaginationDto({ limit, skip });
    }
  },
);

export function HasPagination() {
  return applyDecorators(ApiQuery({ type: PaginationDto }));
}
