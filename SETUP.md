# CertiFlow – Local Development & Setup Guide

This guide describes how to bootstrap the CertiFlow development environment from scratch on a clean machine.

---

## 1. Prerequisites

- **Node.js**: `v20.x` or `v22.x` (`node -v` >= 18.0.0)
- **npm**: `v9.x` or `v10.x` (`npm -v` >= 9.0.0)
- **Docker & Docker Compose**: Docker Engine 24+ and `docker-compose`
- **Git**

---

## 2. Environment Setup

1. Copy the sample environment file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Review `.env` and configure appropriate secrets for development:
   - `DATABASE_URL`: Connection string for PostgreSQL (defaults to `postgresql://certiflow:certiflow_secret@localhost:5432/certiflow?schema=public`)
   - `REDIS_URL`: Connection string for Redis (defaults to `redis://localhost:6379`)
   - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`: 32+ character secrets
   - `CORS_ORIGIN`: `http://localhost:3000`

---

## 3. Dependency Installation

To install dependencies across all monorepo workspaces (`packages/shared`, `apps/backend`, `apps/frontend`):

```bash
npm install --ignore-scripts
```

> **Windows / OneDrive Note**: The `--ignore-scripts` flag prevents file-locking issues during large dependency extraction. Prisma client generation is run in a separate step.

---

## 4. Build Shared Package & Generate Prisma Client

```bash
# Generate the Prisma database client
npm run db:generate --workspace=@certiflow/backend

# Compile the shared TypeScript library
npm run build --workspace=@certiflow/shared
```

---

## 5. Database Initialization & Seeding

Start PostgreSQL and Redis locally, or launch them with Docker Compose:

```bash
# Start Postgres and Redis containers in the background
docker-compose up -d postgres redis

# Push schema migrations to the database
npm run db:push --workspace=@certiflow/backend

# Seed database with initial roles, districts, and demo administrative accounts
npm run db:seed --workspace=@certiflow/backend
```

### Default Demo Credentials

- **State Officer**: `state.officer@gov.in` / `Admin@CertiFlow2026!`
- **District Officer 1 (Central)**: `district.officer1@gov.in` / `Admin@CertiFlow2026!`
- **District Officer 2 (Central)**: `district.officer2@gov.in` / `Admin@CertiFlow2026!`
- **Quality Officer**: `quality.officer@gov.in` / `Admin@CertiFlow2026!`
- **Training Centre**: `tc.apex@skilling.org` / `Admin@CertiFlow2026!`
- **System Administrator**: `admin@gov.in` / `Admin@CertiFlow2026!`

---

## 6. Running Development Servers

### Frontend Web Client (Vite HMR)
```bash
npm run dev:frontend
# Accessible at http://localhost:3000 (or http://localhost:5173 depending on port)
```

### Backend API Server (Express tsx watch)
```bash
npm run dev:backend
# Accessible at http://localhost:4000
# Health check: http://localhost:4000/health
```

### Background Asynchronous Worker (BullMQ & Outbox Publisher)
```bash
npm run dev:worker
```

---

## 7. Running Tests & Quality Verification

```bash
# Run unit tests across shared package and backend
npm run test:unit

# Validate OpenSpec compliance
npx openspec validate certiflow-monorepo-foundation --strict
```
