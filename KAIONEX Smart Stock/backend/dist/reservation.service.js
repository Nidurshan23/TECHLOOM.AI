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
exports.ReservationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const inventory_item_schema_1 = require("./schemas/inventory-item.schema");
const reservation_user_schema_1 = require("./schemas/reservation-user.schema");
const RESERVATION_TIME_MS = 30 * 1000;
const ITEM_CODE = 'paracetamol-500mg';
let ReservationService = class ReservationService {
    constructor(inventoryItemModel, reservationUserModel) {
        this.inventoryItemModel = inventoryItemModel;
        this.reservationUserModel = reservationUserModel;
    }
    async onModuleInit() {
        await this.ensureSeedData();
        await this.syncQueueState();
    }
    async getState() {
        await this.syncQueueState();
        return this.buildState();
    }
    async joinQueue(userId) {
        await this.syncQueueState();
        const [item, user] = await Promise.all([
            this.getInventoryItem(),
            this.reservationUserModel.findOne({ externalId: userId }).exec(),
        ]);
        if (item.availableStock <= 0) {
            throw new common_1.BadRequestException('Out of stock');
        }
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!['Idle', 'Expired'].includes(user.status)) {
            throw new common_1.BadRequestException('User is already in the reservation flow');
        }
        const lastQueuedUser = await this.reservationUserModel
            .findOne({ queuePosition: { $ne: null } })
            .sort({ queuePosition: -1 })
            .exec();
        user.status = 'Waiting';
        user.queuePosition = (lastQueuedUser?.queuePosition ?? 0) + 1;
        user.expiresAt = null;
        await user.save();
        await this.syncQueueState();
        return this.buildState();
    }
    async completePurchase(userId) {
        await this.syncQueueState();
        const [item, user] = await Promise.all([
            this.getInventoryItem(),
            this.reservationUserModel.findOne({ externalId: userId }).exec(),
        ]);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.status !== 'Pending') {
            throw new common_1.BadRequestException('Only pending users can complete purchase');
        }
        if (item.availableStock <= 0) {
            throw new common_1.BadRequestException('Out of stock');
        }
        user.status = 'Completed';
        user.queuePosition = null;
        user.expiresAt = null;
        await user.save();
        item.availableStock -= 1;
        await item.save();
        await this.syncQueueState();
        return this.buildState();
    }
    async ensureSeedData() {
        const existingItem = await this.inventoryItemModel
            .findOne({ code: ITEM_CODE })
            .exec();
        if (!existingItem) {
            await this.inventoryItemModel.create({
                code: ITEM_CODE,
                name: 'Paracetamol 500mg',
                priceLabel: 'Rp 20.000',
                availableStock: 2,
            });
        }
        const userCount = await this.reservationUserModel.countDocuments().exec();
        if (userCount === 0) {
            await this.reservationUserModel.insertMany([
                { externalId: 'u1', name: 'User 1', status: 'Idle' },
                { externalId: 'u2', name: 'User 2', status: 'Idle' },
                { externalId: 'u3', name: 'User 3', status: 'Idle' },
                { externalId: 'u4', name: 'User 4', status: 'Idle' },
                { externalId: 'u5', name: 'User 5', status: 'Idle' },
            ]);
        }
    }
    async syncQueueState() {
        const item = await this.getInventoryItem();
        const now = new Date();
        await this.reservationUserModel
            .updateMany({
            status: 'Pending',
            expiresAt: { $ne: null, $lte: now },
        }, {
            $set: {
                status: 'Expired',
                expiresAt: null,
                queuePosition: null,
            },
        })
            .exec();
        if (item.availableStock <= 0) {
            return;
        }
        const activePendingUser = await this.reservationUserModel
            .findOne({ status: 'Pending' })
            .exec();
        if (activePendingUser) {
            return;
        }
        const nextWaitingUser = await this.reservationUserModel
            .findOne({ status: 'Waiting', queuePosition: { $ne: null } })
            .sort({ queuePosition: 1, createdAt: 1 })
            .exec();
        if (!nextWaitingUser) {
            return;
        }
        nextWaitingUser.status = 'Pending';
        nextWaitingUser.expiresAt = new Date(Date.now() + RESERVATION_TIME_MS);
        await nextWaitingUser.save();
    }
    async buildState() {
        const [item, users] = await Promise.all([
            this.getInventoryItem(),
            this.reservationUserModel
                .find()
                .sort({ createdAt: 1 })
                .lean()
                .exec(),
        ]);
        const queue = users
            .filter((user) => user.queuePosition !== null)
            .sort((a, b) => (a.queuePosition ?? 0) - (b.queuePosition ?? 0))
            .map((user) => user.externalId);
        return {
            item: {
                code: item.code,
                name: item.name,
                priceLabel: item.priceLabel,
                availableStock: item.availableStock,
            },
            queue,
            users: users.map((user) => ({
                id: user.externalId,
                name: user.name,
                status: user.status,
                expiresAt: user.expiresAt ? new Date(user.expiresAt).getTime() : undefined,
            })),
        };
    }
    async getInventoryItem() {
        const item = await this.inventoryItemModel.findOne({ code: ITEM_CODE }).exec();
        if (!item) {
            throw new common_1.NotFoundException('Inventory item not found');
        }
        return item;
    }
};
exports.ReservationService = ReservationService;
exports.ReservationService = ReservationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(inventory_item_schema_1.InventoryItem.name)),
    __param(1, (0, mongoose_1.InjectModel)(reservation_user_schema_1.ReservationUser.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ReservationService);
//# sourceMappingURL=reservation.service.js.map