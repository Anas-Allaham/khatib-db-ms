import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument, Types } from 'mongoose';
import { BiopsyStatus } from '../../enums/biopsy-status.enum';
import { BiopsyClassification } from '../../enums/biopsy-classification.enum';

export type BiopsyDocument = HydratedDocument<Biopsy>;

@Schema({ timestamps: true })
export class Biopsy extends Document<Types.ObjectId> {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true })
  patient: Types.ObjectId;

  @Prop({ required: true, index: true })
  sampleNumber: string;

  @Prop({ required: true, enum: BiopsyStatus, default: BiopsyStatus.PENDING, index: true })
  status: BiopsyStatus;

  @Prop({ required: false, enum: BiopsyClassification })
  classification?: BiopsyClassification;

  @Prop({ required: false })
  rawReport?: string;

  @Prop({ required: false })
  expectedReadyAt?: Date;

  @Prop({ required: false })
  completedAt?: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenant: Types.ObjectId;
}

export const BiopsySchema = SchemaFactory.createForClass(Biopsy);
BiopsySchema.index({ tenant: 1, patient: 1, createdAt: -1 });
BiopsySchema.index({ tenant: 1, sampleNumber: 1 }, { unique: true });
