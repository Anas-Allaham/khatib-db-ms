import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { BiopsyClassification } from '../enums/biopsy-classification.enum';
import { BiopsyStatus } from '../enums/biopsy-status.enum';

export class UpdateBiopsyDto {
  @ApiPropertyOptional({ enum: BiopsyStatus })
  @IsOptional()
  @IsEnum(BiopsyStatus)
  status?: BiopsyStatus;

  @ApiPropertyOptional({ enum: BiopsyClassification })
  @IsOptional()
  @IsEnum(BiopsyClassification)
  classification?: BiopsyClassification;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rawReport?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expectedReadyAt?: string;
}
