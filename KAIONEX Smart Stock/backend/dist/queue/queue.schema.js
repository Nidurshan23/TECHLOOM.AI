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
exports.QueueEntrySchema = exports.QueueEntry = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const queue_status_enum_1 = require("../common/enums/queue-status.enum");
let QueueEntry = class QueueEntry {
};
exports.QueueEntry = QueueEntry;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], QueueEntry.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], QueueEntry.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Product', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], QueueEntry.prototype, "productId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: Object.values(queue_status_enum_1.QueueStatus),
        default: queue_status_enum_1.QueueStatus.Idle,
    }),
    __metadata("design:type", String)
], QueueEntry.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: null }),
    __metadata("design:type", Object)
], QueueEntry.prototype, "position", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], QueueEntry.prototype, "queuedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], QueueEntry.prototype, "reservedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], QueueEntry.prototype, "expiresAt", void 0);
exports.QueueEntry = QueueEntry = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], QueueEntry);
exports.QueueEntrySchema = mongoose_1.SchemaFactory.createForClass(QueueEntry);
//# sourceMappingURL=queue.schema.js.map