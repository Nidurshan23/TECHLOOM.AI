import React from 'react';
import { LayoutDashboard, Package } from 'lucide-react';
import { Product, QueueUser } from '../types';
import { QueueTable } from './QueueTable';

interface AdminPanelProps {
  product: Product;
  users: QueueUser[];
  now: number;
}

export function AdminPanel({ product, users, now }: AdminPanelProps) {
  const queueUsers = users.filter(
    (user) => user.status !== 'IDLE' || user.position !== null,
  );
  const activeQueueCount = queueUsers.filter((user) => user.position !== null).length;
  const stockLevelClassName = getStockLevelClassName(product.availableStock);

  return (
    <div className="admin-panel">
      <div className="admin-panel__header">
        <div className="panel-title-row panel-title-row--no-border">
          <div className="panel-title-icon panel-title-icon--purple">
            <LayoutDashboard className="panel-title-icon__image" />
          </div>
          <div>
            <h2 className="panel-title">Admin Panel</h2>
            <p className="panel-subtitle">Live queue dashboard</p>
          </div>
        </div>

        <div className="admin-panel__count-box">
          <p className="admin-panel__count-label">Total in Queue</p>
          <p className="admin-panel__count-value">{activeQueueCount}</p>
        </div>
      </div>

      <div className="admin-panel__content">
        <div className={`stock-status-box ${stockLevelClassName}`}>
          <div className="stock-status-box__left">
            <div className="stock-status-box__icon">
              <Package className="stock-status-box__icon-image" />
            </div>
            <div>
              <h3 className="section-label">Live Stock Remaining</h3>
              <p className="stock-status-box__value">
                {product.availableStock}
                <span className="stock-status-box__unit">units</span>
              </p>
              <p className="stock-status-box__text">Total stock: {product.totalStock}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="section-label section-label--with-space">Queue Status</h3>
          <QueueTable users={queueUsers} now={now} />
        </div>
      </div>
    </div>
  );
}

function getStockLevelClassName(availableStock: number) {
  if (availableStock > 1) {
    return 'stock-status-box--good';
  }

  if (availableStock > 0) {
    return 'stock-status-box--medium';
  }

  return 'stock-status-box--low';
}
