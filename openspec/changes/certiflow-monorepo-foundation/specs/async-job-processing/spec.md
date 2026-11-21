# Spec Delta

## Purpose

Defines Redis-backed BullMQ queue infrastructure with dedicated queue responsibilities, an atomic Transactional Outbox pattern, and idempotent consumer execution.

## ADDED Requirements

### Requirement: Dedicated Queue Responsibilities
The backend application SHALL configure five separate BullMQ queues: excel-processing, batch-validation, certificate-generation, notifications, and sla-reminders.

#### Scenario: Dispatching tasks to specific queue
- **WHEN** an asynchronous event requires background processing
- **THEN** the task is routed to its dedicated BullMQ queue with configured concurrency and retry backoff.

### Requirement: Transactional Outbox Pattern
The backend system SHALL persist business mutations and outbox events in a single atomic database transaction before asynchronous dispatch.

#### Scenario: Committing transactional domain operation
- **WHEN** a state change occurs in a domain service
- **THEN** the entity mutation and corresponding OutboxEvent row are committed atomically in Prisma.

### Requirement: Independent Outbox Publisher Worker
A dedicated background publisher worker SHALL poll pending outbox events, enqueue them into BullMQ, and mark events as published upon success.

#### Scenario: Publishing pending outbox events
- **WHEN** the outbox publisher finds pending events
- **THEN** it enqueues them into Redis and transitions their database status to PUBLISHED.

### Requirement: Idempotent Consumer Execution
BullMQ worker processors SHALL enforce idempotency by using the outbox event ID as the BullMQ jobId and checking database state before executing mutations.

#### Scenario: Retrying a dispatched job
- **WHEN** a BullMQ worker retries an already completed or in-progress job
- **THEN** the consumer verifies entity state and exits safely without performing duplicate side effects.

### Requirement: Graceful Worker Process Shutdown
The background worker process SHALL intercept SIGINT and SIGTERM signals, pause queue ingestion, and drain active jobs within a ten-second graceful timeout.

#### Scenario: Terminating worker process
- **WHEN** the worker process receives a termination signal
- **THEN** it completes currently executing tasks and closes Redis connections before exiting.
