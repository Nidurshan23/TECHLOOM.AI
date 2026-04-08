import { HydratedDocument } from 'mongoose';
export declare const USER_STATUSES: readonly ["Idle", "Waiting", "Pending", "Completed", "Expired"];
export type UserStatus = (typeof USER_STATUSES)[number];
export type ReservationUserDocument = HydratedDocument<ReservationUser>;
export declare class ReservationUser {
    externalId: string;
    name: string;
    status: UserStatus;
    queuePosition: number | null;
    expiresAt: Date | null;
}
export declare const ReservationUserSchema: import("mongoose").Schema<ReservationUser, import("mongoose").Model<ReservationUser, any, any, any, import("mongoose").Document<unknown, any, ReservationUser, any, {}> & ReservationUser & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ReservationUser, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ReservationUser>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ReservationUser> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
