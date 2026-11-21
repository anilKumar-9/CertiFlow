# Spec Delta

## Purpose

Defines server-side role-based access control (RBAC) and multi-tenant district-level data isolation guards to prevent unauthorized horizontal and vertical access.

## ADDED Requirements

### Requirement: Server-Side Role-Based Access Control
The backend application SHALL enforce role-based access control middleware verifying that authenticated users possess the required role for protected endpoints.

#### Scenario: Accessing role-restricted route
- **WHEN** an authenticated user with an unauthorized role requests an administrative endpoint
- **THEN** the authorization middleware blocks the request with HTTP 403 Forbidden.

### Requirement: District-Level Multi-Tenant Data Isolation
The backend application SHALL enforce data isolation guards restricting district-level users and training centres to records matching their assigned district identifier.

#### Scenario: Querying records across district boundaries
- **WHEN** a district officer or training centre requests batch or candidate records
- **THEN** the data access layer automatically scopes queries by the user's assigned district ID.
