import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ResultClassification } from '../enums/result-classification.enum';
import { ResultStatus } from '../enums/result-status.enum';

export class CreateResultDto {
  @ApiProperty({ description: 'The biopsy this result belongs to.' })
  @IsMongoId()
  biopsyId: string;

  @ApiProperty({ enum: ResultStatus, default: ResultStatus.DRAFT })
  @IsEnum(ResultStatus)
  status: ResultStatus;

  @ApiProperty({ enum: ResultClassification })
  @IsEnum(ResultClassification)
  classification: ResultClassification;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rawReport?: string;
}
