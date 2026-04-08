import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway {
  @WebSocketServer()
  server!: Server;

  emitQueueUpdated(users: unknown) {
    this.server.emit('queueUpdated', { users });
  }

  emitStockUpdated(product: unknown) {
    this.server.emit('stockUpdated', { product });
  }

  emitTimerUpdated(timestamp: number) {
    this.server.emit('timerUpdated', { timestamp });
  }
}
