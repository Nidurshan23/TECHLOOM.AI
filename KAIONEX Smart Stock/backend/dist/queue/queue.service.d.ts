import { Model } from 'mongoose';
import { QueueStatus } from '../common/enums/queue-status.enum';
import { SocketGateway } from '../gateway/socket.gateway';
import { ProductService } from '../product/product.service';
import { QueueEntryDocument } from './queue.schema';
export declare class QueueService {
    private readonly queueModel;
    private readonly productService;
    private readonly socketGateway;
    private processingChain;
    constructor(queueModel: Model<QueueEntryDocument>, productService: ProductService, socketGateway: SocketGateway);
    seedUsers(productId: string): Promise<void>;
    resetUsers(productId: string): Promise<void>;
    getQueue(): Promise<{
        users: {
            userId: string;
            name: string;
            status: QueueStatus;
            position: number | null;
            expiresAt: number | null;
        }[];
    }>;
    getState(): Promise<{
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
                status: QueueStatus;
                position: number | null;
                expiresAt: number | null;
            }[];
        };
    }>;
    addToQueue(userId: string, productId?: string): Promise<{
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
                status: QueueStatus;
                position: number | null;
                expiresAt: number | null;
            }[];
        };
    }>;
    completePurchase(userId: string): Promise<{
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
                status: QueueStatus;
                position: number | null;
                expiresAt: number | null;
            }[];
        };
    }>;
    processQueue(): Promise<void>;
    handleExpiration(): Promise<void>;
    broadcastState(): Promise<void>;
    private processQueueInternal;
    private getFormattedUsers;
    private getNextPosition;
    private isUserAlreadyQueued;
    private clearQueueFields;
    private withLock;
}
