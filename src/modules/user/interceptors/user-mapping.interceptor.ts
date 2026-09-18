import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotAcceptableException,
} from '@nestjs/common';
import { UserUpsetterService } from '../services/user-upsetter.service';

@Injectable()
export class UserMappingInterceptor implements NestInterceptor {
  constructor(private readonly userService: UserUpsetterService) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request = context.switchToHttp().getRequest();

    const userId = request.headers.user_id || '';

    if (!userId) {
      throw new NotAcceptableException('user_id is missing');
    }
    request.user = await this.userService.upsert(userId);

    return next.handle();
  }
}
