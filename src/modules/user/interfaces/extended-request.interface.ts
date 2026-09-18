import { Request } from 'express';
import { UserDto } from '../dtos/user.dto';

export interface ExtendedRequest extends Request {
  user: UserDto;
}
