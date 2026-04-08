import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import {
  Reservation,
  ReservationDocument,
  ReservationStatus,
} from './schemas/reservation.schema';
import { ReserveProductDto } from './dto/reserve-product.dto';
import { PurchaseProductDto } from './dto/purchase-product.dto';
import { ReservationsGateway } from './reservations.gateway';

const RESERVATION_WINDOW_MS = 5 * 60 * 1000;

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    private readonly reservationsGateway: ReservationsGateway,
  ) {}

  async reserve(dto: ReserveProductDto) {
    const [product, user] = await Promise.all([
      this.productsService.findById(dto.productId),
      this.usersService.findById(dto.userId),
    ]);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (product.stock <= 0) {
      throw new BadRequestException('Out of stock');
    }

    const existingPending = await this.reservationModel.findOne({
      userId: new Types.ObjectId(dto.userId),
      productId: new Types.ObjectId(dto.productId),
      status: ReservationStatus.PENDING,
    });

    if (existingPending) {
      throw new BadRequestException('User already has a pending reservation');
    }

    const reservation = await this.reservationModel.create({
      userId: dto.userId,
      productId: dto.productId,
      status: ReservationStatus.PENDING,
      reservedAt: null,
      expiresAt: null,
    });

    await this.activateNextReservations(dto.productId);
    await this.broadcastProductState(dto.productId);

    const updatedReservation = await this.reservationModel.findById(reservation._id).lean();
    return {
      message: updatedReservation?.reservedAt
        ? 'Reservation created'
        : 'Added to FCFS queue',
      reservation: updatedReservation,
    };
  }

  async purchase(dto: PurchaseProductDto) {
    const product = await this.productsService.findById(dto.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const reservation = await this.reservationModel.findOne({
      userId: new Types.ObjectId(dto.userId),
      productId: new Types.ObjectId(dto.productId),
      status: ReservationStatus.PENDING,
      reservedAt: { $ne: null },
    });

    if (!reservation || !reservation.expiresAt || reservation.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('Reservation expired');
    }

    if (product.stock <= 0) {
      throw new BadRequestException('Out of stock');
    }

    reservation.status = ReservationStatus.COMPLETED;
    reservation.expiresAt = null;
    await reservation.save();

    product.stock -= 1;
    await product.save();

    await this.activateNextReservations(dto.productId);
    await this.broadcastProductState(dto.productId);

    return {
      message: 'Purchase completed',
    };
  }

  async getQueue(productId: string) {
    const reservations = await this.reservationModel
      .find({ productId: new Types.ObjectId(productId) })
      .sort({ createdAt: 1 })
      .lean();

    const users = await this.usersService.findAll();
    const userMap = new Map(users.map((user) => [String(user._id), user.name]));

    return reservations.map((reservation, index) => {
      const now = Date.now();
      const remainingMs =
        reservation.status === ReservationStatus.PENDING && reservation.expiresAt
          ? Math.max(new Date(reservation.expiresAt).getTime() - now, 0)
          : 0;

      return {
        id: String(reservation._id),
        position: index + 1,
        userId: String(reservation.userId),
        userName: userMap.get(String(reservation.userId)) ?? 'Unknown User',
        productId: String(reservation.productId),
        status: reservation.status,
        isActive: Boolean(reservation.reservedAt && reservation.expiresAt && remainingMs > 0),
        reservedAt: reservation.reservedAt,
        expiresAt: reservation.expiresAt,
        remainingMs,
      };
    });
  }

  @Cron(CronExpression.EVERY_SECOND)
  async expireReservations() {
    const now = new Date();
    const expiredReservations = await this.reservationModel.find({
      status: ReservationStatus.PENDING,
      expiresAt: { $ne: null, $lte: now },
    });

    if (expiredReservations.length === 0) {
      return;
    }

    const affectedProducts = new Set<string>();

    for (const reservation of expiredReservations) {
      reservation.status = ReservationStatus.EXPIRED;
      reservation.expiresAt = null;
      await reservation.save();

      affectedProducts.add(String(reservation.productId));

      await this.reservationModel.create({
        userId: reservation.userId,
        productId: reservation.productId,
        status: ReservationStatus.PENDING,
        reservedAt: null,
        expiresAt: null,
      });
    }

    for (const productId of affectedProducts) {
      await this.activateNextReservations(productId);
      await this.broadcastProductState(productId);
    }
  }

  private async activateNextReservations(productId: string) {
    const product = await this.productsService.findById(productId);
    if (!product || product.stock <= 0) {
      return;
    }

    const activeCount = await this.reservationModel.countDocuments({
      productId: new Types.ObjectId(productId),
      status: ReservationStatus.PENDING,
      reservedAt: { $ne: null },
      expiresAt: { $gt: new Date() },
    });

    const availableSlots = Math.max(product.stock - activeCount, 0);
    if (availableSlots === 0) {
      return;
    }

    const waitingReservations = await this.reservationModel
      .find({
        productId: new Types.ObjectId(productId),
        status: ReservationStatus.PENDING,
        reservedAt: null,
      })
      .sort({ createdAt: 1 })
      .limit(availableSlots);

    const now = Date.now();

    for (const reservation of waitingReservations) {
      reservation.reservedAt = new Date(now);
      reservation.expiresAt = new Date(now + RESERVATION_WINDOW_MS);
      await reservation.save();
    }
  }

  private async broadcastProductState(productId: string) {
    const [products, queue] = await Promise.all([
      this.productsService.findAll(),
      this.getQueue(productId),
    ]);

    const product = products.find((item) => String(item._id) === productId);
    if (product) {
      this.reservationsGateway.emitStockUpdate(product);
    }

    this.reservationsGateway.emitQueueUpdate({
      productId,
      queue,
    });
  }
}
