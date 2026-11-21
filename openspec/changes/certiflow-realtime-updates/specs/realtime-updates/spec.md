# Spec Delta

## Purpose

Broadcast domain status changes to connected user interfaces and trigger targeted TanStack Query cache invalidations.

## ADDED Requirements

### Requirement: Authenticated SSE Event Stream
The system SHALL support authenticated sse event stream.

#### Scenario: Authenticated SSE Event Stream
- **WHEN** an authorized client connects to /api/v1/events/stream
- **THEN** the server streams real-time domain events and emits periodic heartbeat pings every 25 seconds.

### Requirement: Targeted Cache Invalidation
The system SHALL support targeted cache invalidation.

#### Scenario: Targeted Cache Invalidation
- **WHEN** a BATCH_UPDATED event is received
- **THEN** the frontend client automatically invalidates affected query keys without full page refreshes.

