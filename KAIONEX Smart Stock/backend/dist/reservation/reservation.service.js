"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationService = void 0;
const common_1 = require("@nestjs/common");
const socket_gateway_1 = require("../gateway/socket.gateway");
const product_service_1 = require("../product/product.service");
const queue_service_1 = require("../queue/queue.service");
const EXPIRATION_CHECK_INTERVAL_MS = 5000;
const TIMER_UPDATE_INTERVAL_MS = 1000;
let ReservationService = class ReservationService {
    constructor(productService, queueService, socketGateway) {
        this.productService = productService;
        this.queueService = queueService;
        this.socketGateway = socketGateway;
    }
    async onModuleInit() {
        await this.resetReservationData();
        await this.queueService.processQueue();
        this.startBackgroundJobs();
    }
    async resetReservationData() {
        await this.productService.seedProduct();
        const product = await this.productService.getProductDoc();
        await this.queueService.seedUsers(product.id);
        await this.productService.resetProduct();
        await this.queueService.resetUsers(product.id);
    }
    startBackgroundJobs() {
        setInterval(() => {
            void this.queueService.handleExpiration();
        }, EXPIRATION_CHECK_INTERVAL_MS);
        setInterval(() => {
            this.socketGateway.emitTimerUpdated(Date.now());
        }, TIMER_UPDATE_INTERVAL_MS);
    }
};
exports.ReservationService = ReservationService;
exports.ReservationService = ReservationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [product_service_1.ProductService,
        queue_service_1.QueueService,
        socket_gateway_1.SocketGateway])
], ReservationService);
//# sourceMappingURL=reservation.service.js.map