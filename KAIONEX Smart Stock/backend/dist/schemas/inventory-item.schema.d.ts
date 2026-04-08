import { HydratedDocument } from 'mongoose';
export type InventoryItemDocument = HydratedDocument<InventoryItem>;
export declare class InventoryItem {
    code: string;
    name: string;
    priceLabel: string;
    availableStock: number;
}
export declare const InventoryItemSchema: import("mongoose").Schema<InventoryItem, import("mongoose").Model<InventoryItem, any, any, any, import("mongoose").Document<unknown, any, InventoryItem, any, {}> & InventoryItem & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, InventoryItem, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<InventoryItem>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<InventoryItem> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
