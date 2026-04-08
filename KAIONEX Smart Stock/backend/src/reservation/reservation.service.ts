import { Injectable, OnModuleInit } from '@nestjs/common';
import { SocketGateway } from '../gateway/socket.gateway';
import { ProductService } from '../product/product.service';
import { QueueService } from '../queue/queue.service';

const EXPIRATION_CHECK_INTERVAL_MS = 5000;
const TIMER_UPDATE_INTERVAL_MS = 1000;

@Injectable()
export class ReservationService implements OnModuleInit {
  constructor(
    private readonly productService: ProductService,
    private readonly queueService: QueueService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async onModuleInit() {
    await this.resetReservationData();
    await this.queueService.processQueue();
    this.startBackgroundJobs();
  }

  private async resetReservationData() {
    await this.productService.seedProduct();

    const product = await this.productService.getProductDoc();

    await this.queueService.seedUsers(product.id);
    await this.productService.resetProduct();
    await this.queueService.resetUsers(product.id);
  }

  private startBackgroundJobs() {
    setInterval(() => {
      void this.queueService.handleExpiration();
    }, EXPIRATION_CHECK_INTERVAL_MS);

    setInterval(() => {
      this.socketGateway.emitTimerUpdated(Date.now());
    }, TIMER_UPDATE_INTERVAL_MS);
  }
}
