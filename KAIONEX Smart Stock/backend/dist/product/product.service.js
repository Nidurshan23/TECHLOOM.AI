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
exports.ProductService = exports.PRODUCT_CODE = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_1 = require("./product.schema");
exports.PRODUCT_CODE = 'paracetamol-500mg';
const PRODUCT_NAME = 'Paracetamol 500mg';
const PRODUCT_PRICE = 20000;
const PRODUCT_STOCK = 2;
let ProductService = class ProductService {
    constructor(productModel) {
        this.productModel = productModel;
    }
    async seedProduct() {
        await this.productModel.updateOne({ code: exports.PRODUCT_CODE }, {
            $setOnInsert: this.getDefaultProductValues(),
        }, { upsert: true });
    }
    async resetProduct() {
        await this.productModel.updateOne({ code: exports.PRODUCT_CODE }, {
            $set: this.getDefaultProductValues(),
        }, { upsert: true });
    }
    async getProductDoc() {
        const product = await this.productModel.findOne({ code: exports.PRODUCT_CODE }).exec();
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return product;
    }
    async getProduct() {
        const product = await this.getProductDoc();
        return this.serialize(product);
    }
    async reserveOne() {
        return this.productModel
            .findOneAndUpdate({
            code: exports.PRODUCT_CODE,
            availableStock: { $gt: 0 },
        }, {
            $inc: { availableStock: -1 },
        }, { new: true })
            .exec();
    }
    async releaseOne() {
        return this.productModel
            .findOneAndUpdate({ code: exports.PRODUCT_CODE }, {
            $inc: { availableStock: 1 },
        }, { new: true })
            .exec();
    }
    async finalizePurchase() {
        return this.productModel
            .findOneAndUpdate({
            code: exports.PRODUCT_CODE,
            totalStock: { $gt: 0 },
        }, {
            $inc: { totalStock: -1 },
        }, { new: true })
            .exec();
    }
    serialize(product) {
        return {
            id: product.id,
            code: product.code,
            name: product.name,
            price: product.price,
            totalStock: product.totalStock,
            availableStock: product.availableStock,
        };
    }
    getDefaultProductValues() {
        return {
            code: exports.PRODUCT_CODE,
            name: PRODUCT_NAME,
            price: PRODUCT_PRICE,
            totalStock: PRODUCT_STOCK,
            availableStock: PRODUCT_STOCK,
        };
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ProductService);
//# sourceMappingURL=product.service.js.map