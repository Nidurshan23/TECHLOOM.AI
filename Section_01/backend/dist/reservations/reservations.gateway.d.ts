import { OnGatewayConnection, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class ReservationsGateway implements OnGatewayInit, OnGatewayConnection {
    server: Server;
    afterInit(): void;
    handleConnection(client: Socket): void;
    emitStockUpdate(payload: unknown): void;
    emitQueueUpdate(payload: unknown): void;
}
