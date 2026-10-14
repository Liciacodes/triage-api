import { beforeEach, describe, expect, it, vi } from "vitest";



vi.mock("../prisma/db", () => ({
  db: {
    orm: {
      public: {
        Transaction: {
          all: vi.fn(),
        },
      },
    },
  },
}));


vi.mock("./alertService", () => ({
  getActiveAlerts: vi.fn(),
}));


import { db } from "../prisma/db";
import { getActiveAlerts } from "./alertService";
import { getTransactionsNeedingAttention } from "./transactionService";


const mockedGetAllTransactions = vi.mocked(
  db.orm.public.Transaction.all,
);

const mockedGetActiveAlerts = vi.mocked(
  getActiveAlerts,
);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getTransactionsNeedingAttention", () => {
  it("should return a transaction that has an unresolved alert", async () => {
  
    mockedGetAllTransactions.mockResolvedValue([
      {
        id: "db-test-001",
        reference: "ref-test-001",
        amount: 10000,
        currency: "NGN",
        customerEmail: "customer@example.com",
        status: "success",
        expectedSettlement: 9850,
        actualSettlement: 9000,
        createdAt: "2026-09-02 10:00:00+00",
        updatedAt: "2026-09-02 10:00:00+00",
      },
    ]);

    
    mockedGetActiveAlerts.mockResolvedValue([
      {
        id: "alert-001",
        type: "settlement_mismatch",
        severity: "high",
        reason: "Expected settlement of 9850 but received 9000",
        status: 'OPEN',
        acknowledgedAt: null,
        resolvedAt: null,
        transactionId: "db-test-001",
        createdAt: "2026-09-02 10:00:00+00",
      },
    ]);

  
    const result = await getTransactionsNeedingAttention();

   
    expect(result).toHaveLength(1);

    expect(result[0].reference).toBe("ref-test-001");

    expect(result[0].issues).toEqual([
      {
        issue: "settlement_mismatch",
        severity: "high",
        reason: "Expected settlement of 9850 but received 9000",
        status: "OPEN",
      },
    ]);
  });

  it("should keep a transaction in the queue after its alert is acknowledged", async () => {
    mockedGetAllTransactions.mockResolvedValue([
      {
        id: "db-test-003",
        reference: "ref-test-003",
        amount: 10000,
        currency: "NGN",
        customerEmail: "customer@example.com",
        status: "success",
        expectedSettlement: 9850,
        actualSettlement: 9000,
        createdAt: "2026-09-02 10:00:00+00",
        updatedAt: "2026-09-02 10:00:00+00",
      },
    ]);

    mockedGetActiveAlerts.mockResolvedValue([
      {
        id: "alert-003",
        type: "settlement_mismatch",
        severity: "high",
        reason: "Expected settlement of 9850 but received 9000",
        status: 'ACKNOWLEDGED',
        acknowledgedAt: "2026-09-02 11:00:00+00",
        resolvedAt: null,
        transactionId: "db-test-003",
        createdAt: "2026-09-02 10:00:00+00",
      },
    ]);

    const result = await getTransactionsNeedingAttention();

    expect(result).toHaveLength(1);
    expect(result[0].issues[0].status).toBe("ACKNOWLEDGED");
  });

  it("should return an empty array if there are no transactions with unresolved alerts", async () => {

    mockedGetAllTransactions.mockResolvedValue([
      {
        id: "db-test-002",  
        reference: "ref-test-002",
        amount: 5000,
        currency: "USD",
        customerEmail: "customer2@example.com",
        status: "success",
        expectedSettlement: 4900,
        actualSettlement: 5000,
        createdAt: "2026-09-02 10:00:00+00",
        updatedAt: "2026-09-02 10:00:00+00",
      },
    ]);

    mockedGetActiveAlerts.mockResolvedValue([]);

    const result = await getTransactionsNeedingAttention();

    expect(result).toHaveLength(0);
  });
});