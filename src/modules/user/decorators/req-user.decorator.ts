import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ExtendedRequest } from '../interfaces/extended-request.interface';
import { UserDto } from '../dtos/user.dto';

export const ReqUser = createParamDecorator(
  (request: ExtendedRequest, ctx: ExecutionContext): UserDto => {
    request = ctx.switchToHttp().getRequest<ExtendedRequest>();
    return request.user as UserDto;
  },
);
