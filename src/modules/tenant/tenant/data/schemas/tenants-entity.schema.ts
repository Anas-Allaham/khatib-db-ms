import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument, Types } from 'mongoose';
import { ETenantPermission } from '../../enums';
import mongooseAutoPopulate from 'mongoose-autopopulate';

export type TenantDocument = HydratedDocument<Tenant>;

@Schema({ timestamps: true })
export class Tenant extends Document<Types.ObjectId> {
  @Prop()
  name: string;

  @Prop({ required: true, unique: true, })
  clientId: string;

  @Prop({ required: true })
  clientSecret: string;

  @Prop({ type: [String], enum: ETenantPermission, default: [] })
  permissions: string[];
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
TenantSchema.plugin(mongooseAutoPopulate)

TenantSchema.set('toJSON', {
  transform: (
    doc: unknown,
    ret: any,
  ): Partial<TenantDocument> => {
    delete ret.clientSecret;
    return ret;
  },
});
