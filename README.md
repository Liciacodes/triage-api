# Triage API

Backend API for **Triage**, an exception-first payment operations tool that helps surface transactions requiring human attention, explain why they were flagged, and track alerts from detection through acknowledgement and resolution.

## Overview

Triage evaluates transaction events against a set of operational rules and surfaces exceptions that may require human attention.

Rather than treating every transaction equally, the system focuses operators on transactions that are failed, reversed, stuck in pending, or have settlement discrepancies.

The API also handles repeated transaction events safely, re-evaluating transactions as their state changes and maintaining the lifecycle of any associated alerts.

## Features

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

Detected issues are persisted as operational alerts with three states:

```text
OPEN → ACKNOWLEDGED → RESOLVED
```

#### OPEN

The underlying issue is active and requires attention.

#### ACKNOWLEDGED

An operator has reviewed the alert. Acknowledging an alert does not mean the underlying transaction issue has been fixed.

#### RESOLVED

The condition that originally triggered the alert no longer applies.

Triage supports:

- Creating alerts from detected transaction issues
- Preventing duplicate active alerts
- Human acknowledgement of open alerts
- Recording acknowledgement timestamps
- Automatically resolving stale alerts when the underlying condition clears
- Recording resolution timestamps
- Preserving resolved alerts as transaction history
- Building the attention queue from active alerts

This separates **operator acknowledgement** from **actual issue resolution**. An operator can acknowledge an issue while Triage continues monitoring the underlying transaction until the condition changes.

### Idempotent Transaction Processing

Triage uses transaction references to safely handle repeated transaction events.

When a transaction is received:

- A new reference creates a new transaction.
- An existing reference with unchanged data is treated as a duplicate.
- An existing reference with changed data updates the existing transaction.
- Updated transactions are re-evaluated by the rules engine.
- Existing active alerts are reused instead of duplicated.
- Alerts that no longer apply after an update are automatically resolved.

This prevents retries from creating duplicate transactions or operational alerts while still allowing legitimate transaction state changes.

## API Endpoints

### Transactions

```text
POST /api/transactions/evaluate
GET  /api/transactions
GET  /api/transactions/attention
GET  /api/transactions/:reference
```

### Alerts

```text
PATCH /api/alerts/:id/acknowledge
```

## Project Structure

```text
src/
├── prisma/
│   ├── contract.prisma
│   └── db.ts
├── routes/
│   ├── alertRoutes.ts
│   └── transactionRoutes.ts
├── rules/
│   ├── checkFailedTransaction.ts
│   ├── checkReversedTransaction.ts
│   ├── checkSettlementMismatch.ts
│   ├── checkStuckPending.ts
│   └── evaluateTransaction.ts
├── schemas/
│   └── transactionSchema.ts
├── services/
│   ├── alertService.ts
│   └── transactionService.ts
├── types/
│   ├── rule.ts
│   └── transaction.ts
├── app.ts
└── server.ts
```

## Testing

The API includes automated tests for:

- Individual transaction rules
- Transaction rule evaluation
- Transaction routes
- Alert routes
- Attention queue behavior
- Transaction service behavior

Tests are written with **Vitest** and **Supertest**.

Run the test suite:

```bash
npm test -- --run
```

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

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create the required environment variables for your database connection and local environment.

### 3. Start the development server

```bash
npm run dev
```

### 4. Run the test suite

```bash
npm test -- --run
```

### 5. Build the project

```bash
npm run build
```

### 6. Start the production build

```bash
npm start
```

## Live Application

### Frontend

[https://triage-client.vercel.app](https://triage-client.vercel.app)

### API

[https://triage-api-fg04.onrender.com](https://triage-api-fg04.onrender.com)

## Related Repository

The Triage frontend is a separate Next.js application that provides the operational dashboard, transaction list, transaction details, alert acknowledgement, and alert history interfaces.