import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockedAll, mockedWhere } = vi.hoisted(() => {
  const mockedAll = vi.fn();
  const mockedWhere = vi.fn(() => ({ all: mockedAll }));

  return { mockedAll, mockedWhere };
});

vi.mock("../prisma/db", () => ({
  db: {
    orm: {
      public: {
        Transaction: {
          where: mockedWhere,
        },
      },
    },
  },
}));

vi.mock("./alertService", () => ({
  createAlertsForTransaction: vi.fn(),
}));

import { createAlertsForTransaction } from "./alertService";
import { sweepPendingTransactions } from "./sweepService";

const mockedCreateAlertsForTransaction = vi.mocked(createAlertsForTransaction);

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const pendingTransaction = (id: string, updatedAt: string) => ({
  id,
  reference: `ref-${id}`,
  amount: 10000,
  currency: "NGN",
  customerEmail: "customer@example.com",
  status: "pending",
  expectedSettlement: null,
  actualSettlement: null,
  createdAt: updatedAt,
  updatedAt,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockedCreateAlertsForTransaction.mockResolvedValue([]);
});

describe("sweepPendingTransactions", () => {
  it("should only load pending transactions", async () => {
    mockedAll.mockResolvedValue([]);

    await sweepPendingTransactions();

    expect(mockedWhere).toHaveBeenCalledWith({ status: "pending" });
  });

  it("should create an alert for a transaction pending beyond the threshold", async () => {
    mockedAll.mockResolvedValue([pendingTransaction("db-001", hoursAgo(30))]);

    const result = await sweepPendingTransactions();

    expect(mockedCreateAlertsForTransaction).toHaveBeenCalledWith("db-001", [
      {
        issue: "stuck_pending",
        severity: "medium",
        reason: "Transaction has been pending for longer than 24 hours.",
      },
    ]);
    expect(result).toEqual({ checked: 1, flagged: 1 });
  });

  it("should not create an alert for a recently pending transaction", async () => {
    mockedAll.mockResolvedValue([pendingTransaction("db-002", hoursAgo(1))]);

    const result = await sweepPendingTransactions();

    expect(mockedCreateAlertsForTransaction).not.toHaveBeenCalled();
    expect(result).toEqual({ checked: 1, flagged: 0 });
  });

  it("should only flag the stuck transactions in a mixed batch", async () => {
    mockedAll.mockResolvedValue([
      pendingTransaction("db-003", hoursAgo(1)),
      pendingTransaction("db-004", hoursAgo(48)),
    ]);

    const result = await sweepPendingTransactions();

    expect(mockedCreateAlertsForTransaction).toHaveBeenCalledTimes(1);
    expect(mockedCreateAlertsForTransaction.mock.calls[0][0]).toBe("db-004");
    expect(result).toEqual({ checked: 2, flagged: 1 });
  });
});
