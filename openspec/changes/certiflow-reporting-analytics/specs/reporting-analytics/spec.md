# Spec Delta

## Purpose

Provide high-level KPI aggregations and Excel report exports with CSV formula injection defense.

## ADDED Requirements

### Requirement: Executive KPI Aggregation
The system SHALL support executive kpi aggregation.

#### Scenario: Executive KPI Aggregation
- **WHEN** the reports endpoint is queried
- **THEN** it returns statewide totals for batches, candidates, issued certificates, revocations, and SLA compliance rates.

### Requirement: Formula-Safe Spreadsheet Export
The system SHALL support formula-safe spreadsheet export.

#### Scenario: Formula-Safe Spreadsheet Export
- **WHEN** an administrator exports governance reports to Excel
- **THEN** all formula trigger characters (=, +, -, @) are sanitized with prepended apostrophes.

