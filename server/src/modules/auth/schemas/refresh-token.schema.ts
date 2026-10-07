import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { UUID_ID } from '../../../database/uuid-id.js';

@Schema({ collection: 'refreshTokens', timestamps: true })
export class RefreshToken {
  @Prop(UUID_ID)
  _id!: string;

  @Prop({ type: String, ref: 'User', required: true })
  userId!: string;

  // SHA-256 del token, nunca el token: quien lea la base de datos no puede usarlo.
  @Prop({ type: String, required: true })
  tokenHash!: string;

  // Cadena de rotación: si se reutiliza un token viejo, se revoca toda la familia.
  @Prop({ type: String, required: true })
  family!: string;

  @Prop({ type: Date, required: true })
  expiresAt!: Date;

  @Prop({ type: Date, default: null })
  revokedAt!: Date | null;
}

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
RefreshTokenSchema.index({ tokenHash: 1 }, { unique: true });
RefreshTokenSchema.index({ userId: 1, family: 1 });
// TTL: Mongo borra solo los tokens vencidos.
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
