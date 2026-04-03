# Finflow — Finance Dashboard Frontend

A clean React + Vite frontend for your FastAPI Finance Dashboard backend.

## Setup

```bash
cd finflow
npm install
npm run dev
```

Open **http://localhost:5173**

## Requirements

Your FastAPI backend must be running at **http://127.0.0.1:8000**

```bash
# In your backend folder:
python -m uvicorn main:app --reload
```

## How it connects

Vite proxies all `/api/*` requests to `http://127.0.0.1:8000` — so you don't need CORS changes.
The proxy strips `/api` prefix before forwarding, e.g.:
- Frontend calls `/api/auth/login` → Backend receives `/auth/login`
- Frontend calls `/api/transactions/` → Backend receives `/transactions/`

## Pages

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Login with email + password |
| `/` | All roles | Dashboard — summary, charts, recent transactions |
| `/transactions` | All roles | Full CRUD (admin) or read-only (analyst/viewer) |
| `/analytics` | All roles | Monthly bar charts, net trend, category breakdown |
| `/users` | Admin only | User management with role + status editing |

## Tech stack

- React 18 + React Router 6
- Recharts for charts
- Vite for dev server + build
- No CSS framework — pure CSS variables
