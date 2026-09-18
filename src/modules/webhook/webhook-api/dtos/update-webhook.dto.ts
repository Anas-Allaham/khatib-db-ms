import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateWebhookDto } from './create-webhook.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateWebhookDto extends PartialType(CreateWebhookDto) {
  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
