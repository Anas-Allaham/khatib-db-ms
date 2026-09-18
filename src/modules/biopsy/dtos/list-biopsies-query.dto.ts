import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class ListBiopsiesQueryDto {
  @ApiProperty({ description: 'Patient id whose results should be listed.' })
  @IsMongoId()
  patientId: string;
}
