import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { UUID_ID } from '../../../database/uuid-id.js';

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop(UUID_ID)
  _id!: string;

  @Prop({ type: String, required: true, lowercase: true, trim: true })
  email!: string;

  // select: false → nunca sale en las consultas salvo que se pida expresamente.
  @Prop({ type: String, required: true, select: false })
  passwordHash!: string;

  @Prop({ type: String, required: true, trim: true, maxlength: 80 })
  name!: string;

  @Prop({ type: String })
  avatarUrl?: string;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 }, { unique: true });
