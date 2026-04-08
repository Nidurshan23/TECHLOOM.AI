import { useEffect, useMemo, useState } from "react";

const RESERVATION_SECONDS = 5 * 60;
const MEDICINE = {
  id: "med-1",
  name: "Paracetamol 500mg",
  price: 20000,
  image:
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80",
};

const initialUsers = [
  { id: "USR-01", name: "Aarav", status: "idle", reservationEndsAt: null },
  { id: "USR-02", name: "Bhavya", status: "idle", reservationEndsAt: null },
  { id: "USR-03", name: "Charan", status: "idle", reservationEndsAt: null },
  { id: "USR-04", name: "Diya", status: "idle", reservationEndsAt: null },
  { id: "USR-05", name: "Eshan", status: "idle", reservationEndsAt: null },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatTimer = (totalSeconds) => {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const getStockTone = (stock) => {
  if (stock <= 0) {
    return "danger";
  }

  if (stock <= 2) {
    return "warning";
  }

  return "success";
};

function App() {
  const [users, setUsers] = useState(initialUsers);
  const [queue, setQueue] = useState([]);
  const [stock, setStock] = useState(4);
  const [now, setNow] = useState(Date.now());
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const ticker = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(ticker);
  }, []);

  useEffect(() => {
    const activeUserId = queue[0];

    if (!activeUserId) {
      return;
    }

    const activeUser = users.find((user) => user.id === activeUserId);
    if (!activeUser?.reservationEndsAt || activeUser.status !== "pending") {
      return;
    }

    if (activeUser.reservationEndsAt <= now) {
      expireReservation(activeUserId);
    }
  }, [now, queue, users]);

  const queueLookup = useMemo(() => {
    return new Map(queue.map((userId, index) => [userId, index + 1]));
  }, [queue]);

  const activeReservation = queue[0]
    ? users.find((user) => user.id === queue[0]) ?? null
    : null;

  function pushNotification(message, tone) {
    const id = crypto.randomUUID();
    setNotifications((current) => [...current, { id, message, tone }]);

    window.setTimeout(() => {
      setNotifications((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  }

  function updateQueueStates(nextQueue, overrides = {}) {
    setUsers((current) =>
      current.map((user) => {
        const queueIndex = nextQueue.indexOf(user.id);
        const override = overrides[user.id] ?? {};

        if (queueIndex === 0) {
          return {
            ...user,
            status: "pending",
            reservationEndsAt:
              override.reservationEndsAt ?? user.reservationEndsAt ?? Date.now() + RESERVATION_SECONDS * 1000,
            ...override,
          };
        }

        if (queueIndex > 0) {
          return {
            ...user,
            status: override.status ?? "waiting",
            reservationEndsAt: null,
            ...override,
          };
        }

        return {
          ...user,
          reservationEndsAt: null,
          ...override,
        };
      }),
    );
  }

  function joinQueue(userId) {
    if (stock <= 0) {
      pushNotification("Medicine is currently out of stock.", "danger");
      return;
    }

    const user = users.find((item) => item.id === userId);
    if (!user) {
      return;
    }

    if (queue.includes(userId) || user.status === "completed") {
      return;
    }

    const nextQueue = [...queue, userId];
    setQueue(nextQueue);
    updateQueueStates(nextQueue);
    pushNotification(`${user.name} joined the reservation queue.`, "info");
  }

  function completePurchase(userId) {
    const user = users.find((item) => item.id === userId);
    if (!user) {
      return;
    }

    const nextQueue = queue.filter((queuedUserId) => queuedUserId !== userId);
    setQueue(nextQueue);
    setStock((current) => Math.max(0, current - 1));
    updateQueueStates(nextQueue, {
      [userId]: {
        status: "completed",
        reservationEndsAt: null,
      },
    });
    pushNotification(`${user.name} completed the purchase successfully.`, "success");
  }

  function expireReservation(userId) {
    const user = users.find((item) => item.id === userId);
    if (!user) {
      return;
    }

    const nextQueue = queue.filter((queuedUserId) => queuedUserId !== userId);
    setQueue(nextQueue);
    updateQueueStates(nextQueue, {
      [userId]: {
        status: "expired",
        reservationEndsAt: null,
      },
    });
    pushNotification(`${user.name}'s reservation expired and was released.`, "warning");
  }

  const stockTone = getStockTone(stock);

  return (
    <div className="app-shell">
      <div className="backdrop backdrop-one" />
      <div className="backdrop backdrop-two" />

      <header className="hero">
        <div>
          <p className="eyebrow">KAIONEX Smart Stock</p>
          <h1>Reservation control for users and admins on one live dashboard.</h1>
        </div>
        <div className={`stock-banner ${stockTone}`}>
          <span>Live Stock</span>
          <strong>{stock} units remaining</strong>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="panel glass-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-tag">User Panel</p>
              <h2>Medicine Stock Reservation</h2>
            </div>
            <div className={`status-pill ${stockTone}`}>
              {stock <= 0 ? "Out of Stock" : stock <= 2 ? "Reservation in progress" : "Available"}
            </div>
          </div>

          <div className="user-list">
            {users.map((user) => {
              const isTopOfQueue = queue[0] === user.id;
              const isQueued = queueLookup.has(user.id);
              const secondsRemaining = user.reservationEndsAt
                ? Math.ceil((user.reservationEndsAt - now) / 1000)
                : 0;
              const progress =
                isTopOfQueue && user.reservationEndsAt
                  ? Math.max(0, Math.min(100, (secondsRemaining / RESERVATION_SECONDS) * 100))
                  : 0;

              return (
                <article className="user-card" key={user.id}>
                  <img className="medicine-image" src={MEDICINE.image} alt={MEDICINE.name} />

                  <div className="user-card-body">
                    <div className="user-card-topline">
                      <div>
                        <p className="user-name">{user.name}</p>
                        <span className="user-id">{user.id}</span>
                      </div>
                      <span className={`queue-badge ${isTopOfQueue ? "warning" : isQueued ? "info" : "neutral"}`}>
                        {isTopOfQueue
                          ? "Top of queue"
                          : isQueued
                            ? `Queue #${queueLookup.get(user.id)}`
                            : user.status === "completed"
                              ? "Purchased"
                              : user.status === "expired"
                                ? "Expired"
                                : "Ready"}
                      </span>
                    </div>

                    <div className="medicine-copy">
                      <h3>{MEDICINE.name}</h3>
                      <p>{formatCurrency(MEDICINE.price)}</p>
                    </div>

                    <div className="user-meta">
                      <span>Available Stock: {stock}</span>
                      <span>Status: {labelForStatus(user.status)}</span>
                    </div>

                    {isTopOfQueue ? (
                      <div className="timer-card">
                        <div className="timer-row">
                          <span>Reservation Timer</span>
                          <strong>{formatTimer(secondsRemaining)}</strong>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="action-row">
                          <button className="primary-button success" onClick={() => completePurchase(user.id)}>
                            Complete Purchase
                          </button>
                          <button className="ghost-button" onClick={() => expireReservation(user.id)}>
                            Simulate Expiry
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="action-row">
                        <button
                          className="primary-button"
                          onClick={() => joinQueue(user.id)}
                          disabled={stock <= 0 || isQueued || user.status === "completed"}
                        >
                          {user.status === "completed"
                            ? "Purchased"
                            : isQueued
                              ? "Queued"
                              : stock <= 0
                                ? "Out of Stock"
                                : "Buy"}
                        </button>
                        <span className="helper-text">
                          {isQueued
                            ? "Waiting for your turn in the queue."
                            : "Join the live reservation queue."}
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="panel glass-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-tag">Admin Panel</p>
              <h2>Queue Dashboard</h2>
            </div>
            <div className="admin-summary">
              <span>{queue.length} users in queue</span>
              <strong>{stock} stock left</strong>
            </div>
          </div>

          <div className="mini-stats">
            <div className="mini-card success">
              <span>Available</span>
              <strong>{stock > 0 ? stock : 0}</strong>
            </div>
            <div className="mini-card warning">
              <span>In Progress</span>
              <strong>{activeReservation ? 1 : 0}</strong>
            </div>
            <div className="mini-card danger">
              <span>Out of Stock</span>
              <strong>{stock <= 0 ? "Yes" : "No"}</strong>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Timer</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isTopOfQueue = queue[0] === user.id;
                  const position = queueLookup.get(user.id) ?? "-";
                  const secondsRemaining = user.reservationEndsAt
                    ? Math.max(0, Math.ceil((user.reservationEndsAt - now) / 1000))
                    : 0;

                  return (
                    <tr key={user.id} className={isTopOfQueue ? "highlight-row" : ""}>
                      <td>{position}</td>
                      <td>
                        <div className="table-user">
                          <strong>{user.name}</strong>
                          <span>{user.id}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-chip ${chipTone(user.status, isTopOfQueue)}`}>
                          {labelForStatus(user.status)}
                        </span>
                      </td>
                      <td>{isTopOfQueue ? formatTimer(secondsRemaining) : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={`stock-footer ${stockTone}`}>
            <span>Live Stock Display</span>
            <strong>{stock <= 0 ? "Out of Stock" : `${stock} packs remaining`}</strong>
          </div>
        </section>
      </main>

      <div className="toast-stack" aria-live="polite">
        {notifications.map((toast) => (
          <div className={`toast ${toast.tone}`} key={toast.id}>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

function labelForStatus(status) {
  switch (status) {
    case "pending":
      return "Pending";
    case "waiting":
      return "Waiting";
    case "completed":
      return "Completed";
    case "expired":
      return "Expired";
    default:
      return "Ready";
  }
}

function chipTone(status, isTopOfQueue) {
  if (status === "completed") {
    return "success";
  }

  if (status === "expired") {
    return "danger";
  }

  if (isTopOfQueue || status === "pending") {
    return "warning";
  }

  return "neutral";
}

export default App;
