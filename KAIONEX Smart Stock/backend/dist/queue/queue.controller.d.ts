import { QueueService } from './queue.service';
export declare class QueueController {
    private readonly queueService;
    constructor(queueService: QueueService);
    getQueue(): Promise<{
        users: {
            userId: string;
            name: string;
            status: import("../common/enums/queue-status.enum").QueueStatus;
            position: number | null;
            expiresAt: number | null;
        }[];
    }>;
    addToQueue(body: {
        userId: string;
        productId?: string;
    }): Promise<{
        product: {
            id: any;
            code: string;
            name: string;
            price: number;
            totalStock: number;
            availableStock: number;
        };
        queue: {
            users: {
                userId: string;
                name: string;
                status: import("../common/enums/queue-status.enum").QueueStatus;
                position: number | null;
                expiresAt: number | null;
            }[];
        };
    }>;
    completePurchase(body: {
        userId: string;
    }): Promise<{
        product: {
            id: any;
            code: string;
            name: string;
            price: number;
            totalStock: number;
            availableStock: number;
        };
        queue: {
            users: {
                userId: string;
                name: string;
                status: import("../common/enums/queue-status.enum").QueueStatus;
                position: number | null;
                expiresAt: number | null;
            }[];
        };
    }>;
}
