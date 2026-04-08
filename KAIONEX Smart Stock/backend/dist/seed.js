"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = require("mongoose");
const queue_status_enum_1 = require("./common/enums/queue-status.enum");
const mongoUri = process.env.MONGODB_URI;
const productSchema = new mongoose_1.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    totalStock: { type: Number, required: true },
    availableStock: { type: Number, required: true },
}, { timestamps: true });
const queueSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    productId: { type: mongoose_1.Types.ObjectId, required: true },
    status: {
        type: String,
        required: true,
        enum: Object.values(queue_status_enum_1.QueueStatus),
        default: queue_status_enum_1.QueueStatus.Idle,
    },
    position: { type: Number, default: null },
    queuedAt: { type: Date, default: null },
    reservedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
}, { timestamps: true });
const ProductModel = mongoose_1.default.model('Product', productSchema);
const QueueModel = mongoose_1.default.model('QueueEntry', queueSchema);
async function seed() {
    if (!mongoUri) {
        throw new Error('MONGODB_URI is missing. Add it to backend/.env before seeding.');
    }
    await mongoose_1.default.connect(mongoUri);
    await ProductModel.updateOne({ code: 'paracetamol-500mg' }, {
        $set: {
            name: 'Paracetamol 500mg',
            price: 20000,
            totalStock: 2,
            availableStock: 2,
        },
        $setOnInsert: {
            code: 'paracetamol-500mg',
        },
    }, { upsert: true });
    const product = await ProductModel.findOne({ code: 'paracetamol-500mg' }).exec();
    if (!product) {
        throw new Error('Product seed failed');
    }
    const users = [
        { userId: 'user1', name: 'User 1' },
        { userId: 'user2', name: 'User 2' },
        { userId: 'user3', name: 'User 3' },
        { userId: 'user4', name: 'User 4' },
        { userId: 'user5', name: 'User 5' },
    ];
    for (const user of users) {
        await QueueModel.updateOne({ userId: user.userId }, {
            $set: {
                name: user.name,
                productId: product._id,
            },
            $setOnInsert: {
                status: queue_status_enum_1.QueueStatus.Idle,
                position: null,
                queuedAt: null,
                reservedAt: null,
                expiresAt: null,
            },
        }, { upsert: true });
    }
    await mongoose_1.default.disconnect();
    console.log('Seed complete');
}
void seed();
//# sourceMappingURL=seed.js.map