import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument, Types } from 'mongoose';

export type PatientDocument = HydratedDocument<Patient>;

@Schema({ timestamps: true })
export class Patient extends Document<Types.ObjectId> {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, index: true })
  normalizedFullName: string;

  @Prop({ required: true })
  dateOfBirth: string;

  @Prop({ required: false })
  phoneLast4?: string;

  @Prop({ required: false, index: true })
  medicalRecordNumber?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenant: Types.ObjectId;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
PatientSchema.index({ tenant: 1, normalizedFullName: 1 });
PatientSchema.index({ tenant: 1, medicalRecordNumber: 1 }, { sparse: true });
