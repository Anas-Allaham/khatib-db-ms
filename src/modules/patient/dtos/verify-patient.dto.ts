import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class VerifyPatientDto {
  @ApiProperty({ example: 'أحمد محمد علي' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ example: '1990-05-14' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateOfBirth must be YYYY-MM-DD' })
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: '4821' })
  @IsOptional()
  @Matches(/^\d{4}$/, { message: 'phoneLast4 must contain exactly 4 digits' })
  phoneLast4?: string;
}
