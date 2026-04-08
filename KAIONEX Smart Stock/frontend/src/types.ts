export type QueueStatus =
  | 'IDLE'
  | 'WAITING'
  | 'RESERVED'
  | 'COMPLETED'
  | 'EXPIRED';

export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  totalStock: number;
  availableStock: number;
}

export interface QueueUser {
  userId: string;
  name: string;
  status: QueueStatus;
  position: number | null;
  expiresAt: number | null;
}

export interface QueueResponse {
  users: QueueUser[];
}

export interface ReservationState {
  product: Product;
  queue: QueueResponse;
}
