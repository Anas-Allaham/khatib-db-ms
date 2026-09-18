import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export const SKIP_DEFAULT = 0;
export const LIMIT_DEFAULT = 10;

export class PaginationDto {
  @ApiProperty({ type: Number, default: SKIP_DEFAULT, required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => +value)
  skip!: number;

  @ApiProperty({ type: Number, default: LIMIT_DEFAULT, required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => +value)
  limit!: number;

  constructor(params: Partial<PaginationDto>) {
    Object.assign(this, {
      skip: params?.skip || SKIP_DEFAULT,
      limit: params?.limit || LIMIT_DEFAULT
    });
  }
}
