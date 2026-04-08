# KAIONEX Smart Stock

This project is a smart stock reservation system for a medicine product. It has a frontend for users and admin view, and a backend that manages stock, queue order, reservation expiry, and real-time updates.

The project keeps the same reservation system logic, but the code is written in a simpler and more beginner-friendly style.

## Tech Stack

- Frontend: React
- Frontend build tool: Vite
- Frontend styling: Normal CSS
- Backend framework: NestJS
- Backend runtime: Node.js
- Database: MongoDB
- Real-time communication: Socket.IO
- Language: TypeScript

## Project Folders

- `frontend` = React + Vite user interface
- `backend` = NestJS API + Socket.IO + MongoDB

## Setup Steps

### 1. Open the project

```bash
cd "D:\TECHLOOM.AI\KAIONEX Smart Stock"
```

### 2. Setup backend

```bash
cd backend
npm install
```

Create `backend/.env` and add:

```env
MONGODB_URI=your_mongodb_connection_string
```

Start backend:

```bash
npm run dev
```


Backend default URL:

```text
http://localhost:3001
```

### 3. Setup frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

If PowerShell blocks `npm`, use:

```bash
npm.cmd run dev
```

Frontend usually runs on:

```text
http://localhost:5173
```

## Build Commands

### Frontend

```bash
cd frontend
npm run build
```

### Backend

```bash
cd backend
npm run build
```

### Run backend production build

```bash
cd backend
npm run start:prod
```

## Main Features

- Show product details and available stock
- Add a user to the queue
- Reserve stock for the next user in queue
- Show reservation countdown timer
- Complete a purchase
- Expire reservation after time ends
- Update queue and stock in real time
- Show admin dashboard with live queue data

## API Endpoints

- `GET /product` = get product details
- `GET /queue` = get queue users
- `POST /queue` = add a user to the queue
- `POST /queue/complete` = complete a purchase

## How To Test Each Feature

### 1. Test product loading

Start backend and frontend. Open the frontend in the browser.

Check that:

- product name is shown
- product price is shown
- available stock is shown

API test:

```bash
curl http://localhost:3001/product
```

PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/product" -Method Get
```

### 2. Test queue loading

When the page opens, the seeded users should be shown.

Check that:

- user cards are visible
- admin queue table is visible

API test:

```bash
curl http://localhost:3001/queue
```

PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/queue" -Method Get
```

### 3. Test adding a user to the queue

On the frontend, click the `Buy` button for a user with `IDLE` status.

Check that:

- the user status changes to `WAITING` or `RESERVED`
- queue position appears
- admin table updates

API test:

```bash
curl -X POST http://localhost:3001/queue -H "Content-Type: application/json" -d "{\"userId\":\"user1\"}"
```

PowerShell:

```powershell
$body = @{
  userId = "user1"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/queue" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### 4. Test reservation logic

Add users to the queue one by one.

Check that:

- if stock is available, the first queued user becomes `RESERVED`
- the reserved user gets a timer
- when stock is low, only available number of users are reserved

### 5. Test purchase complete

For a user with `RESERVED` status, click `Complete Purchase`.

Check that:

- status changes to `COMPLETED`
- available stock and total stock update correctly
- next waiting user may move forward
- admin panel updates in real time

API test:

```bash
curl -X POST http://localhost:3001/queue/complete -H "Content-Type: application/json" -d "{\"userId\":\"user1\"}"
```

PowerShell:

```powershell
$body = @{
  userId = "user1"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/queue/complete" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### 6. Test reservation expiry

Add a user and wait for the reservation timer to end.

Check that:

- reservation expires automatically
- user loses reserved state
- stock is released back
- next users can be processed again

Note:

- the backend checks expiration every 5 seconds

### 7. Test real-time updates

Open the frontend in two browser tabs.

In the first tab:

- add a user to queue
- complete a purchase

In the second tab, check that:

- queue table updates automatically
- stock count updates automatically
- timer updates automatically

### 8. Test out-of-stock behavior

Complete purchases until stock becomes zero.

Check that:

- `Buy` button becomes disabled for new users
- UI shows out-of-stock state correctly
- admin panel shows zero stock

## Postman Testing

You can also test the backend using Postman.

### Request 1: Get product

- Method: `GET`
- URL: `http://localhost:3001/product`

### Request 2: Get queue

- Method: `GET`
- URL: `http://localhost:3001/queue`

### Request 3: Add user to queue

- Method: `POST`
- URL: `http://localhost:3001/queue`
- Header: `Content-Type: application/json`
- Body:

```json
{
  "userId": "user1"
}
```

### Request 4: Complete purchase

- Method: `POST`
- URL: `http://localhost:3001/queue/complete`
- Header: `Content-Type: application/json`
- Body:

```json
{
  "userId": "user1"
}
```

## Notes

- Backend default port: `3001`
- Frontend default API URL: `http://localhost:3001`
- Backend needs MongoDB connection in `backend/.env`
- The backend uses NestJS, and NestJS runs on Node.js
