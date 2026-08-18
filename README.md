# event-order-stream

A real-time, event-driven order processing system. Demonstrates Kafka-based service
communication, an SSE-streaming API gateway with JWT auth, and a React frontend that
updates live as backend events happen — no polling.

## Architecture

```
React frontend (Vite)
        │  REST + SSE
        ▼
gateway-service  (JWT auth, request proxy, SSE broadcast)  :8082
        │  REST                          ▲  Kafka: order-status-updates
        ▼                                │
order-service  (REST API, Postgres)  :8081
        │  Kafka: order-events
        ▼
notification-service  (Kafka consumer, simulates processing, Postgres)
```

- **order-service** — creates orders, persists to Postgres, publishes `order-events`
- **notification-service** — consumes `order-events`, simulates processing with a
  randomized delay, publishes `order-status-updates` (PROCESSING → CONFIRMED/FAILED)
- **gateway-service** — the only service the frontend talks to. Issues JWTs, proxies
  order requests to order-service, and streams status updates to the browser over SSE
- **frontend** — React + Vite. Creates orders, watches them update live via `EventSource`

Local Kafka runs on **Redpanda** (Kafka-protocol-compatible, lightweight, fast startup)
via `docker-compose.yml`. Production targets real Apache Kafka (Upstash) — see the
"Local vs production Kafka" note below.

## Run it locally

**1. Start the backend stack:**
```bash
docker compose up --build
```
This starts Postgres, Redpanda (+ Redpanda Console UI on :8090), `order-service` (:8081),
`notification-service` (background consumer, no exposed port), and `gateway-service` (:8082).

**2. Start the frontend, in a separate terminal:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Open http://localhost:5173.

**3. Log in** with username password  (demo credentials, see
`gateway-service/src/main/resources/application.yml`).

**4. Create an order.** Watch its status flip from `processing` to `confirmed` (or
occasionally `failed`, ~10% simulated failure rate) a few seconds later, live, with no
page refresh.

## Local vs production Kafka

Local dev uses **Redpanda** — a from-scratch Kafka-protocol implementation, not a fork,
so `spring-kafka` producer/consumer code is identical either way. It's used locally
purely for a lighter footprint and faster startup than running real Kafka + ZooKeeper in
Docker. Production deployment targets **Upstash Kafka**, which is genuine managed Apache
Kafka.

## What's live

- Frontend deployed to Vercel: (https://event-order-stream-gst8ews5a-nicholas-s-projects-8fd784f3.vercel.app/)
- Backend fully deployed on Render — order-service, notification-service, gateway-service
- PostgreSQL on Neon
- Kafka on Redpanda Cloud (not Upstash — Upstash discontinued their Kafka product in 2025)
- Full order pipeline confirmed working end to end: create an order → Kafka → notification-service
  processes it → status streams back live via SSE, no refresh needed
- JWT authentication with user registration and login (BCrypt-hashed passwords, Postgres-backed)
- GitHub Actions workflow pings all three backend services every 10 minutes to prevent
  Render's free-tier services from spinning down on inactivity

## What's not built yet

- CI/CD build/test pipeline (GitHub Actions running `mvn test` on push, separate from the
  keep-alive workflow above) — this has not been compiled or tested in an automated
  environment, so a broken commit could reach Render undetected
- No local build verification was run before pushing several fixes during development —
  flag any build errors if you fork this