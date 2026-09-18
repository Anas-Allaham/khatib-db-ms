import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class UserDto {
  @ApiProperty()
  _id: Types.ObjectId;

  @ApiProperty()
  ownerId!: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(params: Partial<UserDto>) {
    Object.assign(this, params);
  }
}
