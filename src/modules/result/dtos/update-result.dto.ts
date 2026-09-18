import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ResultClassification } from '../enums/result-classification.enum';
import { ResultStatus } from '../enums/result-status.enum';

export class UpdateResultDto {
  @ApiPropertyOptional({ enum: ResultStatus })
  @IsOptional()
  @IsEnum(ResultStatus)
  status?: ResultStatus;

  @ApiPropertyOptional({ enum: ResultClassification })
  @IsOptional()
  @IsEnum(ResultClassification)
  classification?: ResultClassification;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rawReport?: string;
}
