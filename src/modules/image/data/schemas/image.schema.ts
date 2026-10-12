import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument, Types } from 'mongoose';

export type ImageDocument = HydratedDocument<Image>;

@Schema({ timestamps: true })
export class Image extends Document<Types.ObjectId> {
  @Prop({ required: true, trim: true })
  name: string;

  // URL path relative to PUBLIC_BASE_URL, e.g. /uploads/images/<uuid>.png
  @Prop({ required: true, unique: true })
  path: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  createdAt: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenant: Types.ObjectId;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
ImageSchema.index({ tenant: 1, createdAt: -1 });
