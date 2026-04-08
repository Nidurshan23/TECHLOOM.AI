import { Model, Types } from 'mongoose';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { Reservation, ReservationDocument, ReservationStatus } from './schemas/reservation.schema';
import { ReserveProductDto } from './dto/reserve-product.dto';
import { PurchaseProductDto } from './dto/purchase-product.dto';
import { ReservationsGateway } from './reservations.gateway';
export declare class ReservationsService {
    private readonly reservationModel;
    private readonly productsService;
    private readonly usersService;
    private readonly reservationsGateway;
    constructor(reservationModel: Model<ReservationDocument>, productsService: ProductsService, usersService: UsersService, reservationsGateway: ReservationsGateway);
    reserve(dto: ReserveProductDto): Promise<{
        message: string;
        reservation: (import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Reservation, {}, {}> & Reservation & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }> & Required<{
            _id: Types.ObjectId;
        }>) | null;
    }>;
    purchase(dto: PurchaseProductDto): Promise<{
        message: string;
    }>;
    getQueue(productId: string): Promise<{
        id: string;
        position: number;
        userId: string;
        userName: string;
        productId: string;
        status: ReservationStatus;
        isActive: boolean;
        reservedAt: Date | null;
        expiresAt: Date | null;
        remainingMs: number;
    }[]>;
    expireReservations(): Promise<void>;
    private activateNextReservations;
    private broadcastProductState;
}
