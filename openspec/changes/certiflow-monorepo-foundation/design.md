# Design

## Context

CertiFlow is an enterprise certificate issuance and multi-tiered verification platform designed for regulated governance workflows across training centres, district officers, quality assessors, state authorities, and public verification consumers. The platform must manage sensitive public records, enforce strict multi-tier approvals, process high-volume candidate batches, and issue tamper-evident credentials while preventing fraud, duplicate issuance, and unauthorized data access.

The repository currently contains an initialized Vite frontend (`frontend/`) and a placeholder `apps/backend/package.json`. To support the full lifecycle of certificate governance, the monorepo foundation must establish full-stack TypeScript tooling, shared validation schemas, database persistence, asynchronous background processing, security middleware, and enterprise UI/UX foundations before business features are developed.

See `proposal.md` for background motivation and high-level scope.

## Goals / Non-Goals

**Goals:**
- Establish a clean, modular monorepo structure with `apps/frontend`, `apps/backend`, `packages/shared`, and `tests/` using npm workspaces.
- Centralize full-stack TypeScript configurations via root `tsconfig.base.json` and share Zod validation schemas across frontend forms and backend API routes.
- Implement a modern enterprise design system using Tailwind CSS and shadcn/ui, centralizing the 8 official design tokens with verified WCAG 2.2 AA contrast compliance and scaffolding role-specific layouts based on the Hashbyt enterprise dashboard reference.
- Implement an Express.js backend with modular domain architecture, Zod request validation, centralized error handling, and `/health` monitoring.
- Establish comprehensive security foundations: asynchronous bcrypt hashing, dual-token JWT architecture with rotation and revocation, HttpOnly cookies, CSRF protection, server-side RBAC, district data isolation, general and public verification rate limiting, file upload guards, Helmet headers, CORS allowlisting, and sensitive-action audit logging.
- Configure PostgreSQL 16+ and Prisma ORM with core relational models (`User`, `Role`, `District`, `Batch`, `Candidate`, `Certificate`, `Approval`, `AuditLog`, `OutboxEvent`, `RefreshToken`), automated migrations, connection pooling, and demo seeding.
- Deploy Redis 7+ and BullMQ with dedicated queues (`excel-processing`, `batch-validation`, `certificate-generation`, `notifications`, `sla-reminders`), implementing an atomic Transactional Outbox pattern with an independent publisher worker and idempotent consumers.
- Build Excel processing foundations using ExcelJS with structure validation, row-level error reporting, 10MB/5,000-row limits, all-or-nothing transactional staging, and formula injection sanitization.
- Build certificate rendering foundations using PDFKit and `qrcode`, generating unique certificate numbers, embedding opaque verification URLs, preventing duplicate issuance, and supporting immediate status reflection upon revocation.
- Provide multi-stage Dockerfiles and Docker Compose orchestration for PostgreSQL, Redis, API, Worker, and Frontend services with health checks and persistent volumes.
- Establish unit, integration, and E2E testing harnesses, accompanied by complete developer onboarding and deployment documentation (`README.md`, `SETUP.md`, `DEPLOYMENT.md`, `.env.example`).

**Non-Goals:**
- Implementing production end-user onboarding, external OAuth identity providers, or self-service password reset flows in this change (foundational auth middleware, JWT utilities, and models are in scope; user-facing management workflows belong to future changes).
- Implementing complete multi-stage approval workflow progression logic or user interaction UI (foundation provides role route shells, RBAC guards, and database models).
- Integrating external WhatsApp Business API credentials or third-party SMS providers (foundation establishes the notification queue, payload interfaces, and worker consumers).
- Provisioning cloud infrastructure, Kubernetes manifests, or cloud key management vaults.

## Decisions

### Decision 1: Monorepo Workspace Tooling & Script Orchestration
- **Choice**: Use native npm workspaces with root package scripts and a shared `tsconfig.base.json`.
- **Rationale**: Standard npm workspaces provide zero-friction local package linking (`@certiflow/shared`) without third-party monorepo CLI overhead. Root scripts orchestrate concurrent development (`npm run dev`), workspace compilation (`npm run build`), linting (`npm run lint`), and testing (`npm run test`).
- **Alternatives Considered**:
  - *Turborepo / pnpm*: Excellent caching, but introduces additional global CLI dependencies during hackathon onboarding. Can be integrated incrementally later.
  - *Multi-repo*: High friction for sharing Zod schemas, types, and synchronized full-stack contracts across repositories.

### Decision 2: Target Layout, Package Boundaries, and Separation of Concerns
- **Choice**: Organize the repository into distinct application, library, and test packages:
  ```
  certiflow/
  ├── apps/
  │   ├── frontend/        # React 19 + Vite + Tailwind CSS + shadcn/ui client
  │   └── backend/         # Express API, BullMQ worker & Prisma application
  ├── packages/
  │   └── shared/          # Types, constants, and Zod validation schemas
  ├── tests/
  │   ├── integration/     # Full-stack API & database integration tests
  │   └── e2e/             # Playwright browser end-to-end test suites
  ├── docker-compose.yml
  ├── README.md
  ├── SETUP.md
  ├── DEPLOYMENT.md
  └── .env.example
  ```
- **Rationale**: Strict architectural separation prevents cross-tier pollution. `packages/shared` has zero runtime dependencies on Express or React. Business logic is strictly prohibited from Express route handlers, keeping services portable and unit-testable.

### Decision 3: Enterprise UI/UX Design System and Frontend Shell Architecture
- **Choice**: Build the frontend on React 19, Vite, Tailwind CSS, shadcn/ui, and React Hook Form with `@hookform/resolvers/zod`.
- **Primary Design Reference**: Translates the enterprise design principles from [Hashbyt Enterprise UI Design](https://hashbyt.com/blog/enterprise-ui-design) into the government certificate issuance and governance domain.
- **Design Philosophy**:
  - *Government Enterprise Identity*: Prioritize operational efficiency, clear visual hierarchy, and high data density over decorative consumer-app styling.
  - *Patterns Avoided*: Excessive gradients, non-functional animations, decorative metric cards without operational value, consumer-grade whitespace that forces unnecessary scrolling, inconsistent button styling, redundant navigation bars, and frivolous visual gimmicks.
- **Centralized Design Tokens**:
  - Navy: `#163A5F` (Primary government brand, header surfaces, active navigation borders)
  - Blue: `#245B85` (Secondary brand, interactive buttons, focused links, active tab underlines)
  - Gold: `#C49A3A` (Accents, certificate border seals, high-priority alert badges)
  - Teal: `#0F766E` (Success state indicator, verified credentials, approved badges)
  - White: `#FFFFFF` (Card surfaces, modal backgrounds, high-contrast dark-mode text)
  - Background: `#F4F7FA` (Neutral application canvas, reducing eye fatigue during long operational shifts)
  - Border: `#DCE3EA` (Card outlines, table gridlines, form control borders)
  - Text: `#172B3A` (Primary body and heading text with maximum legibility)
  - *Semantic Status Colors*: Success (`#0F766E`), Warning (`#C49A3A` badge background with `#172B3A` text), Destructive/Error (`#B91C1C`), Info (`#245B85`).
  - *Typography*: System font stack (`Inter, system-ui, -apple-system, sans-serif`), tabular figures (`tabular-nums`) for numeric data and counts.
  - *Borders & Radii*: Standardized 1px border (`#DCE3EA`) and enterprise compact radius (`rounded-md` 6px).
  - *Elevation*: Restrained shadows (`shadow-sm`, `shadow`) for modals and popovers only.
- **WCAG 2.2 AA Contrast Compliance Validation & Accessible Alternatives**:
  - `Text (#172B3A)` on `Background (#F4F7FA)`: Contrast ratio is **13.49:1** (exceeds WCAG AAA 7:1 standard).
  - `White (#FFFFFF)` on `Navy (#163A5F)`: Contrast ratio is **11.69:1** (exceeds WCAG AAA 7:1 standard).
  - `Blue (#245B85)` on `White (#FFFFFF)`: Contrast ratio is **7.25:1** (passes WCAG AAA 7:1 standard).
  - `Teal (#0F766E)` on `White (#FFFFFF)`: Contrast ratio is **5.54:1** (passes WCAG AA 4.5:1 standard for normal text).
  - `Gold (#C49A3A)` on `White (#FFFFFF)`: Contrast ratio is **2.63:1** (**FAILS** WCAG AA 4.5:1 for normal text).
  - **Explicit Accessibility Rule for Gold**: Gold (`#C49A3A`) SHALL NOT be used for normal body or caption text on light backgrounds (`#FFFFFF` or `#F4F7FA`). Gold is strictly reserved for non-text UI indicators (card borders, certificate seals, decorative icons) or as a background fill for badges paired with dark text (`#172B3A`), which achieves an accessible **5.51:1** contrast ratio (passing WCAG AA).
- **Application Shell Architecture**:
  - *Sidebar Navigation*: Role-aware, collapsible navigation with distinct active route styling (`bg-[#245B85]/10 text-[#163A5F] border-l-4 border-[#245B85]`).
  - *Top Navigation Bar*: Application branding logo, contextual breadcrumb navigation, notification bell with unread badge counter, and user profile menu with role badge and logout action.
  - *Page Header*: H1 page title, contextual subtitle description, and primary action toolbar slot.
  - *Responsive Navigation*: Persistent collapsible sidebar on desktop (>=1024px), touch-friendly overlay drawer on mobile and tablet (<1024px).
  - *Consistent Content Width*: Fluid layout with bounded maximum width (`max-w-7xl`) and responsive padding (`px-4 sm:px-6 lg:px-8`).
  - *Global State & Error Handling*: Full-page loading spinner skeleton and React Error Boundary with actionable recovery buttons.
  - *Minimal Public Verification Shell*: Completely unauthenticated, mobile-first single-card layout dedicated to certificate verification without administrative sidebars.
- **Role-Specific Dashboard Foundations**:
  - *Training Centre*: Batch overview metric cards, Create Batch action CTA, Excel upload wizard with upload progress indicator, row-level validation error inspector, submitted batch status tracking, returned batches with rejection reasons and resubmission triggers, and clear next action guidance.
  - *District Officer*: Pending approval queue, batch summary cards, candidate counts, review and approve modal actions, rejection modal requiring mandatory reason selection and remarks, SLA countdown timers, and overdue warning indicators.
  - *Quality Officer*: Quality-review queue, high-volume batch badges, quality anomaly flags with inspection evidence attachments, sample verification checklists, review decisions, and inspection history audit log.
  - *State Officer*: Final approval queue, statewide aggregated metrics (total candidates, batches approved, certificates issued), certificate issuance status, certificate cancellation modal with audit justification, and district/centre comparative reporting tables.
  - *Public Verification*: Minimalist public search interface (certificate ID / QR scan), instant genuine/revoked/invalid status badge, verified credential summary (course, completion date, masked student name for privacy), zero exposure of sensitive PII (Aadhaar, phone, address).
- **Enterprise Tables and Data Interaction**:
  - *Server-Side Pagination*: Configurable page size (10, 25, 50, 100), range indicator ("Showing 1 to 25 of 1,420 entries"), and quick page jumper.
  - *Server-Side Sorting*: Clickable column headers with visual sort direction indicators (arrow up/down) and `aria-sort` attributes.
  - *Filtering Toolbar*: Multi-criteria filter bar (text search, status dropdown, district filter, date range picker, and "Clear filters" action).
  - *Column Visibility*: Dropdown allowing users to toggle column display for dense datasets.
  - *Row Selection & Bulk Actions*: Checkbox column enabling bulk actions for authorized roles (e.g. "Approve selected (5)").
  - *Loading & Empty States*: Skeleton row placeholders matching table columns to prevent layout shift; actionable empty states for "No records yet" vs. "No matching filter results".
  - *Responsive Scrolling*: Horizontal scrolling with sticky primary key and action columns on constrained viewports.
  - *Virtualization Readiness*: Integrated with TanStack Virtual for datasets exceeding 1,000 rows.
- **Interaction Feedback and Error Recovery**:
  - Strict 8-state model: `Idle`, `Loading`, `Success`, `Validation Failure`, `Authorization Failure`, `Network Failure`, `Retry/Recovery`, `Processing in Progress`.
  - Human-readable error messages with concrete recovery instructions (e.g. "Row 14 contains an invalid Aadhaar number. Update the spreadsheet and re-upload.").
  - Two-step confirmation dialogs for high-impact actions (batch approval, batch rejection, certificate issuance, certificate revocation) with destructive action warnings in red/danger styling.
- **Accessibility (WCAG 2.2 AA) Strategy**:
  - Complete keyboard-only navigation workflows without mouse traps.
  - Visible, high-contrast focus rings (`focus-visible:ring-2 focus-visible:ring-[#245B85] focus-visible:ring-offset-2`).
  - Semantic HTML landmarks (`<header>`, `<nav>`, `<aside>`, `<main>`, `<footer>`, `<section>`).
  - Screen-reader support: `aria-live` announcements for dynamic updates, `aria-invalid` and `aria-describedby` for form fields, `aria-expanded` and `aria-controls` for accordions/drawers.
  - Minimum touch target size: 44x44px for interactive elements.
  - Text zoom resilience up to 200% without horizontal scroll or truncated text.
  - Dual-encoding status indicators: status never communicated by color alone (always paired with icons, text badges, and aria-labels).
  - Comprehensive workflow testing of shadcn/ui components in end-to-end user scenarios.
- **Design System Governance**:
  - Centralized component library in `apps/frontend/src/components/ui/` built on shadcn/ui and Tailwind.
  - Strict variant conventions: Button variants (`default`, `secondary`, `outline`, `destructive`, `ghost`), Badge variants (`default`, `success`, `warning`, `destructive`, `outline`).
  - Component contribution guidelines: every new component must include TypeScript types, WCAG 2.2 AA contrast verification, keyboard navigation tests, and documented usage examples.

### Decision 4: Mandatory API State Management with TanStack Query
- **Choice**: Use **TanStack Query (`@tanstack/react-query`)** as the standard and exclusive server-state management solution for the React frontend, with `@tanstack/react-query-devtools` loaded strictly in development.
- **Frontend Architecture Layout**:
  ```text
  apps/frontend/src/
  ├── app/
  │   ├── providers/
  │   │   └── QueryProvider.tsx    # Centralized QueryClientProvider
  │   └── App.tsx
  ├── lib/
  │   ├── api-client.ts            # Centralized Axios/Fetch client with AbortSignal support
  │   ├── query-client.ts          # Centralized QueryClient configuration
  │   └── query-keys.ts            # Feature-oriented hierarchical query key factory
  ├── features/
  │   ├── batches/
  │   │   ├── api/
  │   │   │   ├── batch.queries.ts # useQuery hooks for batch listing, details
  │   │   │   └── batch.mutations.ts # useMutation hooks for upload, submit, approve
  │   │   └── components/
  │   ├── certificates/
  │   └── verification/
  └── components/
  ```
- **Centralized QueryClient Defaults**:
  - `staleTime`: 1 minute for standard entities, 0 for active batch approval or processing queues.
  - `gcTime`: 10 minutes for garbage collection of inactive cache entries.
  - `retry`: 1 automatic retry with exponential backoff for queries; 0 retries for mutations to prevent unintended duplicate submissions.
  - `refetchOnWindowFocus`: false during development; enabled selectively for status-critical views.
- **Hierarchical Query Keys (`lib/query-keys.ts`)**:
  - Factory structure ensuring type-safe, scoped cache identifiers:
    ```typescript
    export const queryKeys = {
      batches: {
        all: ['batches'] as const,
        lists: () => [...queryKeys.batches.all, 'list'] as const,
        list: (filters: Record<string, unknown>) => [...queryKeys.batches.lists(), filters] as const,
        details: () => [...queryKeys.batches.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.batches.details(), id] as const,
      },
      certificates: { ... },
      verification: { ... },
    };
    ```
- **Targeted Cache Invalidation**:
  - Mutations (`useMutation`) execute state changes and immediately invalidate specific query key families on `onSuccess` (e.g. `batchMutations.useApproveBatch` invalidates `queryKeys.batches.lists()` and `queryKeys.batches.detail(id)`).
- **Pagination, Filtering, and Query Cancellation**:
  - Pagination, search queries, and status filters are incorporated directly into query keys (`queryKeys.batches.list({ page, limit, status })`).
  - The API client forwards `signal` from TanStack Query's `QueryFunctionContext` to underlying HTTP requests, automatically aborting stale requests when filters or search terms change rapidly.
- **Authentication Session Cache Cleanup**:
  - When a user logs out or authorization credentials change, the application invokes `queryClient.clear()` to purge all cached server state, preventing data leakage across user sessions.
- **Server State vs. Local UI State Boundary**:
  - Strict separation: Server data is never duplicated into Redux or Zustand stores. Zustand or React local state is used strictly for non-server client state (e.g. sidebar toggle, modal open states, active wizard step, draft filters).
- **Alternatives Considered**:
  - *Redux Toolkit / RTK Query*: Heavy boilerplate and global store ceremony unnecessary for a modular modern React stack.
  - *Zustand for server state*: Lacks built-in cache deduplication, background re-validation, window focus refetching, and automatic garbage collection.

### Decision 5: Security Foundation Architecture
- **Password Hashing**: Asynchronous bcrypt with 12 salt rounds in dedicated utility `src/utils/password.ts`.
- **JWT Dual-Token Architecture**:
  - Access Token: Short-lived (15 minutes), signed with `JWT_SECRET`, containing `userId`, `role`, and `districtId`.
  - Refresh Token: Long-lived (7 days), signed with `JWT_REFRESH_SECRET`, stored as an opaque hashed UUID in Redis and the database `RefreshToken` table.
  - Rotation & Revocation: When a refresh token is used, a new access/refresh pair is issued and the old refresh token is marked revoked. If a revoked refresh token is presented, all refresh tokens for that user session are invalidated immediately.
  - Cookie Handling & CSRF: Refresh tokens are transmitted in `HttpOnly`, `SameSite=Strict`, `Secure` (in production) cookies. Endpoints consuming cookies enforce CSRF header verification (`X-CSRF-Token`).
- **Authorization & Data Isolation**:
  - Server-side RBAC middleware (`authorizeRoles(...roles: Role[])`) checking the authenticated user's role.
  - District-Level Data Isolation: Scoping middleware and query filters that automatically append `where: { districtId: req.user.districtId }` for district-level actors (District Officers and Training Centres), preventing horizontal privilege escalation across jurisdictions.
- **Rate Limiting**:
  - General API: 100 requests per 15 minutes per IP.
  - Public Verification: Strict limiter of 10 requests per minute per IP to prevent certificate enumeration and brute-force scraping.
- **File Upload Security**:
  - Validation middleware checking MIME type (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`), file extension (`.xlsx`), and size limit (max 10MB) before parsing.
- **Network & Perimeter Protection**:
  - Helmet middleware configuring standard CSP, HSTS, frameguard, and referrer policy.
  - CORS allowlisting with explicit origins read from `CORS_ORIGIN` environment variable.
- **Sensitive-Action Audit Logging**:
  - Dedicated `AuditService` writing immutable records to `AuditLog` table capturing `actorId`, `actorRole`, `targetEntity`, `targetId`, `actionType`, `ipAddress`, `userAgent`, and `diffPayload`.

### Decision 6: Database Persistence and Relational Schema
- **Choice**: PostgreSQL 16+ managed with Prisma ORM.
- **Schema Entities**:
  - `User`: Accounts with email, hashed password, role enum, optional district foreign key, active status.
  - `Role`: Enum (`TRAINING_CENTRE`, `DISTRICT_OFFICER`, `QUALITY_OFFICER`, `STATE_OFFICER`, `ADMIN`).
  - `District`: Administrative geographic region for multi-tenant data isolation.
  - `Batch`: Training batch lifecycle, submission timestamps, version integer (incremented on resubmission), current status enum, district reference.
  - `Candidate`: Enrolled student records linked to batches, national ID hash, completion status.
  - `Certificate`: Issued credentials, unique certificate number, QR payload, PDF storage URL, issuance date, status (`ISSUED`, `REVOKED`, `SUSPENDED`).
  - `Approval`: Multi-tier governance log recording tier (`DISTRICT`, `QUALITY`, `STATE`), approver ID, decision (`APPROVED`, `REJECTED`), batch version reference, and remarks; enforces dual distinct district officer approvals per batch version.
  - `AuditLog`: Immutable audit trail for all critical administrative events.
  - `OutboxEvent`: Table for the transactional outbox pattern.
  - `RefreshToken`: Tracked active and revoked session refresh tokens.
- **Connection Management & Seeding**: Singleton `PrismaClient` with pool size tuning via `DATABASE_URL` (`connection_limit=10`). Seed script (`prisma/seed.ts`) idempotently creates default districts, roles, an administrative user, and demonstration batches.

### Decision 7: Redis, BullMQ Queue Topology and Transactional Outbox Pattern
- **Choice**: Redis 7+ and BullMQ with dedicated queues and an atomic Transactional Outbox pattern.
- **Queue Responsibilities**:
  1. `excel-processing`: Ingests and parses uploaded candidate spreadsheets asynchronously.
  2. `batch-validation`: Performs candidate eligibility, duplicate ID checks, and schema validation.
  3. `certificate-generation`: Renders PDFs and QR codes asynchronously.
  4. `notifications`: Formats and dispatches external WhatsApp/email notifications.
  5. `sla-reminders`: Tracks approval deadlines and dispatches escalation reminders.
- **Transactional Outbox Workflow**:
  1. *Atomic Commit*: When a domain event occurs (e.g. batch submission or certificate approval), the business mutation and an `OutboxEvent` row are saved within the same Prisma transaction (`prisma.$transaction`).
  2. *Independent Publisher Worker*: A dedicated background process periodically polls or listens for pending outbox events (`status = 'PENDING'`).
  3. *Queue Dispatch*: The publisher worker enqueues the event payload into the designated BullMQ queue.
  4. *Mark Published*: Upon successful Redis enqueuing, the outbox record is marked `PUBLISHED` with timestamp.
  5. *Retry on Failure*: Transient queue dispatch failures increment a retry counter and leave the event `PENDING` for backoff retry.
  6. *Idempotent Consumers*: BullMQ workers consume jobs using the `outboxEventId` as the BullMQ `jobId` for automatic deduplication, and verify database entity state before applying mutations to guarantee idempotent execution.
- **Worker Process Separation & Graceful Shutdown**:
  - Dual entrypoints: `apps/backend/src/app.ts` (API server) and `apps/backend/src/workers/index.ts` (Background worker process).
  - Graceful shutdown handles `SIGINT`/`SIGTERM` by stopping BullMQ queue polling, draining active jobs within 10 seconds, and closing Redis and Prisma connections cleanly.

### Decision 8: Excel Processing Infrastructure
- **Choice**: Use ExcelJS for streaming workbook parsing and export generation.
- **Validation & Limits**:
  - Enforce maximum 10MB file size and 5,000 rows per workbook.
  - Validate workbook structure: required column headers match expected schema.
  - Validate row data using shared Zod schemas from `@certiflow/shared`.
- **Error Handling**:
  - Return row-level structured error summaries (`[{ row: 12, column: "email", error: "Invalid email format" }]`).
  - All-or-nothing transactional staging: If any row fails validation, no candidate records are staged in the database, preventing partial or corrupt batch states.
- **Formula Injection Mitigation**:
  - Sanitize all exported spreadsheet cells: any text cell beginning with dangerous formula characters (`=`, `+`, `-`, `@`) is prepended with a single quote (`'`) to disable formula execution in client spreadsheet software.

### Decision 9: Certificate Rendering Infrastructure
- **Choice**: Asynchronous PDF generation via PDFKit paired with `qrcode` generation.
- **Certificate Numbering & Uniqueness**:
  - Deterministic certificate number format (e.g. `CF-<YEAR>-<DISTRICT_CODE>-<SERIAL>`) enforced with a PostgreSQL `UNIQUE` constraint on the `Certificate` table.
- **QR Code & Public Verification**:
  - Embed an opaque, non-guessable verification URL (e.g. `https://certiflow.gov.in/verify/<opaque-hash>`) into the generated QR code.
  - Scanning the QR code invokes the public verification endpoint, returning certificate validity, issuance date, recipient name (masked for privacy), and current status (`ISSUED`, `REVOKED`).
- **Duplicate Prevention & Cancellation**:
  - Worker processors check for existing certificate records by candidate and course ID before invoking PDFKit.
  - Certificate cancellation updates the database record to `REVOKED` and logs an audit entry, causing subsequent public verification scans to reflect `REVOKED` immediately.
- **Storage Abstraction**:
  - Generated PDFs are written to an abstract storage interface (`StorageService`) defaulting to local volume storage in development and S3/MinIO-compatible private object storage in production.

### Decision 10: Docker Infrastructure & Environment Management
- **Choice**: Multi-stage Dockerfiles and a unified `docker-compose.yml` defining 5 services:
  1. `postgres`: PostgreSQL 16 Alpine with `postgres_data` persistent volume and `pg_isready` health check.
  2. `redis`: Redis 7 Alpine with `redis_data` persistent volume and `redis-cli ping` health check.
  3. `api`: Express API container built from backend Dockerfile with health check probing `http://localhost:5000/health`.
  4. `worker`: BullMQ worker container built from backend Dockerfile with command override `node dist/workers/index.js`.
  5. `frontend`: Vite client built via multi-stage Dockerfile served with Nginx.
- **Startup Sequencing**: `api` and `worker` use `depends_on` with `condition: service_healthy` for `postgres` and `redis`.
- **Environment Blueprint**: `.env.example` documents all runtime variables for ports, secrets, database URLs, Redis connections, CORS origins, and rate limits.

## Risks / Trade-offs

- [Risk: TypeScript compilation overhead across full-stack workspaces] → Mitigation: Use a shared `tsconfig.base.json` with project references, incremental compilation flags, and separate build targets for frontend and backend.
- [Risk: PostgreSQL connection pool exhaustion with independent API and worker processes] → Mitigation: Explicitly configure Prisma connection limits in `DATABASE_URL` query parameters (`connection_limit=10`) and enforce singleton client instances.
- [Risk: Redis unavailability halting queue operations] → Mitigation: Implement health check probes in `GET /health`, configure ioredis reconnect backoff policies, and use the Transactional Outbox pattern so database transactions succeed even if Redis is momentarily unreachable.
- [Risk: Inaccessible color contrast with brand Gold (#C49A3A) on light backgrounds] → Mitigation: Restrict Gold to non-text decorative components (borders, seals) or badge backgrounds paired with dark text (`#172B3A`), strictly prohibiting Gold text on white/light canvases to guarantee WCAG 2.2 AA compliance.
- [Risk: CSV/Excel formula injection during student roster export] → Mitigation: Neutralize cell prefixes (`=`, `+`, `-`, `@`) with a leading single quote before writing workbook streams via ExcelJS.
- [Risk: Duplicate certificate issuance during BullMQ worker retries] → Mitigation: Enforce database-level unique constraints on certificate numbers and candidate-batch pairs, coupled with idempotent job processing that checks existing certificate records before generating PDFs.
- [Risk: Brute-force scraping of public certificate verification endpoint] → Mitigation: Apply strict IP-based rate limiting (10 req/min) on the verification route and use opaque unguessable URL tokens rather than sequential integer IDs.
- [Risk: Out-of-sync or duplicated server state in client-side state stores] → Mitigation: Standardize exclusively on TanStack Query for all server data fetching, caching, and mutation state, strictly restricting Zustand or React state to client-only UI interaction state.
