# Spec Delta

## Purpose

Deliver automated WhatsApp HSM alerts to certified candidates with personalized verification links.

## ADDED Requirements

### Requirement: Automated WhatsApp HSM Delivery
The system SHALL support automated whatsapp hsm delivery.

#### Scenario: Automated WhatsApp HSM Delivery
- **WHEN** a certificate is issued
- **THEN** the notification worker dispatches certiflow_issuance_notice template payload and records provider delivery confirmation.

### Requirement: Notification Delivery Status Tracking
The system SHALL support notification delivery status tracking.

#### Scenario: Notification Delivery Status Tracking
- **WHEN** delivery updates occur
- **THEN** notification status updates to DELIVERED with provider message identifiers.

