import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateBiopsyDto {
  @ApiProperty()
  @IsMongoId()
  patientId: string;

  @ApiProperty({ example: 'BX-2026-00042' })
  @IsString()
  sampleNumber: string;

  @ApiPropertyOptional({ example: '2026-09-20T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expectedReadyAt?: string;
}
