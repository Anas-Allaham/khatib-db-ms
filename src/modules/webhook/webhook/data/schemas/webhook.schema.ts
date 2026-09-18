import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { WebhookEvents } from '../../enums/webhook-events.enum';

@Schema({ timestamps: true })
export class Webhook extends Document {
  @Prop({ required: true })
  url: string;

  @Prop({ type: [String], enum: WebhookEvents, required: true })
  events: WebhookEvents[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 1 })
  maxRetryAttempts: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Tenant" })
  tenant: Types.ObjectId;
}

export const WebhookSchema = SchemaFactory.createForClass(Webhook);
