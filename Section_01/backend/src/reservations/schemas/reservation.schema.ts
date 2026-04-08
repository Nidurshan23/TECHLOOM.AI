import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReservationDocument = HydratedDocument<Reservation>;

export enum ReservationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

@Schema({ timestamps: true, collection: 'kaionex_reservations' })
export class Reservation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Prop({ type: Date, default: null })
  reservedAt: Date | null;

  @Prop({ type: Date, default: null })
  expiresAt: Date | null;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
