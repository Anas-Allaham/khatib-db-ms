import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { BiopsyClassification } from '../enums/biopsy-classification.enum';
import { BiopsyStatus } from '../enums/biopsy-status.enum';

export class CreateBiopsyDto {
  @ApiProperty()
  @IsMongoId()
  patientId: string;

  @ApiProperty({ example: 'BX-2026-00042' })
  @IsString()
  sampleNumber: string;

  @ApiProperty({ enum: BiopsyStatus, default: BiopsyStatus.PENDING })
  @IsEnum(BiopsyStatus)
  status: BiopsyStatus;

  @ApiPropertyOptional({ enum: BiopsyClassification })
  @IsOptional()
  @IsEnum(BiopsyClassification)
  classification?: BiopsyClassification;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rawReport?: string;

  @ApiPropertyOptional({ example: '2026-09-20T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expectedReadyAt?: string;
}
