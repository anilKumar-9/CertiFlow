# Spec Delta

## Purpose

Generate tamper-evident, landscape A4 PDF certificates with embedded cryptographically signed QR codes via background BullMQ workers.

## ADDED Requirements

### Requirement: Asynchronous PDF & QR Rendering Worker
The system SHALL support asynchronous pdf & qr rendering worker.

#### Scenario: Asynchronous PDF & QR Rendering Worker
- **WHEN** the certificate BullMQ worker consumes CERTIFICATE_BATCH_CLEARED
- **THEN** it renders PDF certificates with Navy and Gold borders, embeds opaque QR codes, and transitions batch status to CERTIFICATES_ISSUED.

### Requirement: Idempotent Duplicate Issuance Skip
The system SHALL support idempotent duplicate issuance skip.

#### Scenario: Idempotent Duplicate Issuance Skip
- **WHEN** a candidate certificate already exists during worker retries
- **THEN** the generator skips regeneration and advances without duplicate persistence.

