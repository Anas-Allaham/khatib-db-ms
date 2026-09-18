import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument, Types } from 'mongoose';

export type BiopsyDocument = HydratedDocument<Biopsy>;

@Schema({ timestamps: true })
export class Biopsy extends Document<Types.ObjectId> {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true })
  patient: Types.ObjectId;

  @Prop({ required: true, index: true })
  sampleNumber: string;

  @Prop({ required: false })
  expectedReadyAt?: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenant: Types.ObjectId;
}

export const BiopsySchema = SchemaFactory.createForClass(Biopsy);
BiopsySchema.index({ tenant: 1, patient: 1, createdAt: -1 });
BiopsySchema.index({ tenant: 1, sampleNumber: 1 }, { unique: true });
