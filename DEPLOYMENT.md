# CertiFlow – Deployment & Container Orchestration Guide

This document describes how to build, orchestrate, and deploy the CertiFlow multi-container platform in staging and production environments.

---

## 1. Container Architecture

CertiFlow employs multi-stage Docker container builds to maintain minimal attack surfaces and compact image sizes:

| Service | Base Image | Role | Port | Health Check |
| :--- | :--- | :--- | :--- | :--- |
| **certiflow-db** | `postgres:16-alpine` | Relational persistent database | `5432` | `pg_isready -U certiflow -d certiflow` |
| **certiflow-redis** | `redis:7-alpine` | Distributed cache, queue broker & token blacklisting | `6379` | `redis-cli ping` |
| **certiflow-api** | `node:22-alpine` (multi-stage) | REST API server with rate limiting & security headers | `4000` | `curl -f http://localhost:4000/health` |
| **certiflow-worker** | `node:22-alpine` (multi-stage) | BullMQ asynchronous job worker & outbox dispatcher | N/A | Process exit monitoring |
| **certiflow-frontend**| `nginx:alpine` (multi-stage) | Production SPA static asset server with SPA routing | `80` (mapped to `3000`) | Nginx process |

---

## 2. Docker Compose Commands

### Start All Services in Background
```bash
docker-compose up -d --build
```

### Inspect Container Status & Health
```bash
docker-compose ps
```

All services must display `Up (healthy)` or `Up`.

### View Consolidated Real-Time Logs
```bash
docker-compose logs -f
```

### Stop All Services
```bash
docker-compose down
```

### Stop Services and Prune Volumes (⚠️ Resets Database)
```bash
docker-compose down -v
```

---

## 3. Persistent Volumes

Named volumes ensure data persistence across container restarts and host reboots:
- `postgres_data`: Persists `/var/lib/postgresql/data`
- `redis_data`: Persists `/data`

---

## 4. Production Security Recommendations

1. **Secrets Management**: Replace all default passwords and secrets in `.env` with cryptographically generated 256-bit keys before production deployment.
2. **Reverse Proxy & SSL**: Terminate TLS at an external reverse proxy (Cloudflare, AWS ALB, or Traefik) and forward traffic over HTTPS.
3. **CORS Allowlist**: Set `CORS_ORIGIN` to the exact public domain of the frontend web application.
4. **Prisma Migrations**: Run `npx prisma migrate deploy` in CI/CD pipelines before bringing up new API container versions.
5. **Worker Scaling**: The BullMQ `worker` container is stateless and can be scaled horizontally (`docker-compose up -d --scale worker=3`) under high certificate issuance loads.
