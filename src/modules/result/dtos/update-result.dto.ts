import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
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

  @ApiPropertyOptional({
    description: "URL of the patient's medical report image.",
    format: 'uri',
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  imageURL?: string;
}
