# Spec Delta

## Purpose

Secure the CertiFlow platform using asynchronous bcrypt hashing, dual-token JWT lifecycle, refresh token rotation with reuse detection, and district-scoped RBAC authorization.

## ADDED Requirements

### Requirement: Secure Dual-Token Authentication Lifecycle
The system SHALL support secure dual-token authentication lifecycle.

#### Scenario: Secure Dual-Token Authentication Lifecycle
- **WHEN** a government official submits valid login credentials
- **THEN** the backend issues a 15-minute access token and stores a 7-day rotated refresh token in PostgreSQL and Redis.

### Requirement: Refresh Token Reuse Detection & Revocation
The system SHALL support refresh token reuse detection & revocation.

#### Scenario: Refresh Token Reuse Detection & Revocation
- **WHEN** a revoked refresh token hash is presented to the refresh endpoint
- **THEN** the system flags a security breach, revokes all sessions for the user, and records a security audit log.

