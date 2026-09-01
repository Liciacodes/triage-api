import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("../services/transactionService", () => ({
  createTransaction: vi.fn(),
  getAllTransactions: vi.fn(),
  getTransactionByReference: vi.fn(),
  getTransactionsNeedingAttention: vi.fn(),
}));

import {
  createTransaction,
  getAllTransactions,
  getTransactionByReference,
  getTransactionsNeedingAttention,
} from "../services/transactionService";

import app from "../app";

const mockedCreateTransaction = vi.mocked(createTransaction);
const mockedGetAllTransactions = vi.mocked(getAllTransactions);
const mockedGetTransactionByReference = vi.mocked(getTransactionByReference);
const mockedGetTransactionsNeedingAttention = vi.mocked(
  getTransactionsNeedingAttention,
);

beforeEach(() => {
  vi.clearAllMocks();

    mockedCreateTransaction.mockResolvedValue({
    id: "db-test-001",
    reference: "ref-test",
    amount: 10000,
    currency: "NGN",
    customerEmail: "customer@example.com",
    status: "success",
    expectedSettlement: null,
    actualSettlement: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
});





describe("POST /api/transactions/evaluate", () => {
  it("should return 400 for invalid transaction data", async () => {
    const response = await request(app)
      .post("/api/transactions/evaluate")
      .send({
        id: "001",
        reference: 'ref-006',
        currency: "NGN",
        amount: -1000,
        customerEmail: "not-an-email",
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    expect(response.status).toBe(400);
  });

  it("should return 200 with no issues for a normal transaction", async () => {
    const response = await request(app)
      .post("/api/transactions/evaluate")
      .send({
        id: "txn-005",
        reference: 'ref-009',
        amount: 10000,
        currency: "NGN",
        customerEmail: "customer@example.com",
        status: "success",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      needsAttention: false,
      issues: [],
    });
  });

  it("should flag a transaction that has been pending too long", async () => {
    const response = await request(app)
      .post("/api/transactions/evaluate")
      .send({
        id: "txn-006",
        reference: 'ref-008',
        amount: 10000,
        currency: "NGN",
        customerEmail: "customer@example.com",
        status: "pending",
        createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
      });

    expect(response.status).toBe(200);
    expect(response.body.needsAttention).toBe(true);
    expect(response.body.issues[0].issue).toBe("stuck_pending");
  });

  it("should flag a settlement mismatch", async () => {
    const response = await request(app)
      .post("/api/transactions/evaluate")
      .send({
        id: "txn-007",
        reference: 'ref-002',
        amount: 10000,
        currency: "NGN",
        customerEmail: "customer@example.com",
        status: "success",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expectedSettlement: 9850,
        actualSettlement: 9000,
      });

    expect(response.status).toBe(200);
    expect(response.body.needsAttention).toBe(true);
    expect(response.body.issues[0].issue).toBe("settlement_mismatch");
  });

  it("should return all transaction", async () => {
    mockedGetAllTransactions.mockResolvedValue([]);
    const response = await request(app).get("/api/transactions");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("transactions");
    expect(Array.isArray(response.body.transactions)).toBe(true);
  });

  it("should return 404 when transaction reference does not exist", async () => {
    mockedGetTransactionByReference.mockResolvedValue(null);
    const response = await request(app).get(
      "/api/transactions/ref-does-not-exist",
    );

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Transaction not found");
  });

  it("should return transactions that need attention", async () => {
    mockedGetTransactionsNeedingAttention.mockResolvedValue([
      {
        id: "db-001",
        reference: "ref-attention",
        amount: 10000,
        currency: "NGN",
        customerEmail: "customer@example.com",
        status: "success",
        expectedSettlement: 9850,
        actualSettlement: 9000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        issues: [
          {
            issue: "settlement_mismatch",
            severity: "high",
            reason: "Expected settlement of 9850 but received 9000",
          },
        ],
      },
    ]);

    const response = await request(app).get("/api/transactions/attention");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1);
    expect(Array.isArray(response.body.transactions)).toBe(true);
  });
});
