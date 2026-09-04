import { describe, it, expect } from "vitest";
import { checkSettlementMismatch } from "./checkSettlementMismatch";
import { Transaction } from "../types/transaction";

describe("checkSettlementMismatch", () => {
  it("should return null when settlement data is missing", () => {
    const transaction: Transaction = {
      id: "txn-001",
      reference: "ref-001",
      amount: 50000,
      currency: "NGN",
      customerEmail: "customer@example.com",
      status: "success",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = checkSettlementMismatch(transaction);

    expect(result).toBeNull();
  });

  it("should return null when expected and actual amount match", () => {
    const transaction: Transaction = {
      id: "txn-001",
      reference: "ref-001",
      amount: 50000,
      currency: "NGN",
      customerEmail: "customer@example.com",
      status: "success",
      createdAt: new Date(),
      updatedAt: new Date(),
      expectedSettlement: 5000,
      actualSettlement: 5000,
    };
    const result = checkSettlementMismatch(transaction);

    expect(result).toBeNull();
  });

  it("should return settlement_mismatch when expected and actual amount dont match", () => {
    const transaction: Transaction = {
      id: "txn-001",
      reference: "ref-001",
      amount: 50000,
      currency: "NGN",
      customerEmail: "customer@example.com",
      status: "success",
      createdAt: new Date(),
      updatedAt: new Date(),
      expectedSettlement: 5000,
      actualSettlement: 3000,
    };

    const result = checkSettlementMismatch(transaction);
   expect(result).toEqual({
  issue: "settlement_mismatch",
  severity: "high",
  reason:
    "Settlement is NGN 2,000 below the expected amount. Expected NGN 5,000, received NGN 3,000.",
});
  });

  it("should explain when settlement is above the expected amount", () => {
    const transaction: Transaction = {
      id: "txn-002",
      reference: "ref-002",
      amount: 50000,
      currency: "NGN",
      customerEmail: "customer@example.com",
      status: "success",
      createdAt: new Date(),
      updatedAt: new Date(),
      expectedSettlement: 5000,
      actualSettlement: 5500,
    };

    const result = checkSettlementMismatch(transaction);

    expect(result).toEqual({
  issue: "settlement_mismatch",
  severity: "high",
  reason:
    "Settlement is NGN 500 above the expected amount. Expected NGN 5,000, received NGN 5,500.",
});
  });
});
