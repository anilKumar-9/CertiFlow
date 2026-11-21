# Spec Delta

## Purpose

Empower state authorities to grant final executive clearance for automated certificate rendering and execute emergency revocations.

## ADDED Requirements

### Requirement: State Executive Issuance Clearance
The system SHALL support state executive issuance clearance.

#### Scenario: State Executive Issuance Clearance
- **WHEN** the State Director clears a verified batch
- **THEN** the batch transitions to STATE_APPROVED and atomically records CERTIFICATE_BATCH_CLEARED in the outbox.

### Requirement: Immediate Certificate Revocation
The system SHALL support immediate certificate revocation.

#### Scenario: Immediate Certificate Revocation
- **WHEN** the state executes certificate revocation with mandatory justification
- **THEN** the certificate status immediately transitions to REVOKED across public verification endpoints.

