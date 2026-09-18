import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument, Types } from 'mongoose';
import { ResultStatus } from '../../enums/result-status.enum';
import { ResultClassification } from '../../enums/result-classification.enum';

export type ResultDocument = HydratedDocument<Result>;

@Schema({ timestamps: true })
export class Result extends Document<Types.ObjectId> {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Biopsy', required: true, index: true })
  biopsy: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true })
  patient: Types.ObjectId;

  @Prop({ required: true, enum: ResultStatus, default: ResultStatus.DRAFT, index: true })
  status: ResultStatus;

  @Prop({ required: true, enum: ResultClassification })
  classification: ResultClassification;

  @Prop({ required: false })
  rawReport?: string;

  @Prop({ required: false })
  issuedAt?: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenant: Types.ObjectId;
}

export const ResultSchema = SchemaFactory.createForClass(Result);
ResultSchema.index({ tenant: 1, biopsy: 1, createdAt: -1 });
ResultSchema.index({ tenant: 1, patient: 1, createdAt: -1 });
