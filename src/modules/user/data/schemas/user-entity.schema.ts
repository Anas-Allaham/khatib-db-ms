import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document<Types.ObjectId> {
  @Prop({ required: true })
  ownerId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true })
  tenant: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
