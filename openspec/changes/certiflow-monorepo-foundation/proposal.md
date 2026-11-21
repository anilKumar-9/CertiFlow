# Proposal

## Why

CertiFlow is an enterprise certificate issuance and multi-tiered verification platform designed to handle complex administrative workflows across training centres, district officers, quality assessors, state authorities, and public verification consumers. Building these governance workflows requires a clean, modular, scalable, and maintainable monorepo foundation with strictly separated architectural layers: frontend client, modular backend API, asynchronous background workers, shared domain contracts, and containerized deployment infrastructure.

Establishing this comprehensive foundation upfront eliminates ad-hoc configurations, prevents circular dependencies, unifies TypeScript and Zod validation rules across full-stack boundaries, and creates an extensible base for upcoming feature deliverables. Furthermore, incorporating mandatory security controls (bcrypt, JWT rotation, RBAC, district data isolation), asynchronous Excel parsing (ExcelJS), tamper-evident PDF certificate rendering (PDFKit, qrcode), transactional outbox queuing (BullMQ, Redis), and an enterprise design system (Tailwind CSS, shadcn/ui) ensures that production-critical architectural patterns are embedded from day one.

## What Changes

- **Monorepo Workspace**: Configure npm workspaces linking `apps/frontend`, `apps/backend`, `packages/shared`, and `tests/`, with unified build, lint, and test scripts and a shared root `tsconfig.base.json`.
- **Frontend Architecture & Design System**: Bootstrap React 19 and Vite with TypeScript, Tailwind CSS, shadcn/ui, React Hook Form, and TanStack Query (`@tanstack/react-query` with devtools for development). Translate enterprise design principles (Hashbyt reference) into a professional government application identity prioritizing operational efficiency, readable data density, and clear information hierarchy over consumer-app decoration (avoiding excessive gradients, frivolous animations, and wasted whitespace). Centralize enterprise design tokens (Navy `#163A5F`, Blue `#245B85`, Gold `#C49A3A`, Teal `#0F766E`, White `#FFFFFF`, Background `#F4F7FA`, Border `#DCE3EA`, Text `#172B3A`) with verified WCAG 2.2 AA contrast compliance and documented accessible alternatives. Scaffold role-specific layouts for Training Centre, District Officer, Quality Officer, and State Officer alongside a minimal public verification shell. Build reusable enterprise data tables (server-side pagination, sorting, filters, bulk selection, skeletons, virtualization readiness), standardized interaction feedback (8 operation states, confirmation dialogs for high-impact actions), and full WCAG 2.2 AA accessibility. Establish TanStack Query as the exclusive server-state layer with hierarchical query keys, targeted cache invalidation, request cancellation via AbortSignal, and authentication-aware cache purging.
- **Shared Domain Package**: Scaffold `@certiflow/shared` containing cross-cutting TypeScript types, system constants (roles, statuses, queue names), and shared Zod validation schemas for full-stack request and form validation.
- **Backend API & Modular Architecture**: Implement Express.js with TypeScript in `apps/backend`, modular domain structures (`src/modules/*`), centralized error handling, Zod validation middleware, an unauthenticated `GET /health` endpoint, and `/api/v1` versioned routing.
- **Security Foundation**: Implement asynchronous bcrypt password hashing (12 salt rounds), dual-token JWT architecture (short-lived access tokens, long-lived refresh tokens) with rotation and revocation tracking, secure HttpOnly/SameSite cookies, CSRF protection, server-side RBAC, district-level data isolation guards, general and public verification rate limiting, file upload security checks (MIME type, size, extension), Helmet security headers, CORS allowlisting, and sensitive-action audit logging.
- **Database & Persistence**: Configure PostgreSQL 16+ with Prisma ORM, defining relational models for `User`, `Role`, `Batch`, `Candidate`, `Certificate`, `Approval`, `AuditLog`, `OutboxEvent`, and `RefreshToken`, complete with automated migrations, connection pool tuning, and demo database seeding (`prisma/seed.ts`).
- **Redis, BullMQ & Transactional Outbox**: Integrate Redis 7+ and BullMQ with dedicated queues for Excel processing, batch validation, certificate generation, WhatsApp notifications, and SLA reminders/escalations. Implement a transactional outbox pattern that commits domain changes and outbox events within atomic Prisma transactions, dispatched by an independent publisher worker with exponential backoff and idempotent consumer execution.
- **Excel Processing Infrastructure**: Integrate ExcelJS to parse and validate student batches against shared Zod schemas, enforcing workbook structure validation, file size limits (max 10MB), row limits (max 5,000 rows), row-level error reporting, all-or-nothing transactional staging, and formula injection sanitization.
- **Certificate Rendering Infrastructure**: Implement asynchronous PDF certificate generation using PDFKit and QR generation via `qrcode`. Generate deterministic unique certificate numbers, embed opaque public verification URLs into QR codes, prepare private object storage abstractions, prevent duplicate issuance on worker retries, and support immediate verification status changes upon certificate cancellation.
- **Containerization & Orchestration**: Provide multi-stage Dockerfiles for frontend (Nginx production) and backend (API server and worker commands), alongside `docker-compose.yml` orchestrating PostgreSQL, Redis, API, Worker, and Frontend with health checks, persistent volumes, and startup dependency sequencing.
- **Testing Infrastructure**: Establish unit testing (Vitest/Jest), API integration testing (Supertest), database integration testing, and Playwright end-to-end testing scaffolding.
- **Documentation**: Deliver production-ready developer setup and deployment documentation (`README.md`, `SETUP.md`, `DEPLOYMENT.md`, `.env.example`).

## Capabilities

### New Capabilities
- `monorepo-workspace`: Monorepo workspace configuration, package resolution, shared TypeScript configurations, and root build and lint orchestration.
- `web-application-shell`: Frontend bootstrap with React, Vite, React Hook Form, TanStack Query, role-scoped routing structure, and typed API service client.
- `design-system-foundation`: Tailwind CSS and shadcn/ui integration, centralized enterprise color palette tokens, verified WCAG 2.2 AA contrast rules, and role-specific dashboard layouts.
- `api-runtime`: Modular Express backend service with API versioning, health check endpoint, request validation middleware, and centralized error handling.
- `security-foundation`: Rate limiting (general API and strict public verification), Helmet security headers, CORS allowlist, file upload validation, and secure secret configuration.
- `authentication-foundation`: Asynchronous bcrypt password hashing, JWT access and refresh token lifecycle, token rotation and revocation tracking, HttpOnly cookies, and CSRF protection.
- `authorization-foundation`: Server-side role-based access control (RBAC) middleware and district-level multi-tenant data isolation guards.
- `data-persistence`: PostgreSQL and Prisma ORM integration, relational domain models, schema migrations, connection pooling, and demo database seeding.
- `audit-foundation`: Structured, immutable audit logging service recording actor ID, role, target entity, action type, IP address, and mutation diffs for sensitive operations.
- `async-job-processing`: Dedicated BullMQ queues (Excel, validation, certificates, WhatsApp, SLA reminders), transactional outbox publisher worker, exponential retry backoff, and idempotent consumers.
- `file-processing-foundation`: ExcelJS workbook parser and validator, shared Zod row schema validation, limits enforcement, row-level error reporting, and formula injection sanitization.
- `certificate-rendering-foundation`: Asynchronous PDF generation with PDFKit, QR code generation with opaque verification URLs, unique certificate numbers, duplicate prevention, and cancellation status handling.
- `container-orchestration`: Multi-stage Dockerfiles and Docker Compose orchestration for frontend, API, worker, PostgreSQL, and Redis with health checks and persistent volumes.

### Modified Capabilities

None.

## Impact

- **Repository Layout**: Establishes `apps/frontend`, `apps/backend`, `packages/shared`, and `tests/` at workspace root.
- **Frontend Migration**: Relocates existing `frontend/` files into `apps/frontend/` without deleting or modifying existing visual assets, configuring Tailwind CSS, shadcn/ui, and React Hook Form.
- **Backend Modernization**: Replaces placeholder `apps/backend/package.json` with a structured Express + TypeScript API server, BullMQ worker entrypoint, and Prisma schema.
- **Dependencies**: Introduces Express, Prisma, BullMQ, ioredis, Zod, bcrypt, jsonwebtoken, ExcelJS, PDFKit, qrcode, helmet, cors, express-rate-limit, Tailwind CSS, shadcn/ui, `@tanstack/react-query`, and `@tanstack/react-query-devtools`.
- **Shared Code**: Links `@certiflow/shared` containing cross-cutting types, constants, and Zod schemas across frontend and backend workspaces.
- **Operational Stack**: Introduces PostgreSQL 16+ and Redis 7+ services via Docker Compose for local development and automated testing.
