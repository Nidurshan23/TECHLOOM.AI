import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import {
  Reservation,
  ReservationDocument,
  ReservationStatus,
} from '../reservations/schemas/reservation.schema';

export interface ProductListItem {
  _id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  availableStock: number;
  lockedStock: number;
}

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    const existingCount = await this.productModel.countDocuments();
    if (existingCount > 0) {
      return;
    }

    await this.productModel.create({
      name: 'KAIONEX Paracetamol 650',
      price: 149,
      stock: 2,
      imageUrl:
        'https://dummyimage.com/600x400/e8f5ff/0f172a.png&text=KAIONEX+Medicine',
    });
  }

  async findAll(): Promise<ProductListItem[]> {
    const products = await this.productModel.find().lean();
    const activeReservations = await this.reservationModel.aggregate<{
      _id: string;
      activeCount: number;
    }>([
      {
        $match: {
          status: ReservationStatus.PENDING,
          reservedAt: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$productId',
          activeCount: { $sum: 1 },
        },
      },
    ]);

    const reservationMap = new Map(
      activeReservations.map((item) => [String(item._id), item.activeCount]),
    );

    return products.map((product) => {
      const activeCount = reservationMap.get(String(product._id)) ?? 0;
      return {
        _id: String(product._id),
        name: product.name,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        availableStock: Math.max(product.stock - activeCount, 0),
        lockedStock: activeCount,
      };
    });
  }

  async findById(productId: string): Promise<ProductDocument | null> {
    return this.productModel.findById(productId);
  }
}
