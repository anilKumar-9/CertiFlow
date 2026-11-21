# CertiFlow — Skilling Certificate Issuance & Verification Platform

> Government-grade, tamper-evident digital credential issuance and multi-tier verification platform built for national and state skilling initiatives. Compliant with NCVET governance standards and the Digital Personal Data Protection (DPDP) Act 2023.

---

## Table of Contents

1. [Architecture & System Overview](#1-architecture--system-overview)
2. [Prerequisites & Environment Setup](#2-prerequisites--environment-setup)
3. [Master Credentials Directory (All Roles)](#3-master-credentials-directory-all-roles)
4. [Step-by-Step Manual End-to-End Testing Walkthrough](#4-step-by-step-manual-end-to-end-testing-walkthrough)
   - [Step 1: Training Centre — Create Batch & Upload Excel Roster](#step-1-training-centre--create-batch--upload-excel-roster)
   - [Step 2: District Tier — Four-Eyes Dual-Officer Approval](#step-2-district-tier--four-eyes-dual-officer-approval)
   - [Step 3: Quality Assurance — 10% Statistical Audit Sampling](#step-3-quality-assurance--10-statistical-audit-sampling)
   - [Step 4: State Directorate — Final Clearance & Revocation Console](#step-4-state-directorate--final-clearance--revocation-console)
   - [Step 5: Public Gateway — Citizen & Employer QR Verification](#step-5-public-gateway--citizen--employer-qr-verification)
   - [Step 6: Executive Analytics — SLA Tracking & Formula-Safe Excel Export](#step-6-executive-analytics--sla-tracking--formula-safe-excel-export)
5. [Candidate Excel Roster Schema & Ingestion Specifications](#5-candidate-excel-roster-schema--ingestion-specifications)
6. [Security Perimeter & Threat Defenses](#6-security-perimeter--threat-defenses)
7. [Automated Test Suite Execution](#7-automated-test-suite-execution)
8. [Troubleshooting & FAQ](#8-troubleshooting--faq)

---

## 1. Architecture & System Overview

CertiFlow is structured as an enterprise-grade TypeScript monorepo providing end-to-end multi-tier batch verification, cryptographically verifiable PDF certificate generation with QR verification, transactional outbox dispatch, and role-based multi-tenant security.

```mermaid
flowchart TD
    subgraph Client["Web Presentation Layer (Port 5173)"]
        UI["React 19 / Vite / Tailwind CSS / shadcn UI"]
        TQ["TanStack Query Server-State Cache"]
    end

    subgraph API["Backend Runtime (Port 3001)"]
        EX["Express.js Security Perimeter (Helmet, CORS, Rate Limit)"]
        AUTH["Auth & JWT Rotation Engine (bcrypt 12 rounds)"]
        BATCH["Batch Ingestion & Streaming ExcelJS"]
        STATE["State Clearance & Revocation Engine"]
        OUTBOX["Transactional Outbox Publisher"]
    end

    subgraph Data["Persistence & Queue Topology"]
        PG[("Neon Serverless PostgreSQL DB")]
        REDIS[("Redis 7 Cache / BullMQ Queues")]
    end

    subgraph Workers["Asynchronous Processing Engine"]
        CW["Certificate PDFKit & Level H QR Generator"]
        NW["WhatsApp HSM Notification Dispatcher"]
        SW["48-Hour SLA Monitoring Scanner"]
    end

    UI <-->|REST API + SSE Stream| EX
    EX --> AUTH & BATCH & STATE
    AUTH & BATCH & STATE -->|Atomic Transactions| PG
    STATE --> OUTBOX
    OUTBOX -->|Enqueue Jobs| REDIS
    REDIS --> CW & NW & SW
    CW -->|Persist Issued Certs| PG
```

### Monorepo Structure

```text
certiflow/
├── apps/
│   ├── frontend/             # React 19, Vite, Tailwind CSS, shadcn/ui, TanStack Query
│   │   ├── src/
│   │   │   ├── components/   # Accessible UI primitives (Button, Card, Input, Label, Dialog, Table)
│   │   │   ├── pages/        # Role dashboards (Auth, TC, District, Quality, State, Public Verify)
│   │   │   └── tokens.ts     # WCAG 2.2 AA compliant government design tokens
│   │   └── postcss.config.js # PostCSS configuration linking Tailwind CSS & Autoprefixer
│   │
│   └── backend/              # Node.js 22, Express, Prisma ORM, BullMQ, Redis, PDFKit
│       ├── prisma/
│       │   ├── schema.prisma # Production relational models (User, Batch, Candidate, Certificate)
│       │   └── seed.ts       # Idempotent database seeder with pre-hashed credentials
│       └── src/
│           ├── modules/      # Business modules (auth, batches, district, quality, state, verify)
│           ├── workers/      # BullMQ workers (certificateWorker, notificationWorker, slaWorker)
│           └── config/       # Database, Redis, and environment configs
│
├── packages/
│   └── shared/               # Shared Zod validation schemas, domain types, and constants
├── sample_candidate_roster.xlsx # Valid 5-candidate Excel roster ready for upload testing
├── docker-compose.yml        # Multi-container orchestration (PostgreSQL, Redis, API, Worker, Web)
└── tests/                    # Automated unit, integration, and E2E test suites
```

---

## 2. Prerequisites & Environment Setup

### Required Runtimes
- **Node.js**: `v18.0.0` or higher (Node 20+ / Node 22 recommended)
- **npm**: `v9.0.0` or higher
- **PostgreSQL Database**: Configured via cloud (Neon Serverless PostgreSQL) or local instance.

### Step 1: Clone & Install Dependencies
From the repository root:
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy [.env.example](.env.example) to `.env` in the root and in `apps/backend/.env`:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://neondb_owner:npg_UTceD0tjrC7a@ep-silent-truth-bdyowdpu-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="certiflow-secure-access-jwt-secret-key-32-chars-min"
JWT_REFRESH_SECRET="certiflow-secure-refresh-jwt-secret-key-32-chars-min"
CSRF_SECRET="certiflow-secure-csrf-token-secret-key-32-chars-min"
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN="http://localhost:5173"
REDIS_HOST="localhost"
REDIS_PORT=6379
PUBLIC_VERIFY_RATE_LIMIT_MAX=10
```

### Step 3: Synchronize Schema & Seed Demonstration Records
Push the schema to Neon DB and populate test administrative accounts:
```bash
# Push database schema to Neon PostgreSQL
npm run db:push --workspace=@certiflow/backend

# Seed test officers, training centres, courses, and batches
npm run db:seed --workspace=@certiflow/backend
```

### Step 4: Start the Applications
Open two separate terminal windows:

**Terminal 1 — Backend API Runtime (Port 3001):**
```bash
npm run dev --workspace=@certiflow/backend
```
*Expected Output:*
```text
[CertiFlow API] Server listening on port 3001 in development mode
```

**Terminal 2 — Frontend UI (Port 5173):**
```bash
npm run dev --workspace=@certiflow/frontend
```
*Expected Output:*
```text
  VITE v6.0.3  ready in 240 ms
  ➜  Local:   http://localhost:5173/
```

Open **`http://localhost:5173`** in your browser.

---

## 3. Master Credentials Directory (All Roles)

All pre-seeded demonstration accounts share the master password below:

> **Master Demo Password**: `DemoPassword123!`

| Role Level | Official Title | Login Email | Assigned Jurisdiction / Scope | Primary Governance Authority |
| :--- | :--- | :--- | :--- | :--- |
| **Training Centre** | Apex Skilling Delhi | `centre.delhi@skills.org` | Central Delhi (`DL-01`) | Create batch, upload Excel roster, submit to SLA queue |
| **District Officer 1** | Pooja Verma (DO-01) | `district.delhi1@certiflow.gov.in` | Central Delhi (`DL-01`) | Dual-sign approval (1/2), inspection notes, return for revision |
| **District Officer 2** | Amit Patel (DO-02) | `district.delhi2@certiflow.gov.in` | Central Delhi (`DL-01`) | Dual-sign approval (2/2), completes four-eyes district clearance |
| **Quality Officer** | Sunita Rao (QA) | `quality.officer@certiflow.gov.in` | Statewide Quality Directorate | 10% PRNG audit sampling, high-volume anomaly checks |
| **State Director** | Dr. Ramesh Kumar (DG) | `state.officer@certiflow.gov.in` | State Government Skill Mission | Final clearance, asynchronous PDFKit issuance, certificate revocation |
| **Platform Admin** | Platform Administrator | `admin@certiflow.gov.in` | System-Wide | Audit log inspection, security settings, user provisioning |
| **Public Citizen** | Open Citizen / Employer | *No Login Required* | National Public Gateway | QR code scanning & certificate authenticity verification |

> **Tip**: On the **Gov Sign-In** page (`/login`), click the quick-fill chips under **"Quick Demo Role Auto-Fill"** to automatically populate both the email and password for any role in one click.

---

## 4. Step-by-Step Manual End-to-End Testing Walkthrough

Follow this operational flow to experience the complete certificate lifecycle from training centre roster creation to public verification:

```text
[1. Training Centre]        [2. District Dual-Sign]       [3. Quality Assurance]
  Create Batch               Officer 1 Signs (1/2)          10% PRNG Sample Audit
  Upload Excel Roster  --->  Officer 2 Signs (2/2)  --->     High-Volume Check
  Submit to District         (Enforces 48h SLA)             Certify Quality Pass
                                                                  │
                                                                  ▼
[5. Public Verification]    [4. State Directorate]
  Scan / Enter Cert ID <---  Grant Final Clearance
  Cryptographic Match        Asynchronous PDFKit Generation
  Masked Citizen PII         (Optional: Revocation Console)
```

---

### Step 1: Training Centre — Create Batch & Upload Excel Roster

1. In the top navigation bar, click **"🔐 Gov Sign-In"** (or use the role switcher button **"🏫 Training Centre"**).
2. Click the **"Training Centre"** auto-fill chip (`centre.delhi@skills.org`) and click **"Sign In to Governance Console"**.
3. You will arrive at the **Training Centre Batch Operations** dashboard:
   - Notice the metric cards: *Active Batches*, *Total Candidates*, *SLA Clock State*, and *Validation Health*.
4. **Register a New Batch**:
   - Click the **"+ Register New Batch"** button in the header.
   - Enter Course Title: `Certified Solar Energy Technician (NSQF Level 4)`.
   - Set Start Date: `2026-04-01`, End Date: `2026-06-30`.
   - Click **"Save & Open Roster"**. A new batch appears in `DRAFT` status.
5. **Upload Candidate Excel Roster**:
   - In the batches table, find the draft batch and click **"Upload Roster"**.
   - Drag and drop or browse to select the ready-made test file located in your project root:
     `sample_candidate_roster.xlsx`
   - Click **"Process & Stage Roster"**.
   - The candidate count updates to 5 validated candidates.
6. **Submit to District**:
   - Click **"Submit to District"**.
   - The batch status changes to `SUBMITTED`, starting the **48-hour SLA countdown timer** for district officers.

---

### Step 2: District Tier — Four-Eyes Dual-Officer Approval

CertiFlow enforces **four-eyes governance**: two distinct authorized district officers must independently review and sign off before any batch can advance.

#### A. Officer 1 Review
1. Switch to the **"🏛️ District Dual-Sign"** dashboard from the top navigation bar.
2. Notice the batch table displaying the submitted batch, candidate count, and the active **48-Hour SLA Clock** badge.
3. Under the **"Four-Eyes Status"** column, it indicates: `Awaiting Officer 1 Review`.
4. Click **"Review & Sign"**.
5. A modal appears with legal certification declarations. Check the confirmation checkbox:
   *`"I confirm that all candidate dossiers in this batch have been audited without discrepancy."`*
6. Click **"Record Legal Signature"**.
7. The status updates to **`1/2 Signed (Pooja Verma)`** and prompts: *`⏳ Awaiting Officer 2 Sign-off`*.

#### B. Officer 2 Review (Completing District Clearance)
1. In production, Officer 2 signs in from their own device. In this evaluation sandbox, click **"Review & Sign"** to record Officer 2's sign-off (`Amit Patel`).
2. Confirm the audit certification and click **"Record Legal Signature"**.
3. The batch is now officially **District Approved** (2/2 signatures recorded) and automatically transitions to the Quality Assurance queue.

#### C. Testing the "Return for Revision" Flow (Optional)
- If an officer discovers a discrepancy, they click **"Request Revision"**.
- A mandatory revision remarks textarea opens. Entering a reason (e.g., `Row 4 attendance shortfall`) and submitting increments the batch version to `v2.0` and sends it back to the Training Centre for correction.

---

### Step 3: Quality Assurance — 10% Statistical Audit Sampling

1. Click **"🛡️ Quality Sampling"** in the top navigation bar.
2. Review the **Quality Assurance & Audit Portal**:
   - Observe the **Automated High-Volume Vigilance Trigger** banner: any batch with $\ge 100$ candidates is automatically flagged with an amber vigilance badge.
   - For batches undergoing audit, CertiFlow's pseudo-random number generator (PRNG) automatically samples exactly **10% of candidates** for physical dossier scrutiny.
3. In the sampling queue table, click **"Audit Sample Dossiers"**.
4. The **Quality Audit Verification Checklist** modal opens. Verify and check all three mandatory criteria:
   - [x] *Randomized 10% candidate records match master identity hash records.*
   - [x] *Assessment scorecard criteria meets state-mandated pass threshold ($\ge 50\%$).*
   - [x] *No duplicate enrollment or Aadhaar collision detected across active batches.*
5. Enter audit remarks: `Biometric attendance logs and marksheets verified against district records.`
6. Click **"Certify Quality Pass & Forward to State"**.
7. The batch is now quality-certified and escalated to the State Directorate.

---

### Step 4: State Directorate — Final Clearance & Revocation Console

1. Click **"👑 State Clearance"** in the top navigation bar.
2. You will see the **State Directorate Final Issuance & Governance Portal**:
   - Displays batches cleared by both District Officers and Quality Assurance.
   - Shows statewide KPIs: Total Certificates Issued, Batches Ready For Issuance, Public Verifications (24h), and Revoked Certificates.
3. **Grant Executive Issuance**:
   - In the table, click **"Grant State Clearance & Issue"**.
   - A modal details the asynchronous pipeline:
     1. Creates atomic `CERTIFICATE_BATCH_CLEARED` outbox event in PostgreSQL.
     2. Enqueues job to BullMQ `certificate-generation` worker.
     3. Renders landscape A4 PDF with official borders, signatures, and Level H QR codes.
     4. Prepares WhatsApp HSM delivery notifications for candidates.
   - Click **"Confirm & Dispatch Issuance"**.
4. **Emergency Certificate Revocation (Revocation Authority)**:
   - In the top right header, click **"Revocation Console"**.
   - Enter a certificate identifier: `CF-2026-DL-000001`.
   - Select legal grounds: `Fraudulent Assessment Scores`.
   - Enter inquiry remarks: `Order No. REV-2026-089 pursuant to state vigilance committee inquiry.`
   - Click **"Execute Permanent Revocation"**.
   - The certificate is immediately revoked across the national verification registry.

---

### Step 5: Public Gateway — Citizen & Employer QR Verification

CertiFlow provides a zero-auth, high-security public portal for citizens, employers, and government departments to verify credential authenticity.

1. Click **"🔍 Public Verification"** in the top navigation bar (or visit `/`).
2. Review the government identity header: National Tricolor band, *भारत सरकार | Government of India*, NCVET seal, and DPDP Act compliance indicators.
3. **Test 1: Verify a Genuine Credential**:
   - In the **Quick Demo Inputs** section below the form, click **"✓ Genuine Sample"** (or type `CF-2026-DL-000001`).
   - Click **"Verify Credential Authenticity"**.
   - Notice the loading state: *`Verifying Cryptographic Ledger...`*.
   - **Result**: An emerald-bordered **`OFFICIALLY AUTHENTICATED & VALID`** certificate dossier appears:
     - Course Title: *Certified Solar Energy Technician (NSQF Level 4)*.
     - Candidate Name: `R**** S****` (*Masked for citizen privacy per DPDP Act*).
     - Unique Certificate ID: `CF-2026-DL-000001`.
     - Issuing Authority: *Delhi State Skill Development Mission*.
     - Cryptographic SHA-256 Fingerprint Checksum.
     - Buttons to **"Print Verification Slip"** and **"Download Audit Slip (PDF)"**.
4. **Test 2: Verify a Revoked Credential**:
   - Click the **"⚠ Revoked Sample"** quick-fill chip (or type `CF-2026-DL-REVOKED`).
   - Click **"Verify Credential Authenticity"**.
   - **Result**: A crimson **`OFFICIAL WARNING: CREDENTIAL REVOKED`** alert displays:
     - Warning banner stating the credential possesses **zero legal validity**.
     - Date of cancellation and official inquiry order number.
5. **Test 3: Verify an Unmatched / Fake Identifier**:
   - Click **"✕ Unmatched Sample"** (or type `INVALID-NUM-999`).
   - **Result**: An amber advisory card confirms: *`NO RECORD FOUND IN NATIONAL REGISTRY`* with troubleshooting guidance to prevent forged document usage.
6. **Test 4: Scan Physical QR Code**:
   - Click the **"Scan QR Code"** tab on the card.
   - Test camera QR simulator or scan any generated certificate QR code.

---

### Step 6: Executive Analytics — SLA Tracking & Formula-Safe Excel Export

1. Click **"📊 Analytics"** in the top navigation bar.
2. Review the **Statewide Skilling Analytics & Audit Reporting** console:
   - High-level KPIs: *Total Batches Enrolled (60)*, *Total Candidates Certified (3,730)*, *48-Hour SLA Compliance Rate (97.1%)*, *Total Revocations (14)*.
   - District-level performance breakdown table comparing Delhi Central, North, South, and East.
3. **Export Audit Report (Formula Injection Protected)**:
   - Click **"📥 Export Governance Excel"** in the header.
   - The export process generates a spreadsheet.
   - **Security Mechanism**: All cell values starting with dangerous spreadsheet formula triggers (`=`, `+`, `-`, `@`) are automatically sanitized with prepended single quotes (`'`) to neutralize CSV/formula injection attacks on administrative spreadsheet terminals.

---

## 5. Candidate Excel Roster Schema & Ingestion Specifications

The Training Centre ingestion engine parses `.xlsx` workbooks using streaming ExcelJS to enforce memory limits (10MB max file size, up to 5,000 candidates per batch).

> **Super Simple Setup**: The downloaded template (`CertiFlow_Batch_Upload_Template.xlsx`) opens directly to **Sheet 1: `Candidate Roster`**. The 8 columns are already placed across Row 1 with pre-filled sample candidates in Rows 2–6. You can edit the sample rows or paste your candidates directly underneath.

### The 8 Existing Columns to Fill (Row 1 Headers)

| Column Header | Data Type | Validation Rule | Example Value |
| :--- | :--- | :--- | :--- |
| `fullName` | String | 2 to 100 characters, letters and spaces only | `Rahul Verma` |
| `fatherName` | String | 2 to 100 characters, letters and spaces only | `Suresh Verma` |
| `dob` | Date / String | ISO format `YYYY-MM-DD`, candidate age $\ge 14$ | `2001-05-14` |
| `gender` | Enum | Must be `MALE`, `FEMALE`, or `OTHER` (dropdown available) | `MALE` |
| `aadhaar` | String (Text) | Exactly 12 numeric digits without hyphens/spaces | `234567890123` |
| `phone` | String (Text) | Exactly 10 digits without country code or leading 0 | `9876543210` |
| `email` | String | Standard valid email address | `rahul.verma@example.com` |
| `enrollmentNumber` | String | Unique registration / roll number from centre | `ENR-2026-0001` |

> **Ready-to-use Sample File**: Use [sample_candidate_roster.xlsx](sample_candidate_roster.xlsx) located directly in your repository root to test batch uploads immediately.

---

## 6. Security Perimeter & Threat Defenses

CertiFlow implements defense-in-depth across every tier:

1. **Aadhaar Privacy (DPDP Act 2023 Compliant)**:
   - Citizen raw 12-digit Aadhaar numbers are **never stored** in cleartext.
   - The backend computes a one-way `SHA-256` hash and only stores the last 4 masked digits (`XXXX-XXXX-1234`).
2. **Dual-Token Authentication & Refresh Rotation**:
   - Access tokens: Short-lived 15-minute JWTs.
   - Refresh tokens: 7-day cryptographically random UUIDs (`jti`).
   - Token Rotation: Exchanging a refresh token immediately invalidates it.
   - Token Reuse Breach Revocation: Presenting a previously exchanged refresh token flags a breach and revokes **all** active user sessions.
3. **Dual-Officer Four-Eyes Governance**:
   - The same district officer cannot sign twice on the same batch version.
   - Revisions increment the version counter, archiving previous inspection notes.
4. **Formula Injection Neutralization**:
   - Spreadsheet generators prepend a single quote (`'`) to any string initiating with `=`, `+`, `-`, or `@`.
5. **Anti-Scraping Public Rate Limiting**:
   - Public verification endpoints are strictly throttled to 10 requests per minute per IP.
   - Caller IP addresses are logged only as anonymized SHA-256 hashes in `VerificationLog`.

---

## 7. Automated Test Suite Execution

CertiFlow features 100% passing automated test coverage across unit, platform, integration, and security layers:

```bash
# Run unit, platform E2E, and security test suite (35 tests)
npm run test:unit

# Run API runtime and HTTP security header integration tests (4 tests)
npx vitest run --config vitest.integration.config.ts

# Build all monorepo workspaces (TypeScript 0 errors)
npm run build
```

---

## 8. Troubleshooting & FAQ

#### Q1: "Cannot connect to Redis at localhost:6379" notice in backend console?
**Explanation**: In local development without Docker, Redis is optional. The backend includes automatic graceful degradation: caching and async queues will run in fallback mode without crashing your API.
**Fix**: If you wish to run Redis, start Docker Desktop and run:
```bash
docker run -d -p 6379:6379 --name certiflow-redis redis:alpine
```

#### Q2: "listen EADDRINUSE: address already in use :::3001"?
**Explanation**: Another process is occupying port 3001.
**Fix**: Identify and stop the process, or update `PORT` in `.env`:
```powershell
# Find and terminate process on port 3001
Get-NetTCPConnection -LocalPort 3001 | Select-Object OwningProcess
Stop-Process -Id <PID> -Force
```

#### Q3: "Environment variable not found: DATABASE_URL"?
**Explanation**: Prisma requires `.env` in the root or `apps/backend/`.
**Fix**: Ensure your [.env](.env) file exists and contains the valid PostgreSQL connection string.

---

## 9. Regulatory & Legal Disclaimers

- **NCVET Alignment**: Built according to guidelines issued by the National Council for Vocational Education and Training.
- **DPDP Act 2023**: All citizen demographic attributes conform to data minimization and privacy mandates.
- **Digital Signatures**: Certificate QR hashes are cryptographically computed using SHA-256 ledgers.
