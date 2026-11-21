# Spec Delta

## Purpose

Enable Training Centres to register training batches and ingest candidate rosters via streaming ExcelJS parsing with row-level validation and formula injection sanitization.

## ADDED Requirements

### Requirement: Streaming Excel Candidate Roster Ingestion
The system SHALL support streaming excel candidate roster ingestion.

#### Scenario: Streaming Excel Candidate Roster Ingestion
- **WHEN** a training centre uploads an .xlsx workbook up to 10MB and 5,000 rows
- **THEN** ExcelJS streams rows, validates Aadhaar and enrollment number uniqueness, and stages valid candidates in an atomic transaction.

### Requirement: High-Volume Batch Auto-Flagging
The system SHALL support high-volume batch auto-flagging.

#### Scenario: High-Volume Batch Auto-Flagging
- **WHEN** a batch contains 100 or more candidate dossiers
- **THEN** the system automatically marks qualityReviewRequired as true for statistical quality audit.

