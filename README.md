# LostLink – Mobile-First Lost & Found System

This repository contains a full-stack MVP built with:

* **Frontend** – React Native + Expo Router (TypeScript)
* **Backend** – Node.js + Express + MongoDB (Mongoose ODM)
* **Dev environment** – Docker Compose (Mongo, Mongo-Express, API, Expo)

---

## Prerequisites

* Docker Desktop (or Docker Engine + Docker Compose V2)
* (Optional) Node 18 + npm if you want to run services outside Docker

---

## 1 – Quick Start (Docker Compose)

```bash
# Clone & enter the repo
 git clone <repo-url> && cd lostlink

# Build the images & start all services
 docker compose up --build
```

Services launched:

| Service            | Port | Notes                                    |
|--------------------|------|------------------------------------------|
| **backend**        | 5001 | API (Express) – hot-reload via nodemon   |
| **frontend**       | 3000 | Expo CLI (web + QR for native)           |
| **mongo**          | 27017| Persistent volume `mongo-data`           |
| **mongo-express**  | 8081 | Web UI (admin / pass123)                 |

> Expo will print a QR code; scan using the Expo Go app on iOS / Android or open `http://localhost:3000` for the web preview.

Stop everything with `Ctrl-C` or in another terminal:

```bash
docker compose down
```

---

## 2 – Local Development Without Docker

Useful if you need native debugging or faster FS watching:

```bash
# 1. Start Mongo locally (or use Atlas)
 brew services start mongodb-community

# 2. Backend
 cd backend && npm install && npm run dev

# 3. Frontend
 cd ../frontend && npm install && expo start
```

Set `EXPO_PUBLIC_API_URL=http://localhost:5001` in `frontend/.env` so the app hits the local API.

---

## 3 – Environment Variables

| File / Location     | Purpose                              |
|---------------------|--------------------------------------|
| `.env` (projectroot)| Shared vars for docker-compose       |
| `frontend/.env`     | Expo inline vars (must start `EXPO_PUBLIC_`) |
| `backend/.env`      | Backend-specific secrets (Auth0, etc.) |

Example root `.env`:

```
MONGO_URI=mongodb://mongo:27017/lostlink
SENDGRID_API_KEY=…
AUTH0_DOMAIN=…
AUTH0_CLIENT_ID=…
```

---

## 4 – Seeding the Database

```
docker compose exec backend npm run seed   # uses faker to generate users + items
```

---

## 5 – Running Tests

(TBA) – Jest setup for both frontend & backend.

---

## 6 – Project Status

See `tasks.md` for a detailed checklist. Highlights:

* ✅ Feed tab live with React-Query infinite scroll
* 🟡 Auth0 login working (backend JWT verification pending)
* 🔜 Report form & claim flow

---

## 7 – Contributing / Branch Flow

1. Create a feature branch – `git checkout -b feat/report-form`
2. Commit early & often.
3. Open a PR to `main`; GitHub Actions (to be added) will lint & test.

---

MIT License © 2025 