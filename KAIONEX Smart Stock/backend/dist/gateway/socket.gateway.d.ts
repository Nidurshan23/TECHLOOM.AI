import { Server } from 'socket.io';
export declare class SocketGateway {
    server: Server;
    emitQueueUpdated(users: unknown): void;
    emitStockUpdated(product: unknown): void;
    emitTimerUpdated(timestamp: number): void;
}
