import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockedAll, mockedUpdate, mockedWhere, mockedCreate } = vi.hoisted(
  () => {
    const mockedAll = vi.fn();
    const mockedUpdate = vi.fn();
    const mockedWhere = vi.fn(() => ({ all: mockedAll, update: mockedUpdate }));
    const mockedCreate = vi.fn();

    return { mockedAll, mockedUpdate, mockedWhere, mockedCreate };
  },
);

vi.mock("../prisma/db", () => ({
  db: {
    orm: {
      public: {
        Alert: {
          where: mockedWhere,
          create: mockedCreate,
        },
      },
    },
  },
}));

import { createAlertsForTransaction } from "./alertService";

const stuckPendingIssue = {
  issue: "stuck_pending",
  severity: "medium" as const,
  reason: "Transaction has been pending for longer than 24 hours.",
};

const existingAlert = (status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED") => ({
  id: "alert-001",
  type: "stuck_pending",
  severity: "medium",
  reason: "Transaction has been pending for longer than 24 hours.",
  status,
  acknowledgedAt: null,
  resolvedAt: null,
  transactionId: "db-test-001",
  createdAt: "2026-09-02 10:00:00+00",
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createAlertsForTransaction", () => {
  it("should create an alert when the transaction has no active alert for the issue", async () => {
    mockedAll.mockResolvedValue([]);

    await createAlertsForTransaction("db-test-001", [stuckPendingIssue]);

    expect(mockedCreate).toHaveBeenCalledWith({
      type: "stuck_pending",
      severity: "medium",
      reason: "Transaction has been pending for longer than 24 hours.",
      status: "OPEN",
      transactionId: "db-test-001",
    });
  });

  it("should reuse an open alert instead of creating a duplicate", async () => {
    mockedAll.mockResolvedValue([existingAlert("OPEN")]);

    await createAlertsForTransaction("db-test-001", [stuckPendingIssue]);

    expect(mockedCreate).not.toHaveBeenCalled();
    expect(mockedWhere).toHaveBeenCalledWith({ id: "alert-001" });
  });

  it("should not reopen an issue that has already been acknowledged", async () => {
    mockedAll.mockResolvedValue([existingAlert("ACKNOWLEDGED")]);

    await createAlertsForTransaction("db-test-001", [stuckPendingIssue]);

    expect(mockedCreate).not.toHaveBeenCalled();
    expect(mockedUpdate).toHaveBeenCalledWith({
      severity: "medium",
      reason: "Transaction has been pending for longer than 24 hours.",
    });
  });

  it("should create a new alert when the previous one was resolved", async () => {
    mockedAll.mockResolvedValue([existingAlert("RESOLVED")]);

    await createAlertsForTransaction("db-test-001", [stuckPendingIssue]);

    expect(mockedCreate).toHaveBeenCalledTimes(1);
  });
});
