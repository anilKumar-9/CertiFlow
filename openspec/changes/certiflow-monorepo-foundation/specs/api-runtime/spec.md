# Spec Delta

## Purpose

Defines the backend Express service runtime, health monitoring endpoint, API versioning prefix, request validation middleware, and centralized error handling.

## ADDED Requirements

### Requirement: Modular Domain Architecture
The backend application SHALL structure domain capabilities into decoupled modules located under `src/modules/` with isolated routers, controllers, and services.

#### Scenario: Routing requests to modular domains
- **WHEN** an incoming HTTP request targets a modular domain route under `/api/v1`
- **THEN** the Express router delegates processing exclusively to that module's designated controller.

### Requirement: System Health Monitoring Endpoint
The backend application SHALL expose an unauthenticated `GET /health` endpoint reporting service uptime, timestamp, and connection statuses for PostgreSQL and Redis.

#### Scenario: Probing service health status
- **WHEN** an HTTP GET request is received at `/health`
- **THEN** the service responds with HTTP 200 and a JSON payload detailing uptime and dependent service connectivity.

### Requirement: Centralized Error Handling
The backend application SHALL route all unhandled exceptions and operational errors to a centralized error handling middleware that formats standard JSON error envelopes.

#### Scenario: Handling operational exceptions
- **WHEN** a route handler or service throws an operational AppError
- **THEN** the error middleware catches the error and returns a structured JSON response with the corresponding HTTP status code.

### Requirement: Request Validation Middleware
The backend application SHALL provide a validation middleware to validate request bodies, query strings, and parameters against schemas before controller execution.

#### Scenario: Rejecting invalid request payloads
- **WHEN** an incoming request payload fails schema validation
- **THEN** the validation middleware halts execution and returns HTTP 400 with a detailed field error summary.

### Requirement: API Versioning Scheme
The backend application SHALL expose all domain API routes under the `/api/v1` prefix to ensure forward compatibility.

#### Scenario: Invoking versioned endpoints
- **WHEN** a client calls an endpoint prefixed with `/api/v1/`
- **THEN** the application dispatches the request to the corresponding v1 domain controller.
