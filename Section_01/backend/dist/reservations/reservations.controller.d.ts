import { PurchaseProductDto } from './dto/purchase-product.dto';
import { ReserveProductDto } from './dto/reserve-product.dto';
import { ReservationsService } from './reservations.service';
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
    reserve(dto: ReserveProductDto): Promise<{
        message: string;
        reservation: (import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./schemas/reservation.schema").Reservation, {}, {}> & import("./schemas/reservation.schema").Reservation & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }> & Required<{
            _id: import("mongoose").Types.ObjectId;
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
        status: import("./schemas/reservation.schema").ReservationStatus;
        isActive: boolean;
        reservedAt: Date | null;
        expiresAt: Date | null;
        remainingMs: number;
    }[]>;
}
