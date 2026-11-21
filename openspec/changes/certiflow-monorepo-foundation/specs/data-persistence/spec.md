# Spec Delta

## Purpose

Defines PostgreSQL relational database connectivity, Prisma ORM schema management, migration lifecycle, and demo seed data infrastructure.

## ADDED Requirements

### Requirement: Relational Schema and ORM Integration
The backend application SHALL use Prisma ORM with PostgreSQL defining core entities: User, Role, District, Batch, Candidate, Certificate, Approval, AuditLog, OutboxEvent, and RefreshToken.

#### Scenario: Initializing database client instance
- **WHEN** the backend application initializes
- **THEN** a singleton Prisma client connects to the PostgreSQL database defined by `DATABASE_URL`.

### Requirement: Schema Migration Lifecycle
The backend project SHALL provide executable npm scripts for creating and deploying database migrations using Prisma CLI.

#### Scenario: Running schema migrations
- **WHEN** `npm run db:migrate` is executed
- **THEN** Prisma applies pending database migrations sequentially and updates the migration tracking table.

### Requirement: Demo Seed Data Provisioning
The backend project SHALL provide a database seeding script (`prisma/seed.ts`) that initializes essential roles, administrative users, sample districts, and sample training records.

#### Scenario: Executing database seed script
- **WHEN** `npm run db:seed` is executed against an active database
- **THEN** default system roles, an administrator account, and demonstration records are created idempotently.

### Requirement: Database Connection Lifecycle Management
The backend application SHALL manage database connection pooling and disconnect gracefully on process termination signals.

#### Scenario: Receiving termination signal
- **WHEN** the Node.js process receives SIGINT or SIGTERM
- **THEN** the Prisma client disconnects its active connection pool cleanly before process exit.
