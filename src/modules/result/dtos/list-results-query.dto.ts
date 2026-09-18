import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class ListResultsQueryDto {
  @ApiProperty({ description: 'Biopsy id whose results should be listed.' })
  @IsMongoId()
  biopsyId: string;
}
