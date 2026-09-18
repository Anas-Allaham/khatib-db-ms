import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AppConfig extends Document<Types.ObjectId> {
  @Prop({ type: Types.Map })
  data: any;
}

export const appConfigSchema =
  SchemaFactory.createForClass(AppConfig);
