import { IsString, IsArray, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WebhookEvents } from '../../webhook/enums/webhook-events.enum';


export class CreateWebhookDto {
  @ApiProperty({ type: String })
  @IsString()
  url: string;

  @ApiProperty({ enum: WebhookEvents, isArray: true })
  @IsArray()
  @IsEnum(WebhookEvents, { each: true })
  events: WebhookEvents[];

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  maxRetryAttempts: number = 1;

  //   @IsOptional()
  //   @ValidateNested()
  //   @Type(() => MetadataDto)
  //   metadata?: MetadataDto;
}
