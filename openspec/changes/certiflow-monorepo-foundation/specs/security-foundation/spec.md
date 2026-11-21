# Spec Delta

## Purpose

Defines network and application perimeter defenses including rate limiting, Helmet HTTP security headers, CORS allowlisting, file upload restrictions, and secure environment secrets.

## ADDED Requirements

### Requirement: Multi-Tier Rate Limiting
The backend application SHALL enforce rate limiting middleware with general API limits and strict rate limits on public verification endpoints.

#### Scenario: Exceeding public verification rate limits
- **WHEN** an IP address exceeds 10 verification requests within a 60-second window
- **THEN** the rate limiter blocks subsequent requests with HTTP 429 Too Many Requests.

### Requirement: HTTP Security Headers via Helmet
The backend application SHALL configure Helmet middleware to enforce secure HTTP response headers including Content Security Policy, HSTS, frameguard, and referrer policy.

#### Scenario: Inspecting HTTP response headers
- **WHEN** a client sends any HTTP request to the backend API
- **THEN** the HTTP response headers include security headers configured by Helmet.

### Requirement: Strict CORS Allowlisting
The backend application SHALL enforce CORS policy allowing requests only from explicitly configured client origins defined in environment variables.

#### Scenario: Request from unauthorized origin
- **WHEN** a cross-origin request originates from an unlisted domain
- **THEN** the server rejects the preflight or request with a CORS policy violation.

### Requirement: File Upload Security Validation
The backend application SHALL validate uploaded files for MIME type, file extension, and maximum size limits prior to memory or disk processing.

#### Scenario: Uploading disallowed file type
- **WHEN** a client uploads a file with an invalid extension or non-spreadsheet MIME type
- **THEN** the upload middleware rejects the file with HTTP 400 Bad Request before processing begins.

### Requirement: Parameterized Database Query Protection
All database operations in the backend application SHALL use Prisma parameterized queries to prevent SQL injection vulnerabilities.

#### Scenario: Executing entity queries
- **WHEN** dynamic search filters or identifiers are passed to database repositories
- **THEN** Prisma parameterizes the query arguments before dispatching to PostgreSQL.
