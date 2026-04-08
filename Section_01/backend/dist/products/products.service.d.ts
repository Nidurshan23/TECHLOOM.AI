import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { ProductDocument } from './schemas/product.schema';
import { ReservationDocument } from '../reservations/schemas/reservation.schema';
export interface ProductListItem {
    _id: string;
    name: string;
    price: number;
    stock: number;
    imageUrl: string;
    availableStock: number;
    lockedStock: number;
}
export declare class ProductsService implements OnModuleInit {
    private readonly productModel;
    private readonly reservationModel;
    constructor(productModel: Model<ProductDocument>, reservationModel: Model<ReservationDocument>);
    onModuleInit(): Promise<void>;
    findAll(): Promise<ProductListItem[]>;
    findById(productId: string): Promise<ProductDocument | null>;
}
