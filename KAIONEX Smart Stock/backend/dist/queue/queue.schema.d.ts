import { HydratedDocument, Types } from 'mongoose';
import { QueueStatus } from '../common/enums/queue-status.enum';
export type QueueEntryDocument = HydratedDocument<QueueEntry>;
export declare class QueueEntry {
    userId: string;
    name: string;
    productId: Types.ObjectId;
    status: QueueStatus;
    position: number | null;
    queuedAt: Date | null;
    reservedAt: Date | null;
    expiresAt: Date | null;
}
export declare const QueueEntrySchema: import("mongoose").Schema<QueueEntry, import("mongoose").Model<QueueEntry, any, any, any, import("mongoose").Document<unknown, any, QueueEntry, any, {}> & QueueEntry & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, QueueEntry, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<QueueEntry>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<QueueEntry> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
