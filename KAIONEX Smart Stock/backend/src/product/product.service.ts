import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './product.schema';

export const PRODUCT_CODE = 'paracetamol-500mg';
const PRODUCT_NAME = 'Paracetamol 500mg';
const PRODUCT_PRICE = 20000;
const PRODUCT_STOCK = 2;

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async seedProduct() {
    await this.productModel.updateOne(
      { code: PRODUCT_CODE },
      {
        $setOnInsert: this.getDefaultProductValues(),
      },
      { upsert: true },
    );
  }

  async resetProduct() {
    await this.productModel.updateOne(
      { code: PRODUCT_CODE },
      {
        $set: this.getDefaultProductValues(),
      },
      { upsert: true },
    );
  }

  async getProductDoc() {
    const product = await this.productModel.findOne({ code: PRODUCT_CODE }).exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async getProduct() {
    const product = await this.getProductDoc();
    return this.serialize(product);
  }

  async reserveOne() {
    return this.productModel
      .findOneAndUpdate(
        {
          code: PRODUCT_CODE,
          availableStock: { $gt: 0 },
        },
        {
          $inc: { availableStock: -1 },
        },
        { new: true },
      )
      .exec();
  }

  async releaseOne() {
    return this.productModel
      .findOneAndUpdate(
        { code: PRODUCT_CODE },
        {
          $inc: { availableStock: 1 },
        },
        { new: true },
      )
      .exec();
  }

  async finalizePurchase() {
    return this.productModel
      .findOneAndUpdate(
        {
          code: PRODUCT_CODE,
          totalStock: { $gt: 0 },
        },
        {
          $inc: { totalStock: -1 },
        },
        { new: true },
      )
      .exec();
  }

  serialize(product: ProductDocument) {
    return {
      id: product.id,
      code: product.code,
      name: product.name,
      price: product.price,
      totalStock: product.totalStock,
      availableStock: product.availableStock,
    };
  }

  private getDefaultProductValues() {
    return {
      code: PRODUCT_CODE,
      name: PRODUCT_NAME,
      price: PRODUCT_PRICE,
      totalStock: PRODUCT_STOCK,
      availableStock: PRODUCT_STOCK,
    };
  }
}
