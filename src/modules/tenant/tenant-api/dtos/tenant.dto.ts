import { ApiProperty } from '@nestjs/swagger';
import { Properties } from 'src/common/utils/properties.utils';
import { Types } from 'mongoose';

export class TenantDto {
  @ApiProperty()
  id: Types.ObjectId

  @ApiProperty()
  clientId: string;

  constructor(raw: Properties<TenantDto>) {
    Object.assign(this, raw)
  }
}
