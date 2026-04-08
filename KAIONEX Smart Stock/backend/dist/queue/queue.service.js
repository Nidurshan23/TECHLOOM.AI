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
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const queue_status_enum_1 = require("../common/enums/queue-status.enum");
const socket_gateway_1 = require("../gateway/socket.gateway");
const product_service_1 = require("../product/product.service");
const queue_schema_1 = require("./queue.schema");
const FIVE_MINUTES_MS = 5 * 60 * 1000;
const SEEDED_USERS = [
    { userId: 'user1', name: 'User 1' },
    { userId: 'user2', name: 'User 2' },
    { userId: 'user3', name: 'User 3' },
    { userId: 'user4', name: 'User 4' },
    { userId: 'user5', name: 'User 5' },
];
let QueueService = class QueueService {
    constructor(queueModel, productService, socketGateway) {
        this.queueModel = queueModel;
        this.productService = productService;
        this.socketGateway = socketGateway;
        this.processingChain = Promise.resolve();
    }
    async seedUsers(productId) {
        const mongoProductId = new mongoose_2.Types.ObjectId(productId);
        for (const user of SEEDED_USERS) {
            await this.queueModel.updateOne({ userId: user.userId }, {
                $setOnInsert: {
                    userId: user.userId,
                    name: user.name,
                    productId: mongoProductId,
                    status: queue_status_enum_1.QueueStatus.Idle,
                    position: null,
                    queuedAt: null,
                    reservedAt: null,
                    expiresAt: null,
                },
            }, { upsert: true });
        }
    }
    async resetUsers(productId) {
        const mongoProductId = new mongoose_2.Types.ObjectId(productId);
        await this.queueModel.updateMany({}, {
            $set: {
                productId: mongoProductId,
                status: queue_status_enum_1.QueueStatus.Idle,
                position: null,
                queuedAt: null,
                reservedAt: null,
                expiresAt: null,
            },
        });
    }
    async getQueue() {
        return {
            users: await this.getFormattedUsers(),
        };
    }
    async getState() {
        return {
            product: await this.productService.getProduct(),
            queue: await this.getQueue(),
        };
    }
    async addToQueue(userId, productId) {
        return this.withLock(async () => {
            const product = await this.productService.getProductDoc();
            const user = await this.queueModel.findOne({ userId }).exec();
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            if (productId && productId !== product.id) {
                throw new common_1.BadRequestException('Invalid product');
            }
            if (this.isUserAlreadyQueued(user.status)) {
                throw new common_1.BadRequestException('User is already in the queue');
            }
            user.productId = product._id;
            user.status = queue_status_enum_1.QueueStatus.Waiting;
            user.position = await this.getNextPosition();
            user.queuedAt = new Date();
            user.reservedAt = null;
            user.expiresAt = null;
            await user.save();
            await this.processQueueInternal();
            await this.broadcastState();
            return this.getState();
        });
    }
    async completePurchase(userId) {
        return this.withLock(async () => {
            const user = await this.queueModel.findOne({ userId }).exec();
            if (!user || user.status !== queue_status_enum_1.QueueStatus.Reserved) {
                throw new common_1.BadRequestException('User does not have an active reservation');
            }
            await this.productService.finalizePurchase();
            this.clearQueueFields(user, queue_status_enum_1.QueueStatus.Completed);
            await user.save();
            await this.processQueueInternal();
            await this.broadcastState();
            return this.getState();
        });
    }
    async processQueue() {
        return this.withLock(async () => {
            await this.processQueueInternal();
            await this.broadcastState();
        });
    }
    async handleExpiration() {
        return this.withLock(async () => {
            const expiredUsers = await this.queueModel
                .find({
                status: queue_status_enum_1.QueueStatus.Reserved,
                expiresAt: { $ne: null, $lte: new Date() },
            })
                .sort({ position: 1 })
                .exec();
            if (expiredUsers.length === 0) {
                return;
            }
            for (const user of expiredUsers) {
                this.clearQueueFields(user, queue_status_enum_1.QueueStatus.Idle);
                await user.save();
                await this.productService.releaseOne();
            }
            await this.processQueueInternal();
            await this.broadcastState();
        });
    }
    async broadcastState() {
        const state = await this.getState();
        this.socketGateway.emitQueueUpdated(state.queue.users);
        this.socketGateway.emitStockUpdated(state.product);
    }
    async processQueueInternal() {
        let product = await this.productService.getProductDoc();
        const waitingUsers = await this.queueModel
            .find({
            position: { $ne: null },
            status: { $in: [queue_status_enum_1.QueueStatus.Waiting, queue_status_enum_1.QueueStatus.Expired] },
        })
            .sort({ position: 1, queuedAt: 1 })
            .exec();
        for (const user of waitingUsers) {
            if (product.availableStock <= 0) {
                break;
            }
            const updatedProduct = await this.productService.reserveOne();
            if (!updatedProduct) {
                break;
            }
            product = updatedProduct;
            user.status = queue_status_enum_1.QueueStatus.Reserved;
            user.reservedAt = new Date();
            user.expiresAt = new Date(Date.now() + FIVE_MINUTES_MS);
            await user.save();
        }
    }
    async getFormattedUsers() {
        const users = await this.queueModel.find().sort({ name: 1 }).lean().exec();
        const usersInQueue = users
            .filter((user) => user.position !== null)
            .sort((firstUser, secondUser) => (firstUser.position ?? 0) - (secondUser.position ?? 0));
        const normalizedPositions = new Map();
        usersInQueue.forEach((user, index) => {
            normalizedPositions.set(user.userId, index + 1);
        });
        return users.map((user) => ({
            userId: user.userId,
            name: user.name,
            status: user.status,
            position: normalizedPositions.get(user.userId) ?? null,
            expiresAt: user.expiresAt ? new Date(user.expiresAt).getTime() : null,
        }));
    }
    async getNextPosition() {
        const lastUser = await this.queueModel
            .findOne({ position: { $ne: null } })
            .sort({ position: -1 })
            .exec();
        return (lastUser?.position ?? 0) + 1;
    }
    isUserAlreadyQueued(status) {
        return (status === queue_status_enum_1.QueueStatus.Waiting ||
            status === queue_status_enum_1.QueueStatus.Reserved ||
            status === queue_status_enum_1.QueueStatus.Expired);
    }
    clearQueueFields(user, status) {
        user.status = status;
        user.position = null;
        user.queuedAt = null;
        user.reservedAt = null;
        user.expiresAt = null;
    }
    async withLock(task) {
        const nextRun = this.processingChain.then(task, task);
        this.processingChain = nextRun.then(() => undefined, () => undefined);
        return nextRun;
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(queue_schema_1.QueueEntry.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        product_service_1.ProductService,
        socket_gateway_1.SocketGateway])
], QueueService);
//# sourceMappingURL=queue.service.js.map