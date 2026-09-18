import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateWebhookDto } from './create-webhook.dto';
import { Types } from 'mongoose';


export class CreateWebhookDashboardDto extends CreateWebhookDto {
  @ApiProperty({ type: String })
  @IsMongoId()
  tenantId: Types.ObjectId
}
