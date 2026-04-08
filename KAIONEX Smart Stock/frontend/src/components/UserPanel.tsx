import React from 'react';
import { Users } from 'lucide-react';
import { Product, QueueUser } from '../types';
import { MedicineCard } from './MedicineCard';

interface UserPanelProps {
  product: Product;
  users: QueueUser[];
  now: number;
  isLoading: boolean;
  onBuy: (userId: string) => void;
  onComplete: (userId: string) => void;
}

export function UserPanel({
  product,
  users,
  now,
  isLoading,
  onBuy,
  onComplete,
}: UserPanelProps) {
  return (
    <div className="user-panel">
      <div className="panel-title-row">
        <div className="panel-title-icon panel-title-icon--blue">
          <Users className="panel-title-icon__image" />
        </div>
        <div>
          <h2 className="panel-title">User Panel</h2>
          <p className="panel-subtitle">Queue with first-come, first-served reservations</p>
        </div>
      </div>

      <div className="stock-summary">
        <p className="stock-summary__label">Available Stock</p>
        <div className="stock-summary__content">
          <div>
            <p className="stock-summary__name">{product.name}</p>
            <p className="stock-summary__price">Rp {product.price.toLocaleString('id-ID')}</p>
          </div>
          <p className="stock-summary__count">{product.availableStock}</p>
        </div>
      </div>

      <div className="user-panel__list custom-scrollbar">
        {isLoading && users.length === 0 ? (
          <div className="empty-box">Loading reservation data...</div>
        ) : null}

        {users.map((user) => (
          <MedicineCard
            key={user.userId}
            product={product}
            user={user}
            now={now}
            onBuy={onBuy}
            onComplete={onComplete}
          />
        ))}
      </div>
    </div>
  );
}
