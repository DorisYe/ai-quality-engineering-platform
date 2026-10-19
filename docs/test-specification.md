
# Event Monitoring System — Test Specification

## Project Objective

Validate an event-driven web application using Playwright
automation, backend event generators, and database assertions.

## System Components

- Backend Event Generator (PowerShell / Bash)
- Node.js Backend API
- SQLite Database
- Event Monitoring Web Dashboard
- Playwright Automation Framework
- QA Management Portal

## Test Scenarios

### TC-001: Event Generation and Display
Verify that a backend-generated event is stored in
the database and displayed correctly in the web UI.

### TC-002: Event Details Validation
Verify that event ID, type, severity, source, and
status match the backend records.

### TC-003: Event Acknowledgement
Verify that acknowledging an event through the UI
updates the backend status.

### TC-004: Event Filtering
Verify that the dashboard correctly filters events
by severity and status.

### TC-005: Invalid Event Handling
Verify that invalid event payloads are rejected
and do not create incorrect database records.
