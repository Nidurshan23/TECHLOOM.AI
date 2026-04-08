import { OnModuleInit } from '@nestjs/common';
import { SocketGateway } from '../gateway/socket.gateway';
import { ProductService } from '../product/product.service';
import { QueueService } from '../queue/queue.service';
export declare class ReservationService implements OnModuleInit {
    private readonly productService;
    private readonly queueService;
    private readonly socketGateway;
    constructor(productService: ProductService, queueService: QueueService, socketGateway: SocketGateway);
    onModuleInit(): Promise<void>;
    private resetReservationData;
    private startBackgroundJobs;
}
