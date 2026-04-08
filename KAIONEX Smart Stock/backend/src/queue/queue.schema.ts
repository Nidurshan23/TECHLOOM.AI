import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { QueueStatus } from '../common/enums/queue-status.enum';

export type QueueEntryDocument = HydratedDocument<QueueEntry>;

@Schema({ timestamps: true })
export class QueueEntry {
  @Prop({ required: true, unique: true })
  userId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId!: Types.ObjectId;

  @Prop({
    required: true,
    enum: Object.values(QueueStatus),
    default: QueueStatus.Idle,
  })
  status!: QueueStatus;

  @Prop({ type: Number, default: null })
  position!: number | null;

  @Prop({ type: Date, default: null })
  queuedAt!: Date | null;

  @Prop({ type: Date, default: null })
  reservedAt!: Date | null;

  @Prop({ type: Date, default: null })
  expiresAt!: Date | null;
}

export const QueueEntrySchema = SchemaFactory.createForClass(QueueEntry);
