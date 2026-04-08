import React from 'react';
import { Activity } from 'lucide-react';
import { Toaster } from 'sonner';
import { AdminPanel } from './components/AdminPanel';
import { UserPanel } from './components/UserPanel';
import { useReservationSystem } from './hooks/useReservationSystem';

export function App() {
  const reservationSystem = useReservationSystem();
  const { product, users, now, isLoading, joinQueue, completePurchase } =
    reservationSystem;

  return (
    <div className="app-shell">
      <Toaster position="top-center" richColors />

      <header className="app-header">
        <div className="app-header__content">
          <div className="app-header__icon-box">
            <Activity className="app-header__icon" />
          </div>
          <h1 className="app-header__title">
            KAIONEX <span className="app-header__subtitle">Smart Stock Reservation System</span>
          </h1>
        </div>
      </header>

      <main className="app-main">
        <section className="panel-column">
          <div className="panel-card">
            <UserPanel
              product={product}
              users={users}
              now={now}
              isLoading={isLoading}
              onBuy={joinQueue}
              onComplete={completePurchase}
            />
          </div>
        </section>

        <section className="panel-column">
          <div className="panel-card panel-card--sticky">
            <AdminPanel product={product} users={users} now={now} />
          </div>
        </section>
      </main>
    </div>
  );
}
