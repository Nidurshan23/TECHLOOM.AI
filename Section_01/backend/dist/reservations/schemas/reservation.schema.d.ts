import { HydratedDocument, Types } from 'mongoose';
export type ReservationDocument = HydratedDocument<Reservation>;
export declare enum ReservationStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    EXPIRED = "expired"
}
export declare class Reservation {
    userId: Types.ObjectId;
    productId: Types.ObjectId;
    status: ReservationStatus;
    reservedAt: Date | null;
    expiresAt: Date | null;
}
export declare const ReservationSchema: import("mongoose").Schema<Reservation, import("mongoose").Model<Reservation, any, any, any, import("mongoose").Document<unknown, any, Reservation, any, {}> & Reservation & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Reservation, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Reservation>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Reservation> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
