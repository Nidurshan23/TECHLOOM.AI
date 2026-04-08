import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import medicineImage from './assets/medicine-cart.svg';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
const socket = io(API_BASE_URL, {
  autoConnect: true,
});

function formatTime(ms) {
  if (!ms || ms <= 0) {
    return '00:00';
  }

  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function App() {
  const [users, setUsers] = useState([]);
  const [product, setProduct] = useState(null);
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  const refreshProductState = async (productId) => {
    const [productsResponse, queueResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/products`),
      fetch(`${API_BASE_URL}/queue?productId=${productId}`),
    ]);

    const productsData = await productsResponse.json();
    const queueData = await queueResponse.json();
    setProduct(productsData[0]);
    setQueue(queueData);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [usersResponse, productsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/users`),
          fetch(`${API_BASE_URL}/products`),
        ]);

        const usersData = await usersResponse.json();
        const productsData = await productsResponse.json();
        const loadedProduct = productsData[0];

        setUsers(usersData);
        setProduct(loadedProduct);

        if (loadedProduct?._id) {
          const queueResponse = await fetch(
            `${API_BASE_URL}/queue?productId=${loadedProduct._id}`,
          );
          const queueData = await queueResponse.json();
          setQueue(queueData);
        }
      } catch {
        setError('Unable to load demo data. Check backend and MongoDB Atlas connection.');
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    const handleStockUpdate = (updatedProduct) => {
      setProduct((current) =>
        current && current._id === updatedProduct._id ? updatedProduct : current,
      );
    };

    const handleQueueUpdate = (payload) => {
      setQueue((current) => {
        const currentProductId = product?._id ?? current[0]?.productId;
        if (!currentProductId || payload.productId !== currentProductId) {
          return current;
        }

        return payload.queue;
      });
    };

    socket.on('stockUpdate', handleStockUpdate);
    socket.on('queueUpdate', handleQueueUpdate);

    return () => {
      socket.off('stockUpdate', handleStockUpdate);
      socket.off('queueUpdate', handleQueueUpdate);
    };
  }, [product]);

  const liveQueue = useMemo(() => {
    let pendingPosition = 0;

    return queue.map((item, index) => {
      const remainingMs = item.expiresAt
        ? Math.max(new Date(item.expiresAt).getTime() - currentTime, 0)
        : 0;
      const isActive = item.status === 'pending' && Boolean(item.expiresAt) && remainingMs > 0;
      const isPending = item.status === 'pending';

      if (isPending) {
        pendingPosition += 1;
      }

      return {
        ...item,
        rowNumber: index + 1,
        remainingMs,
        isActive,
        pendingPosition: isPending ? pendingPosition : null,
      };
    });
  }, [queue, currentTime]);

  const userState = useMemo(() => {
    const map = new Map();

    users.forEach((user) => {
      const reservations = liveQueue.filter((item) => item.userId === user._id);
      const activeReservation = reservations.find((item) => item.status === 'pending' && item.isActive);
      const waitingReservation = reservations.find((item) => item.status === 'pending' && !item.isActive);
      const completedReservation = [...reservations]
        .reverse()
        .find((item) => item.status === 'completed');
      const expiredReservation = [...reservations]
        .reverse()
        .find((item) => item.status === 'expired');

      map.set(user._id, {
        activeReservation,
        waitingReservation,
        completedReservation,
        expiredReservation,
      });
    });

    return map;
  }, [users, liveQueue]);

  const handleReserve = async (userId) => {
    if (!product?._id) {
      return;
    }

    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId: product._id }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message ?? 'Reservation failed');
      }

      await refreshProductState(product._id);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handlePurchase = async (userId) => {
    if (!product?._id) {
      return;
    }

    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId: product._id }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message ?? 'Purchase failed');
      }

      await refreshProductState(product._id);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  if (!product) {
    return <div className="loading-shell">Loading KAIONEX demo...</div>;
  }

  return (
    <main className="page-shell">
      <section className="hero-strip">
        <div>
          <p className="eyebrow">KAIONEX Smart Stock Reservation System Demo</p>
          <h1>FCFS queue, 5-minute hold timer, and live stock movement on one screen.</h1>
        </div>
        <div className="hero-metrics">
          <div>
            <span>Total Stock</span>
            <strong>{product.stock}</strong>
          </div>
          <div>
            <span>Available Now</span>
            <strong>{product.availableStock}</strong>
          </div>
          <div>
            <span>Locked Units</span>
            <strong>{product.lockedStock}</strong>
          </div>
        </div>
      </section>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="split-layout">
        <section className="panel panel-users">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Left Screen</p>
              <h2>User Panel</h2>
            </div>
            <p className="product-chip">INR {product.price} demo medicine</p>
          </div>

          <div className="user-grid">
            {users.map((user) => {
              const state = userState.get(user._id);
              const isBusy = Boolean(state?.activeReservation || state?.waitingReservation);
              const statusLabel = state?.activeReservation
                ? 'Reservation active'
                : state?.waitingReservation
                  ? 'Waiting in queue'
                  : state?.completedReservation
                    ? 'Purchased'
                    : state?.expiredReservation
                      ? 'Expired once'
                      : 'Idle';

              return (
                <article className="user-card" key={user._id}>
                  <div className="user-card-top">
                    <div>
                      <p className="user-name">{user.name}</p>
                      <p className="status-pill">{statusLabel}</p>
                    </div>
                    <img src={medicineImage} alt={product.name} className="medicine-image" />
                  </div>

                  <div className="product-meta">
                    <p>{product.name}</p>
                    <p>Stock visible to all users: {product.availableStock}</p>
                    <p>Price: INR {product.price}</p>
                  </div>

                  <div className="timer-box">
                    {state?.activeReservation ? (
                      <>
                        <span>Reservation timer</span>
                        <strong>{formatTime(state.activeReservation.remainingMs)}</strong>
                      </>
                    ) : state?.waitingReservation ? (
                      <>
                        <span>Queue position</span>
                        <strong>#{state.waitingReservation.pendingPosition}</strong>
                      </>
                    ) : (
                      <>
                        <span>Reservation timer</span>
                        <strong>Not active</strong>
                      </>
                    )}
                  </div>

                  <div className="user-actions">
                    <button
                      className="primary-button"
                      onClick={() => handleReserve(user._id)}
                      disabled={isBusy || product.stock <= 0}
                    >
                      Buy
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => handlePurchase(user._id)}
                      disabled={!state?.activeReservation}
                    >
                      Complete Purchase
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="panel panel-admin">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Right Screen</p>
              <h2>Admin Panel</h2>
            </div>
            <p className="product-chip">Live queue for {product.name}</p>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Queue State</th>
                  <th>Timer</th>
                </tr>
              </thead>
              <tbody>
                {liveQueue.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No reservations yet. Use the left-side panel to start the FCFS queue.
                    </td>
                  </tr>
                ) : (
                  liveQueue.map((item) => (
                    <tr key={item.id}>
                      <td>{item.rowNumber}</td>
                      <td>{item.userName}</td>
                      <td className={`status-${item.status}`}>{item.status}</td>
                      <td>{item.status === 'pending' ? (item.isActive ? 'Holding stock' : `Waiting (#${item.pendingPosition})`) : '-'}</td>
                      <td>{item.isActive ? formatTime(item.remainingMs) : item.status === 'pending' ? 'Waiting' : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
