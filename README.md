# Triage API

Backend API for Triage, an exception-first payment operations tool that helps surface transactions requiring human attention, explain why they were flagged, and track issues through resolution.

## Current Progress

### Transaction Processing

- Transaction ingestion and validation
- Transaction persistence
- Transaction retrieval by reference
- Transaction attention queue
- Idempotent transaction processing
- Duplicate transaction detection by reference
- Existing transaction updates when meaningful data changes

### Rules Engine

Triage evaluates incoming transactions using independent exception rules.

Currently supported rules:

- Stuck-pending transactions
- Settlement mismatches
- Failed transactions
- Reversed transactions

The evaluator can return multiple issues for a single transaction.

### Alert Lifecycle

Detected issues are persisted as operational alerts.

Triage currently supports:

- Creating alerts from detected transaction issues
- Retrieving unresolved alerts
- Preventing duplicate unresolved alerts
- Marking alerts as resolved
- Preserving resolved alerts as transaction history
- Automatically resolving stale alerts when a transaction recovers
- Building the attention queue from unresolved alerts

### Idempotent Transaction Processing

Triage uses transaction references to safely handle repeated transaction events.

When a transaction is received:

- A new reference creates a new transaction.
- An existing reference with unchanged data is treated as a duplicate.
- An existing reference with changed data updates the existing transaction.
- Updated transactions are re-evaluated by the rules engine.
- Existing unresolved alerts are reused instead of duplicated.
- Alerts that no longer apply after an update are automatically resolved.

This prevents retries from creating duplicate transactions or duplicate operational alerts while still allowing legitimate transaction state changes.

### Testing

The API includes automated tests for:

- Individual transaction rules
- Transaction rule evaluation
- Transaction routes
- Attention queue behavior
- Transaction service behavior

Tests are written with Vitest and Supertest.

## Tech Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma
- Zod
- Vitest
- Supertest

## Running Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run the test suite:

```bash
npm test -- --run
```