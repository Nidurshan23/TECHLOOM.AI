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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_1 = require("./schemas/product.schema");
const reservation_schema_1 = require("../reservations/schemas/reservation.schema");
let ProductsService = class ProductsService {
    constructor(productModel, reservationModel) {
        this.productModel = productModel;
        this.reservationModel = reservationModel;
    }
    async onModuleInit() {
        const existingCount = await this.productModel.countDocuments();
        if (existingCount > 0) {
            return;
        }
        await this.productModel.create({
            name: 'KAIONEX Paracetamol 650',
            price: 149,
            stock: 2,
            imageUrl: 'https://dummyimage.com/600x400/e8f5ff/0f172a.png&text=KAIONEX+Medicine',
        });
    }
    async findAll() {
        const products = await this.productModel.find().lean();
        const activeReservations = await this.reservationModel.aggregate([
            {
                $match: {
                    status: reservation_schema_1.ReservationStatus.PENDING,
                    reservedAt: { $ne: null },
                },
            },
            {
                $group: {
                    _id: '$productId',
                    activeCount: { $sum: 1 },
                },
            },
        ]);
        const reservationMap = new Map(activeReservations.map((item) => [String(item._id), item.activeCount]));
        return products.map((product) => {
            const activeCount = reservationMap.get(String(product._id)) ?? 0;
            return {
                _id: String(product._id),
                name: product.name,
                price: product.price,
                stock: product.stock,
                imageUrl: product.imageUrl,
                availableStock: Math.max(product.stock - activeCount, 0),
                lockedStock: activeCount,
            };
        });
    }
    async findById(productId) {
        return this.productModel.findById(productId);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(1, (0, mongoose_1.InjectModel)(reservation_schema_1.Reservation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ProductsService);
//# sourceMappingURL=products.service.js.map