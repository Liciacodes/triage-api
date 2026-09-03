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
  getUnresolvedAlerts: vi.fn(),
}));


import { db } from "../prisma/db";
import { getUnresolvedAlerts } from "./alertService";
import { getTransactionsNeedingAttention } from "./transactionService";


const mockedGetAllTransactions = vi.mocked(
  db.orm.public.Transaction.all,
);

const mockedGetUnresolvedAlerts = vi.mocked(
  getUnresolvedAlerts,
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

    
    mockedGetUnresolvedAlerts.mockResolvedValue([
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
      },
    ]);
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

    mockedGetUnresolvedAlerts.mockResolvedValue([]);

    const result = await getTransactionsNeedingAttention();

    expect(result).toHaveLength(0);
  });
});