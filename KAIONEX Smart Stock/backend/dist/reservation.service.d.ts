import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { InventoryItemDocument } from './schemas/inventory-item.schema';
import { ReservationUserDocument } from './schemas/reservation-user.schema';
export declare class ReservationService implements OnModuleInit {
    private readonly inventoryItemModel;
    private readonly reservationUserModel;
    constructor(inventoryItemModel: Model<InventoryItemDocument>, reservationUserModel: Model<ReservationUserDocument>);
    onModuleInit(): Promise<void>;
    getState(): Promise<{
        item: {
            code: string;
            name: string;
            priceLabel: string;
            availableStock: number;
        };
        queue: string[];
        users: {
            id: string;
            name: string;
            status: "Idle" | "Waiting" | "Pending" | "Completed" | "Expired";
            expiresAt: number | undefined;
        }[];
    }>;
    joinQueue(userId: string): Promise<{
        item: {
            code: string;
            name: string;
            priceLabel: string;
            availableStock: number;
        };
        queue: string[];
        users: {
            id: string;
            name: string;
            status: "Idle" | "Waiting" | "Pending" | "Completed" | "Expired";
            expiresAt: number | undefined;
        }[];
    }>;
    completePurchase(userId: string): Promise<{
        item: {
            code: string;
            name: string;
            priceLabel: string;
            availableStock: number;
        };
        queue: string[];
        users: {
            id: string;
            name: string;
            status: "Idle" | "Waiting" | "Pending" | "Completed" | "Expired";
            expiresAt: number | undefined;
        }[];
    }>;
    private ensureSeedData;
    private syncQueueState;
    private buildState;
    private getInventoryItem;
}
