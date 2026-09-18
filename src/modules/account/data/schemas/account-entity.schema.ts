import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument, Types } from 'mongoose';
import { EAccountRole } from 'src/modules/account/enums/account-role.enum';

export type AccountDocument = HydratedDocument<Account>;

@Schema({ timestamps: true })
export class Account extends Document<Types.ObjectId> {
  @Prop()
  name: string;

  @Prop({ unique: true })
  email: string;

  @Prop({ type: String, enum: EAccountRole, default: EAccountRole.ADMIN })
  role: string;

  @Prop()
  password: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: false })
  tenant?: Types.ObjectId;
}

export const AccountSchema = SchemaFactory.createForClass(Account);

AccountSchema.set('toJSON', {
  transform: (
    doc: unknown,
    ret: any,
  ): Partial<AccountDocument> => {
    delete ret.password;
    return ret;
  },
});
