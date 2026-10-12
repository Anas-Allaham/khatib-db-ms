import { ApiProperty } from '@nestjs/swagger';

export class ImageResponseDto {
  @ApiProperty({ example: 'Biopsy report - page 1' })
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({
    format: 'uri',
    example: 'https://api.example.com/uploads/images/0f8fad5b-d9cb-469f-a165-70867728950e.jpg',
  })
  imageURL: string;
}
