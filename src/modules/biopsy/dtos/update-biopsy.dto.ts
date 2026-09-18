import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateBiopsyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sampleNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expectedReadyAt?: string;
}
