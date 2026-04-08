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
exports.InventoryItemSchema = exports.InventoryItem = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let InventoryItem = class InventoryItem {
};
exports.InventoryItem = InventoryItem;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "code", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "priceLabel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0, default: 2 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "availableStock", void 0);
exports.InventoryItem = InventoryItem = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], InventoryItem);
exports.InventoryItemSchema = mongoose_1.SchemaFactory.createForClass(InventoryItem);
//# sourceMappingURL=inventory-item.schema.js.map