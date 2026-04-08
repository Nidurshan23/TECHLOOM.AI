import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ShoppingCart,
  XCircle,
} from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import { Product, QueueStatus, QueueUser } from '../types';

interface MedicineCardProps {
  product: Product;
  user: QueueUser;
  now: number;
  onBuy: (userId: string) => void;
  onComplete: (userId: string) => void;
}

const statusClassNames: Record<QueueStatus, string> = {
  IDLE: 'status-badge status-badge--idle',
  WAITING: 'status-badge status-badge--waiting',
  RESERVED: 'status-badge status-badge--reserved',
  COMPLETED: 'status-badge status-badge--completed',
  EXPIRED: 'status-badge status-badge--expired',
};

export function MedicineCard({
  product,
  user,
  now,
  onBuy,
  onComplete,
}: MedicineCardProps) {
  const isOutOfStock = product.availableStock <= 0;
  const cardClassName =
    user.status === 'RESERVED'
      ? 'medicine-card medicine-card--reserved'
      : 'medicine-card';

  function renderButton() {
    if (user.status === 'COMPLETED') {
      return (
        <button disabled className="action-button action-button--done">
          Purchased
        </button>
      );
    }

    if (user.status === 'RESERVED') {
      return (
        <button
          onClick={() => onComplete(user.userId)}
          className="action-button action-button--reserved"
        >
          <ShoppingCart className="action-button__icon" />
          Complete Purchase
        </button>
      );
    }

    if (user.status === 'WAITING' || user.status === 'EXPIRED') {
      return (
        <button disabled className="action-button action-button--disabled">
          <Clock className="action-button__icon" />
          {user.status === 'EXPIRED' ? 'Requeued After Expiry' : 'Waiting in Queue'}
        </button>
      );
    }

    return (
      <button
        onClick={() => onBuy(user.userId)}
        disabled={isOutOfStock}
        className={
          isOutOfStock
            ? 'action-button action-button--disabled'
            : 'action-button action-button--primary'
        }
      >
        <ShoppingCart className="action-button__icon" />
        {isOutOfStock ? 'Out of Stock' : 'Buy'}
      </button>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cardClassName}
    >
      <div className="medicine-card__image-box">
        <img
          src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80"
          alt={product.name}
          className="medicine-card__image"
        />
        <div className="medicine-card__image-overlay" />
        <div className="medicine-card__user-tag">{user.name}</div>
      </div>

      <div className="medicine-card__content">
        <div className="medicine-card__top-row">
          <div>
            <h3 className="medicine-card__title">{product.name}</h3>
            <p className="medicine-card__price">Rp {product.price.toLocaleString('id-ID')}</p>
            <p className="medicine-card__stock-text">Available stock: {product.availableStock}</p>
            {user.position ? (
              <p className="medicine-card__position">Queue position: {user.position}</p>
            ) : null}
          </div>

          <span className={statusClassNames[user.status]}>
            {user.status === 'COMPLETED' ? <CheckCircle2 className="status-badge__icon" /> : null}
            {user.status === 'RESERVED' ? <Clock className="status-badge__icon" /> : null}
            {user.status === 'EXPIRED' ? <XCircle className="status-badge__icon" /> : null}
            {user.status === 'IDLE' && isOutOfStock ? (
              <AlertCircle className="status-badge__icon" />
            ) : null}
            {user.status}
          </span>
        </div>

        <div className="medicine-card__bottom">
          {renderButton()}
          {user.status === 'RESERVED' && user.expiresAt ? (
            <CountdownTimer expiresAt={user.expiresAt} now={now} />
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
