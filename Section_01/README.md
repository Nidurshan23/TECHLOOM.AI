# KAIONEX Smart Stock Reservation System Demo

This workspace contains a full-stack demo for a smart stock reservation system:

- `backend/`: NestJS + MongoDB Atlas + Socket.IO
- `frontend/`: React + Vite + Socket.IO client

## Demo Behavior

- One demo medicine is preloaded with `stock = 2`
- Five users are preloaded automatically on backend startup
- Users can join the FCFS queue from the left panel
- Up to `stock` users can hold an active reservation at the same time
- Active reservations expire after 5 minutes
- On expiry, the reservation is marked `expired`, the same user is re-added to the bottom of the queue, and the next waiting user is activated
- Completing a purchase decreases actual stock and updates all clients live

## Backend Setup

1. Create `backend/.env` from `backend/.env.example`
2. Add your MongoDB Atlas connection string as `MONGODB_URI`
3. Install dependencies:

```bash
cd backend
npm install
```

4. Start the server:

```bash
npm run start:dev
```

The API runs on `http://localhost:4000` by default.

## Frontend Setup

1. Create `frontend/.env` from `frontend/.env.example`
2. Install dependencies:

```bash
cd frontend
npm install
```

3. Start the app:

```bash
npm run dev
```

The UI runs on `http://localhost:5173` by default.

## APIs

- `GET /products`
- `GET /users`
- `POST /reserve`
- `POST /purchase`
- `GET /queue?productId=<id>`

## Notes

- The backend intentionally allows users to join the FCFS queue even when all currently available units are already locked, so the demo can visibly show the waiting line for all 5 preloaded users.
- The product image uses a demo placeholder URL and can be swapped in `backend/src/products/products.service.ts`.
