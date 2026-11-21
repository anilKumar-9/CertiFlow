# Spec Delta

## Purpose

Defines asynchronous PDF certificate generation with PDFKit, QR code generation, unique certificate numbering, opaque verification URLs, and cancellation handling.

## ADDED Requirements

### Requirement: Asynchronous PDF Rendering with PDFKit
The background worker SHALL generate tamper-evident PDF certificates asynchronously using PDFKit according to standardized certificate templates.

#### Scenario: Processing certificate generation job
- **WHEN** a certificate generation task is consumed from BullMQ
- **THEN** the worker uses PDFKit to render a PDF document and saves it to storage.

### Requirement: Embedded QR Code with Opaque Verification URL
Each generated certificate SHALL include a QR code generated via qrcode embedding an opaque, unguessable public verification URL.

#### Scenario: Scanning certificate QR code
- **WHEN** a user scans the QR code on a physical or digital certificate
- **THEN** the browser opens the public verification URL resolving the certificate verification status.

### Requirement: Unique Certificate Numbering and Uniqueness
The system SHALL assign deterministic, unique certificate numbers to issued certificates and enforce uniqueness at the database level.

#### Scenario: Generating certificate identifier
- **WHEN** a certificate record is prepared for issuance
- **THEN** the system generates a unique certificate number that satisfies database unique constraints.

### Requirement: Duplicate Issuance Prevention
The certificate worker SHALL verify that no prior active certificate exists for a candidate-batch pair before rendering a new certificate.

#### Scenario: Retrying certificate generation job
- **WHEN** a worker retries a certificate generation job for a candidate
- **THEN** the worker detects the existing certificate and skips duplicate PDF generation.

### Requirement: Immediate Verification Status on Revocation
When a certificate is marked revoked or cancelled in the database, the public verification endpoint SHALL immediately reflect its revoked status upon query.

#### Scenario: Verifying a revoked certificate
- **WHEN** a public user queries the verification endpoint for a revoked certificate
- **THEN** the endpoint returns HTTP 200 with status REVOKED and displays an alert banner.
