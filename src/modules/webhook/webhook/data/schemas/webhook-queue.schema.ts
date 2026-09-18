import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument, Types } from 'mongoose';
import { WebhookQueueStatus } from '../../enums/webhook-queue-status.enum';

export type WebhookQueueDocument = HydratedDocument<WebhookQueue>;

@Schema({ timestamps: true })
export class WebhookQueue extends Document<Types.ObjectId> {
  @Prop({ required: true })
  url: string;

  @Prop({ type: Types.Map, required: true })
  payload: any;

  @Prop({ required: true, default: 'POST' })
  method: string;

  @Prop({ type: Types.Map, default: {} })
  headers: any;

  @Prop({ required: true, enum: WebhookQueueStatus, default: WebhookQueueStatus.PENDING })
  status: WebhookQueueStatus;

  @Prop({ default: 0 })
  attemptNumber: number;

  @Prop({ required: false })
  statusCode?: number;

  @Prop({ required: false })
  response?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Webhook" })
  webhookId: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Tenant" })
  tenant: Types.ObjectId;

  @Prop({ required: true, index: true })
  executeDate: Date;
}

export const WebhookQueueSchema = SchemaFactory.createForClass(WebhookQueue);