import { Model } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
export declare const PRODUCT_CODE = "paracetamol-500mg";
export declare class ProductService {
    private readonly productModel;
    constructor(productModel: Model<ProductDocument>);
    seedProduct(): Promise<void>;
    resetProduct(): Promise<void>;
    getProductDoc(): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Product, {}, {}> & Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Product, {}, {}> & Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    getProduct(): Promise<{
        id: any;
        code: string;
        name: string;
        price: number;
        totalStock: number;
        availableStock: number;
    }>;
    reserveOne(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Product, {}, {}> & Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Product, {}, {}> & Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
    releaseOne(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Product, {}, {}> & Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Product, {}, {}> & Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
    finalizePurchase(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Product, {}, {}> & Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Product, {}, {}> & Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
    serialize(product: ProductDocument): {
        id: any;
        code: string;
        name: string;
        price: number;
        totalStock: number;
        availableStock: number;
    };
    private getDefaultProductValues;
}
