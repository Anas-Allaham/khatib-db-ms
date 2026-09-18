import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

export function UserIdHeader() {
  return applyDecorators(ApiHeader({ name: 'user_id', required: true }));
}
