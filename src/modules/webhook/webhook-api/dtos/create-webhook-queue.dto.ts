import {
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateWebhookQueueDto {
  @ApiProperty({ type: String })
  @IsMongoId()
  tenantId: Types.ObjectId

  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  payload?: any;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  headers?: any;
}
