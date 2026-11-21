# Spec Delta

## Purpose

Defines password security, dual-token JWT access and refresh token lifecycle, token rotation and revocation tracking, HttpOnly cookies, and CSRF protection.

## ADDED Requirements

### Requirement: Asynchronous Password Hashing
The backend application SHALL hash user passwords using bcrypt with a minimum work factor of 12 salt rounds before storage.

#### Scenario: Storing new user credentials
- **WHEN** a user account password is created or updated
- **THEN** the password utility asynchronously generates a bcrypt hash with 12 salt rounds before persistence.

### Requirement: Dual-Token JWT Architecture
The backend application SHALL issue short-lived signed JWT access tokens (15 minutes) and long-lived refresh tokens (7 days).

#### Scenario: Authenticating valid credentials
- **WHEN** user credentials are validly verified
- **THEN** the auth service generates a 15-minute access token and a 7-day refresh token.

### Requirement: Refresh Token Rotation and Revocation
The backend application SHALL rotate refresh tokens upon every refresh request and revoke all associated tokens if a previously used token is presented.

#### Scenario: Refreshing with previously consumed token
- **WHEN** a client attempts to refresh using a revoked or previously exchanged refresh token
- **THEN** the service rejects the request and revokes all active refresh tokens for that user session.

### Requirement: Secure Cookie Handling and CSRF
Refresh tokens transmitted via cookies SHALL use HttpOnly, SameSite, and Secure flags, and cookie-based mutation endpoints SHALL enforce CSRF protection.

#### Scenario: Exchanging refresh token in cookie
- **WHEN** a token refresh endpoint is invoked with a refresh cookie
- **THEN** the server verifies the CSRF header token alongside the HttpOnly cookie.
