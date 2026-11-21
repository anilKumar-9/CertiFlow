# Spec Delta

## Purpose

Track review stage deadlines and escalate overdue batches to state authorities.

## ADDED Requirements

### Requirement: Automated SLA Breach Detection
The system SHALL support automated sla breach detection.

#### Scenario: Automated SLA Breach Detection
- **WHEN** a submitted batch exceeds its 48-hour stageDeadline
- **THEN** the SLA background worker updates isOverdue to true and broadcasts SLA_BREACHED escalation alerts.

### Requirement: Visual SLA Countdown Warning
The system SHALL support visual sla countdown warning.

#### Scenario: Visual SLA Countdown Warning
- **WHEN** a batch deadline approaches under 24 hours
- **THEN** the UI highlights warning badges with remaining hours.

