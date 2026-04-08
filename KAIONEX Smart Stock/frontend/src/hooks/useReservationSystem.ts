import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { Product, QueueResponse, QueueUser, ReservationState } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

const EMPTY_PRODUCT: Product = {
  id: '',
  code: 'paracetamol-500mg',
  name: 'Paracetamol 500mg',
  price: 20000,
  totalStock: 2,
  availableStock: 0,
};

export function useReservationSystem() {
  const [product, setProduct] = useState<Product>(EMPTY_PRODUCT);
  const [users, setUsers] = useState<QueueUser[]>([]);
  const [now, setNow] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);

  function applyState(state: ReservationState) {
    setProduct(state.product);
    setUsers(state.queue.users);
  }

  async function loadInitialState() {
    try {
      const [productResponse, queueResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/product`),
        fetch(`${API_BASE_URL}/queue`),
      ]);

      if (!productResponse.ok || !queueResponse.ok) {
        throw new Error('Unable to load reservation data');
      }

      const productData: Product = await productResponse.json();
      const queueData: QueueResponse = await queueResponse.json();

      setProduct(productData);
      setUsers(queueData.users);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to load reservation data',
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadInitialState();

    const socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.on('queueUpdated', (payload: QueueResponse) => {
      setUsers(payload.users);
    });

    socket.on('stockUpdated', (payload: { product: Product }) => {
      setProduct(payload.product);
    });

    socket.on('timerUpdated', (payload: { timestamp: number }) => {
      setNow(payload.timestamp);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  async function joinQueue(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/queue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          productId: product.id,
        }),
      });

      const state: ReservationState = await response.json();

      if (!response.ok) {
        throw new Error((state as { message?: string }).message ?? 'Unable to join queue');
      }

      applyState(state);
      toast.success('User added to the queue');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to join queue');
    }
  }

  async function completePurchase(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/queue/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const state: ReservationState = await response.json();

      if (!response.ok) {
        throw new Error(
          (state as { message?: string }).message ?? 'Unable to complete purchase',
        );
      }

      applyState(state);
      toast.success('Purchase completed');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to complete purchase',
      );
    }
  }

  return {
    product,
    users,
    now,
    isLoading,
    joinQueue,
    completePurchase,
  };
}
