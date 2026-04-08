import { ReservationService } from './reservation.service';
export declare class ReservationController {
    private readonly reservationService;
    constructor(reservationService: ReservationService);
    getState(): Promise<{
        item: {
            code: string;
            name: string;
            priceLabel: string;
            availableStock: number;
        };
        queue: string[];
        users: {
            id: string;
            name: string;
            status: "Idle" | "Waiting" | "Pending" | "Completed" | "Expired";
            expiresAt: number | undefined;
        }[];
    }>;
    joinQueue(userId: string): Promise<{
        item: {
            code: string;
            name: string;
            priceLabel: string;
            availableStock: number;
        };
        queue: string[];
        users: {
            id: string;
            name: string;
            status: "Idle" | "Waiting" | "Pending" | "Completed" | "Expired";
            expiresAt: number | undefined;
        }[];
    }>;
    completePurchase(userId: string): Promise<{
        item: {
            code: string;
            name: string;
            priceLabel: string;
            availableStock: number;
        };
        queue: string[];
        users: {
            id: string;
            name: string;
            status: "Idle" | "Waiting" | "Pending" | "Completed" | "Expired";
            expiresAt: number | undefined;
        }[];
    }>;
}
