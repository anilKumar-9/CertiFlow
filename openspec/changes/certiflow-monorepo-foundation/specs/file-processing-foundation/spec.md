# Spec Delta

## Purpose

Defines Excel workbook parsing, shared Zod row validation, file size and row limits, structured row-level error reporting, formula injection sanitization, and atomic staging.

## ADDED Requirements

### Requirement: ExcelJS Workbook Parsing and Validation
The backend system SHALL parse candidate Excel workbooks using ExcelJS and validate row fields against shared Zod schemas from `@certiflow/shared`.

#### Scenario: Parsing uploaded candidate workbook
- **WHEN** a training centre uploads a candidate batch Excel workbook
- **THEN** the service parses sheets and validates each row against the candidate schema.

### Requirement: File Size and Row Limits
The backend system SHALL enforce limits of maximum 10 megabytes file size and 5,000 candidate rows per uploaded workbook.

#### Scenario: Submitting oversized workbook
- **WHEN** an uploaded workbook exceeds 10MB or contains more than 5,000 rows
- **THEN** the parsing service halts and returns HTTP 400 with a limit violation error.

### Requirement: Row-Level Error Aggregation
The Excel validation service SHALL return structured error arrays containing exact row numbers, column names, and validation failure reasons for all invalid rows.

#### Scenario: Uploading workbook with multiple row errors
- **WHEN** an uploaded spreadsheet has validation failures across multiple rows
- **THEN** the service returns an aggregated JSON error report detailing every failing cell.

### Requirement: All-or-Nothing Transactional Staging
The backend system SHALL stage candidate batch data atomically, persisting zero candidate records if any row fails validation.

#### Scenario: Batch with single invalid row
- **WHEN** a candidate workbook with 500 rows contains one invalid row
- **THEN** the database transaction rolls back and zero candidate rows are persisted.

### Requirement: Formula Injection Neutralization
The Excel export utility SHALL neutralize dangerous characters (`=`, `+`, `-`, `@`) in text cells by prepending a single quote before exporting.

#### Scenario: Exporting text cells with leading formula characters
- **WHEN** student data containing leading formula operators is exported to Excel
- **THEN** the export utility prepends a single quote preventing formula execution.
