import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccountRequest } from '../interfaces/account-request.interface';

export const ReqAccount = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AccountRequest>();
    return request.account;
  },
);
