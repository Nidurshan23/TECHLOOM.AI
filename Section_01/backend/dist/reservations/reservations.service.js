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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const products_service_1 = require("../products/products.service");
const users_service_1 = require("../users/users.service");
const reservation_schema_1 = require("./schemas/reservation.schema");
const reservations_gateway_1 = require("./reservations.gateway");
const RESERVATION_WINDOW_MS = 5 * 60 * 1000;
let ReservationsService = class ReservationsService {
    constructor(reservationModel, productsService, usersService, reservationsGateway) {
        this.reservationModel = reservationModel;
        this.productsService = productsService;
        this.usersService = usersService;
        this.reservationsGateway = reservationsGateway;
    }
    async reserve(dto) {
        const [product, user] = await Promise.all([
            this.productsService.findById(dto.productId),
            this.usersService.findById(dto.userId),
        ]);
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (product.stock <= 0) {
            throw new common_1.BadRequestException('Out of stock');
        }
        const existingPending = await this.reservationModel.findOne({
            userId: new mongoose_2.Types.ObjectId(dto.userId),
            productId: new mongoose_2.Types.ObjectId(dto.productId),
            status: reservation_schema_1.ReservationStatus.PENDING,
        });
        if (existingPending) {
            throw new common_1.BadRequestException('User already has a pending reservation');
        }
        const reservation = await this.reservationModel.create({
            userId: dto.userId,
            productId: dto.productId,
            status: reservation_schema_1.ReservationStatus.PENDING,
            reservedAt: null,
            expiresAt: null,
        });
        await this.activateNextReservations(dto.productId);
        await this.broadcastProductState(dto.productId);
        const updatedReservation = await this.reservationModel.findById(reservation._id).lean();
        return {
            message: updatedReservation?.reservedAt
                ? 'Reservation created'
                : 'Added to FCFS queue',
            reservation: updatedReservation,
        };
    }
    async purchase(dto) {
        const product = await this.productsService.findById(dto.productId);
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const reservation = await this.reservationModel.findOne({
            userId: new mongoose_2.Types.ObjectId(dto.userId),
            productId: new mongoose_2.Types.ObjectId(dto.productId),
            status: reservation_schema_1.ReservationStatus.PENDING,
            reservedAt: { $ne: null },
        });
        if (!reservation || !reservation.expiresAt || reservation.expiresAt.getTime() <= Date.now()) {
            throw new common_1.BadRequestException('Reservation expired');
        }
        if (product.stock <= 0) {
            throw new common_1.BadRequestException('Out of stock');
        }
        reservation.status = reservation_schema_1.ReservationStatus.COMPLETED;
        reservation.expiresAt = null;
        await reservation.save();
        product.stock -= 1;
        await product.save();
        await this.activateNextReservations(dto.productId);
        await this.broadcastProductState(dto.productId);
        return {
            message: 'Purchase completed',
        };
    }
    async getQueue(productId) {
        const reservations = await this.reservationModel
            .find({ productId: new mongoose_2.Types.ObjectId(productId) })
            .sort({ createdAt: 1 })
            .lean();
        const users = await this.usersService.findAll();
        const userMap = new Map(users.map((user) => [String(user._id), user.name]));
        return reservations.map((reservation, index) => {
            const now = Date.now();
            const remainingMs = reservation.status === reservation_schema_1.ReservationStatus.PENDING && reservation.expiresAt
                ? Math.max(new Date(reservation.expiresAt).getTime() - now, 0)
                : 0;
            return {
                id: String(reservation._id),
                position: index + 1,
                userId: String(reservation.userId),
                userName: userMap.get(String(reservation.userId)) ?? 'Unknown User',
                productId: String(reservation.productId),
                status: reservation.status,
                isActive: Boolean(reservation.reservedAt && reservation.expiresAt && remainingMs > 0),
                reservedAt: reservation.reservedAt,
                expiresAt: reservation.expiresAt,
                remainingMs,
            };
        });
    }
    async expireReservations() {
        const now = new Date();
        const expiredReservations = await this.reservationModel.find({
            status: reservation_schema_1.ReservationStatus.PENDING,
            expiresAt: { $ne: null, $lte: now },
        });
        if (expiredReservations.length === 0) {
            return;
        }
        const affectedProducts = new Set();
        for (const reservation of expiredReservations) {
            reservation.status = reservation_schema_1.ReservationStatus.EXPIRED;
            reservation.expiresAt = null;
            await reservation.save();
            affectedProducts.add(String(reservation.productId));
            await this.reservationModel.create({
                userId: reservation.userId,
                productId: reservation.productId,
                status: reservation_schema_1.ReservationStatus.PENDING,
                reservedAt: null,
                expiresAt: null,
            });
        }
        for (const productId of affectedProducts) {
            await this.activateNextReservations(productId);
            await this.broadcastProductState(productId);
        }
    }
    async activateNextReservations(productId) {
        const product = await this.productsService.findById(productId);
        if (!product || product.stock <= 0) {
            return;
        }
        const activeCount = await this.reservationModel.countDocuments({
            productId: new mongoose_2.Types.ObjectId(productId),
            status: reservation_schema_1.ReservationStatus.PENDING,
            reservedAt: { $ne: null },
            expiresAt: { $gt: new Date() },
        });
        const availableSlots = Math.max(product.stock - activeCount, 0);
        if (availableSlots === 0) {
            return;
        }
        const waitingReservations = await this.reservationModel
            .find({
            productId: new mongoose_2.Types.ObjectId(productId),
            status: reservation_schema_1.ReservationStatus.PENDING,
            reservedAt: null,
        })
            .sort({ createdAt: 1 })
            .limit(availableSlots);
        const now = Date.now();
        for (const reservation of waitingReservations) {
            reservation.reservedAt = new Date(now);
            reservation.expiresAt = new Date(now + RESERVATION_WINDOW_MS);
            await reservation.save();
        }
    }
    async broadcastProductState(productId) {
        const [products, queue] = await Promise.all([
            this.productsService.findAll(),
            this.getQueue(productId),
        ]);
        const product = products.find((item) => String(item._id) === productId);
        if (product) {
            this.reservationsGateway.emitStockUpdate(product);
        }
        this.reservationsGateway.emitQueueUpdate({
            productId,
            queue,
        });
    }
};
exports.ReservationsService = ReservationsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_SECOND),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReservationsService.prototype, "expireReservations", null);
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(reservation_schema_1.Reservation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        products_service_1.ProductsService,
        users_service_1.UsersService,
        reservations_gateway_1.ReservationsGateway])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map