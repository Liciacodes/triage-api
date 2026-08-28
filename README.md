# Triage API

Backend API for Triage, an exception-first payment operations tool
that helps surface transactions requiring human attention and explain
why they were flagged.

## Current Progress

- Transaction domain model
- Stuck-pending transaction rule
- Settlement mismatch rule
- Transaction rule evaluator
- Unit tests for transaction exception rules

## Tech Stack

- Node.js
- Express
- TypeScript
- Zod
- Vitest

## Running Locally

Install dependencies:

npm install

Start the development server:

npm run dev

Run tests:

npm test -- --run