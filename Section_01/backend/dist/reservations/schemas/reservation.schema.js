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
exports.ReservationSchema = exports.Reservation = exports.ReservationStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var ReservationStatus;
(function (ReservationStatus) {
    ReservationStatus["PENDING"] = "pending";
    ReservationStatus["COMPLETED"] = "completed";
    ReservationStatus["EXPIRED"] = "expired";
})(ReservationStatus || (exports.ReservationStatus = ReservationStatus = {}));
let Reservation = class Reservation {
};
exports.Reservation = Reservation;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Reservation.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Product', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Reservation.prototype, "productId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ReservationStatus,
        default: ReservationStatus.PENDING,
    }),
    __metadata("design:type", String)
], Reservation.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Reservation.prototype, "reservedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Reservation.prototype, "expiresAt", void 0);
exports.Reservation = Reservation = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'kaionex_reservations' })
], Reservation);
exports.ReservationSchema = mongoose_1.SchemaFactory.createForClass(Reservation);
//# sourceMappingURL=reservation.schema.js.map