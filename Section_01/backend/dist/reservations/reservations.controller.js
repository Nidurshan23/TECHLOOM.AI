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
exports.ReservationsController = void 0;
const common_1 = require("@nestjs/common");
const purchase_product_dto_1 = require("./dto/purchase-product.dto");
const reserve_product_dto_1 = require("./dto/reserve-product.dto");
const reservations_service_1 = require("./reservations.service");
let ReservationsController = class ReservationsController {
    constructor(reservationsService) {
        this.reservationsService = reservationsService;
    }
    reserve(dto) {
        return this.reservationsService.reserve(dto);
    }
    purchase(dto) {
        return this.reservationsService.purchase(dto);
    }
    getQueue(productId) {
        return this.reservationsService.getQueue(productId);
    }
};
exports.ReservationsController = ReservationsController;
__decorate([
    (0, common_1.Post)('reserve'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reserve_product_dto_1.ReserveProductDto]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "reserve", null);
__decorate([
    (0, common_1.Post)('purchase'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchase_product_dto_1.PurchaseProductDto]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "purchase", null);
__decorate([
    (0, common_1.Get)('queue'),
    __param(0, (0, common_1.Query)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "getQueue", null);
exports.ReservationsController = ReservationsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [reservations_service_1.ReservationsService])
], ReservationsController);
//# sourceMappingURL=reservations.controller.js.map