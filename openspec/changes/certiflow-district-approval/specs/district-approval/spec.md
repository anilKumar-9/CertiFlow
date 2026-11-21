# Spec Delta

## Purpose

Enforce district-level four-eyes principle requiring two distinct district officers to independently inspect and digitally sign candidate rosters.

## ADDED Requirements

### Requirement: Dual-Officer Inspection Sequence
The system SHALL support dual-officer inspection sequence.

#### Scenario: Dual-Officer Inspection Sequence
- **WHEN** the first district officer signs an inspected batch
- **THEN** the batch transitions to DISTRICT_PARTIALLY_APPROVED awaiting the second distinct officer signature.

### Requirement: Duplicate Approval Prevention
The system SHALL support duplicate approval prevention.

#### Scenario: Duplicate Approval Prevention
- **WHEN** the same district officer attempts to sign the batch again on the same version
- **THEN** the system rejects the request with HTTP 409 Conflict.

