# Tasks

## 1. Repository and Workspace Foundation

- [x] 1.1 Audit existing repository, Node.js and npm versions, and verify toolchain compatibility across the workspace (`node -v` >= 18 and `npm -v` >= 9).
- [x] 1.2 Initialize root `package.json` with npm workspaces (`"workspaces": ["apps/*", "packages/*"]`) and root scripts, and verify workspace resolution with `npm ls --workspaces`.
- [x] 1.3 Relocate existing `frontend/` directory into `apps/frontend/` preserving all source code, assets, and configs, and verify directory structure and file integrity.
- [x] 1.4 Create shared root `tsconfig.base.json` with strict type checking, ES2022 target, and modern module resolution, and verify tsconfig inheritance across subprojects.
- [x] 1.5 Create root `.gitignore` and `.env.example` defining environment variables for all services, ports, secrets, and database/Redis URLs, and verify file contents.

## 2. Frontend Design System and Application Shell

- [x] 2.1 Update `apps/frontend/package.json` with `@certiflow/frontend`, configuring Tailwind CSS, shadcn/ui, `@tanstack/react-query`, and `@tanstack/react-query-devtools` (devDependency), and verify resolution with `npm ls --workspace=@certiflow/frontend`.
- [x] 2.2 Configure Tailwind CSS and centralize the 8 enterprise design tokens (`#163A5F`, `#245B85`, `#C49A3A`, `#0F766E`, `#FFFFFF`, `#F4F7FA`, `#DCE3EA`, `#172B3A`), typography, spacing, and status colors with WCAG 2.2 AA contrast rules, and verify CSS compilation.
- [x] 2.3 Initialize shadcn/ui primitives (`Button`, `Card`, `Input`, `Table`, `Badge`, `Dialog`, `DropdownMenu`, `Tabs`) in `apps/frontend/src/components/ui/` with standardized variants, and verify component rendering.
- [x] 2.4 Implement enterprise Application Shell layout with collapsible role-aware sidebar, top navigation, breadcrumbs, notifications area, user profile menu, and global error boundary, and verify shell mounting.
- [x] 2.5 Implement standalone minimalist Public Verification shell with clean single-card verification layout and zero administrative navigation, and verify public route layout.
- [x] 2.6 Implement role-specific dashboard layout foundations for Training Centre, District Officer, Quality Officer, and State Officer, and verify role-based navigation and route views.
- [x] 2.7 Implement reusable enterprise data table component supporting server-side pagination, sorting, multi-criteria filtering, column visibility, row selection, skeletons, and empty states, and verify table interactions.
- [x] 2.8 Implement high-impact operation confirmation dialogs and feedback toasts supporting the 8-state interaction model (`Idle`, `Loading`, `Success`, `Error`, `Retry`), and verify feedback component triggers.
- [x] 2.9 Setup React Hook Form with `@hookform/resolvers/zod` and integrate shared validation schemas into sample form inputs, and verify form validation error rendering.
- [x] 2.10 Configure centralized `QueryClient` (`src/lib/query-client.ts`), `QueryClientProvider` (`src/app/providers/QueryProvider.tsx`), API client with `AbortSignal` forwarding (`src/lib/api-client.ts`), and query key factories (`src/lib/query-keys.ts`), and verify provider mounting and request cancellation.

## 3. Shared TypeScript and Zod Package

- [x] 3.1 Initialize `packages/shared/package.json` with `@certiflow/shared` and build scripts, and verify type compilation with `npm run build --workspace=@certiflow/shared`.
- [x] 3.2 Define shared domain TypeScript types in `packages/shared/types/` (`User`, `Role`, `District`, `Batch`, `Candidate`, `Certificate`, `Approval`, `AuditLog`), and verify TypeScript compilation.
- [x] 3.3 Define shared system constants in `packages/shared/constants/` covering role enums, batch statuses, queue names, and event topic names, and verify constant exports.
- [x] 3.4 Define shared Zod validation schemas in `packages/shared/validation/` for auth payloads, batch submissions, and candidate row data, and verify schema unit tests.
- [x] 3.5 Link `@certiflow/shared` into `apps/frontend` and `apps/backend` and verify cross-workspace imports compile without resolution errors.

## 4. Backend Runtime and Security Middleware

- [x] 4.1 Initialize `apps/backend/package.json` with `@certiflow/backend`, Express, TypeScript, CORS, Helmet, and express-rate-limit, and verify dependency installation.
- [x] 4.2 Scaffold modular backend directory architecture (`src/modules/*`, `src/workers/`, `src/queues/`, `src/events/`, `src/middleware/`, `src/config/`), and verify directory tree.
- [x] 4.3 Implement backend configuration module in `apps/backend/src/config/env.ts` with Zod environment variable validation, and verify boot validation fails when variables are missing.
- [x] 4.4 Configure security middleware: Helmet, strict CORS allowlisting from `CORS_ORIGIN`, JSON body parser with size limits, and general API rate limiting, and verify response security headers.
- [x] 4.5 Implement strict public verification rate limiter (10 requests per minute per IP) mounted on `/api/v1/verification`, and verify HTTP 429 response on rate limit breach.
- [x] 4.6 Implement file upload security middleware validating MIME type (`.xlsx`), file extension, and 10MB size ceiling, and verify HTTP 400 rejection for disallowed files.
- [x] 4.7 Implement centralized error handling middleware in `src/middleware/errorHandler.ts` returning standard JSON error envelopes, and verify operational error formatting.
- [x] 4.8 Implement `GET /health` endpoint reporting service uptime, timestamp, and database/Redis connectivity statuses, and verify HTTP 200 response via curl.

## 5. Prisma Schema and Persistence

- [x] 5.1 Initialize Prisma configuration in `apps/backend/prisma/schema.prisma` targeting PostgreSQL, and verify schema syntax with `npx prisma validate`.
- [x] 5.2 Define complete relational domain models in `schema.prisma`: `User`, `Role`, `District`, `Batch`, `Candidate`, `Certificate`, `Approval`, `AuditLog`, `OutboxEvent`, and `RefreshToken`, and verify Prisma schema validation.
- [x] 5.3 Configure database migration scripts in backend `package.json` (`db:migrate`, `db:generate`, `db:push`), and verify Prisma client generation with `npx prisma generate`.
- [x] 5.4 Implement singleton database client in `apps/backend/src/config/database.ts` with connection pooling and graceful disconnect, and verify clean disconnect on process termination.
- [x] 5.5 Implement idempotent demo database seed script in `apps/backend/prisma/seed.ts` populating default districts, system roles, an administrator account, and sample batches, and verify execution via `npm run db:seed`.

## 6. Authentication and Authorization Foundations

- [x] 6.1 Implement asynchronous password hashing utility in `src/utils/password.ts` using bcrypt with 12 salt rounds, and verify hash generation and comparison tests.
- [x] 6.2 Implement JWT token service in `src/utils/jwt.ts` generating short-lived access tokens (15m) and long-lived refresh tokens (7d), and verify token signing and decoding tests.
- [x] 6.3 Implement refresh token rotation and revocation service storing tokens in Redis and `RefreshToken` table, and verify token reuse triggers complete revocation.
- [x] 6.4 Implement authentication middleware (`authenticate`) validating JWT access tokens or HttpOnly cookies and verifying CSRF tokens, and verify HTTP 401 on missing or invalid tokens.
- [x] 6.5 Implement server-side RBAC middleware (`authorizeRoles`) restricting endpoint access by user role enum, and verify HTTP 403 on unauthorized role access.
- [x] 6.6 Implement district-level multi-tenant data isolation filter helper scoping database queries to `req.user.districtId`, and verify cross-district queries are blocked.
- [x] 6.7 Implement sensitive-action audit logging service in `src/modules/audit/auditService.ts` writing immutable records to `AuditLog`, and verify audit record creation on sensitive actions.

## 7. Redis, BullMQ and Transactional Outbox

- [x] 7.1 Implement Redis client singleton in `apps/backend/src/config/redis.ts` using ioredis with reconnect backoff and health inspection, and verify Redis ping response.
- [x] 7.2 Implement BullMQ queue definitions in `apps/backend/src/queues/` for the 5 dedicated queues: `excelQueue`, `validationQueue`, `certificateQueue`, `notificationQueue`, and `slaQueue`, and verify queue instantiation.
- [x] 7.3 Implement Transactional Outbox helper in `src/events/outbox.ts` that writes `OutboxEvent` records within Prisma `$transaction` operations, and verify atomic commit.
- [x] 7.4 Implement independent Outbox Publisher worker in `src/workers/outboxPublisher.ts` polling pending events and dispatching to BullMQ, and verify outbox status transitions to PUBLISHED.
- [x] 7.5 Implement background worker entrypoint in `apps/backend/src/workers/index.ts` with idempotent execution checks and graceful shutdown handlers, and verify standalone worker lifecycle.

## 8. Excel Processing Infrastructure

- [x] 8.1 Implement Excel parser service in `src/modules/batches/excelParser.ts` using ExcelJS to stream and read student batch workbooks, and verify workbook parsing into JSON.
- [x] 8.2 Implement workbook structure and row validation against shared Zod candidate schemas with 10MB size and 5,000 row limits, and verify rejection of oversized workbooks.
- [x] 8.3 Implement row-level error aggregator returning structured error arrays with row numbers, column names, and validation failure reasons, and verify aggregated error report format.
- [x] 8.4 Implement all-or-nothing transactional staging ensuring zero candidate records persist if any row validation fails, and verify database rollback on invalid batch.
- [x] 8.5 Implement formula injection neutralization utility for Excel exports prepending single quotes to cells starting with `=`, `+`, `-`, or `@`, and verify cell neutralization in exports.

## 9. PDF and QR Rendering Infrastructure

- [x] 9.1 Implement PDFKit certificate generation service in `src/modules/certificates/pdfGenerator.ts` producing formatted certificates from templates, and verify valid PDF buffer output.
- [x] 9.2 Implement QR code generation utility using `qrcode` generating PNG buffers and embedding opaque public verification URLs (`/verify/<opaqueToken>`), and verify URL payload decoding.
- [x] 9.3 Implement deterministic unique certificate numbering generator with database uniqueness constraint checks, and verify certificate number format and uniqueness.
- [x] 9.4 Implement duplicate issuance prevention logic in the certificate BullMQ worker checking existing candidate certificates before generation, and verify duplicate skip behavior.
- [x] 9.5 Implement certificate revocation status handling ensuring public verification endpoint immediately returns status `REVOKED` when certificate is cancelled, and verify revoked status response.

## 10. Docker and Deployment Configuration

- [x] 10.1 Create multi-stage `apps/frontend/Dockerfile` with Node build stage and Nginx runtime stage, and verify Docker build execution.
- [x] 10.2 Create multi-stage `apps/backend/Dockerfile` supporting both API server and worker commands via entrypoint override, and verify Docker build execution.
- [x] 10.3 Create root `docker-compose.yml` declaring `postgres`, `redis`, `api`, `worker`, and `frontend` services with persistent volumes (`postgres_data`, `redis_data`), and verify configuration with `docker compose config`.
- [x] 10.4 Configure health checks for `postgres` (`pg_isready`), `redis` (`redis-cli ping`), and `api` (`curl /health`) with `service_healthy` dependencies, and verify service startup ordering.
- [x] 10.5 Add root npm scripts for Docker management (`docker:up`, `docker:down`, `docker:logs`, `docker:build`), and verify script invocation.

## 11. Testing and Security Verification

- [x] 11.1 Configure Vitest test runner across workspace packages with unit test scripts in root `package.json` (`npm run test:unit`), and verify runner execution.
- [x] 11.2 Implement unit tests for `@certiflow/shared` Zod schemas, constants, and utilities, and verify all unit tests pass with `npm run test:unit`.
- [x] 11.3 Implement API integration tests using Supertest in `tests/integration/` verifying `/health`, security headers, rate limiting, and error handler envelopes, and verify test suite pass.
- [x] 11.4 Implement database integration tests validating Prisma entity operations, transaction rollbacks, and outbox event persistence against a test database, and verify test execution.
- [x] 11.5 Implement security test suite verifying bcrypt salt rounds, JWT expiration, CSRF protection, and district data isolation guards, and verify security tests pass.
- [x] 11.6 Scaffold Playwright end-to-end test suite in `tests/e2e/` with base configuration and smoke test script (`npm run test:e2e`), and verify test configuration runs.
- [x] 11.7 Implement frontend test suite for TanStack Query hooks, verifying useQuery data fetching, useMutation cache invalidation, and AbortSignal cancellation behavior.
- [x] 11.8 Implement accessibility test suite validating WCAG 2.2 AA conformance (automated axe-core checks, keyboard focus traversal, screen-reader labels, and 44x44px target sizes).
- [x] 11.9 Implement responsive layout test suite verifying mobile drawer, desktop sidebar, table horizontal scrolling, and 200% text zoom without clipping.
- [x] 11.10 Implement UI component unit tests verifying shadcn/ui buttons, tables, dialogs, and form inputs for accessible state rendering and variant styling.

## 12. Documentation and Final Validation

- [x] 12.1 Author root `README.md` covering architecture overview, technology stack, monorepo directory layout, and development workflow, and verify markdown rendering.
- [x] 12.2 Author `SETUP.md` with step-by-step developer onboarding instructions (prerequisites, Docker setup, Prisma migrations, demo seeds, running dev servers), and verify instructions against a clean environment.
- [x] 12.3 Author `DEPLOYMENT.md` detailing multi-stage container builds, environment configuration, volume persistence, and worker scaling, and verify documentation completeness.
- [x] 12.4 Author comprehensive `.env.example` with documented environment variables for all services, secrets, database URLs, and rate limits, and verify variable completeness against configuration loaders.
- [x] 12.5 Perform end-to-end repository validation checking workspace installation, TypeScript build, linting, tests, and Docker Compose validation, and verify zero errors across all checks.
