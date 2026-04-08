import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  },
})
export class ReservationsGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('Socket.IO gateway ready');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  emitStockUpdate(payload: unknown) {
    this.server.emit('stockUpdate', payload);
  }

  emitQueueUpdate(payload: unknown) {
    this.server.emit('queueUpdate', payload);
  }
}
