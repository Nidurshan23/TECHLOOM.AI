"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const socket_gateway_1 = require("./gateway/socket.gateway");
const product_controller_1 = require("./product/product.controller");
const product_schema_1 = require("./product/product.schema");
const product_service_1 = require("./product/product.service");
const queue_controller_1 = require("./queue/queue.controller");
const queue_schema_1 = require("./queue/queue.schema");
const queue_service_1 = require("./queue/queue.service");
const reservation_service_1 = require("./reservation/reservation.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            mongoose_1.MongooseModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const mongoUri = configService.get('MONGODB_URI');
                    if (!mongoUri) {
                        throw new Error('MONGODB_URI is missing. Add it to backend/.env.');
                    }
                    return {
                        uri: mongoUri,
                    };
                },
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: product_schema_1.Product.name, schema: product_schema_1.ProductSchema },
                { name: queue_schema_1.QueueEntry.name, schema: queue_schema_1.QueueEntrySchema },
            ]),
        ],
        controllers: [product_controller_1.ProductController, queue_controller_1.QueueController],
        providers: [product_service_1.ProductService, queue_service_1.QueueService, reservation_service_1.ReservationService, socket_gateway_1.SocketGateway],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map