import { ApiProperty } from '@nestjs/swagger';
import { WebhookEvents } from '../../webhook/enums/webhook-events.enum';


export class WebhookDto {
  @ApiProperty({ type: String })
  url: string;

  @ApiProperty({ enum: WebhookEvents, isArray: true })
  events: WebhookEvents[];

  @ApiProperty({ type: Boolean })
  isActive: boolean;

  @ApiProperty({ type: Number })
  maxRetryAttempts: number = 1;

}
