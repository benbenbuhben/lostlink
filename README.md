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

## 1 – Quick Start (Docker + Local Expo)

```bash
# Clone & enter the repo
 git clone <repo-url> && cd lostlink

# 1. Start backend + DB services only (frontend is skipped by default)
 docker compose up -d

# 2. In another terminal run the mobile/web app locally
 cd frontend && npm install   # first time only
 npx expo start --host lan -p 19001 --web  # Metro + DevTools + web preview
```

Services launched by Docker:

| Service            | Port | Notes                                    |
|--------------------|------|------------------------------------------|
| **backend**        | 5001 | API (Express) – hot-reload via nodemon   |
| **mongo**          | 27017| Persistent volume `mongo-data`           |
| **mongo-express**  | 8081 | Web UI (admin / pass123)                 |
| **minio**          | 9000 | S3-compatible storage + console on 9001  |
| *(optional)* **frontend-web** | 3000 | Only when running `--profile build-web` |

> Expo will open DevTools in your browser and print `exp://<LAN-IP>:19001`. Scan it with Expo Go or open `http://localhost:19001` for the web preview.

Stop Docker services with:

```bash
docker compose down
```

---

### Building the static web image (CI / prod)

To produce a container that serves the Expo Web export:

```bash
# builds multi-stage Dockerfile.web and tags lostlink-frontend-web
docker compose --profile build-web build frontend
```

Run it locally with:

```bash
docker compose --profile build-web up frontend
# → web available at http://localhost:3000
```

---

## 2 – Local Development Without Docker (alt)

If you prefer to run everything natively:

```bash
# Start Mongo locally (or use Atlas)
brew services start mongodb-community

# Backend
cd backend && npm install && npm run dev  # listens on 5001

# Frontend
cd ../frontend && npm install && npx expo start --host lan -p 19001 --web
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