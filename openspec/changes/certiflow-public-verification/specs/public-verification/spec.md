# Spec Delta

## Purpose

Enable employers and citizens to verify certificate authenticity via public QR scans without leaking candidate Aadhaar or sensitive PII.

## ADDED Requirements

### Requirement: Genuine Certificate Verification with Masked PII
The system SHALL support genuine certificate verification with masked pii.

#### Scenario: Genuine Certificate Verification with Masked PII
- **WHEN** a user scans a QR code or searches an active certificate identifier
- **THEN** the API returns status GENUINE with masked candidate name and no Aadhaar exposure under strict rate limiting.

### Requirement: Revoked Certificate Public Transparency
The system SHALL support revoked certificate public transparency.

#### Scenario: Revoked Certificate Public Transparency
- **WHEN** a revoked certificate identifier is queried
- **THEN** the endpoint returns status REVOKED with revocation date and administrative reason.

