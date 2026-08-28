import type { Transaction } from "../types/transaction";
import type { RuleResult } from "../types/rule";

export const checkSettlementMismatch = (
  transaction: Transaction,
): RuleResult | null => {
  if (
    transaction.expectedSettlement === undefined ||
    transaction.actualSettlement === undefined
  ) {
    return null;
  }

  if (transaction.expectedSettlement === transaction.actualSettlement) {
    return null;
  }

  return {
    issue: "settlement_mismatch",
    severity: "high",
    reason: `Expected settlement of ${transaction.expectedSettlement} but received ${transaction.actualSettlement}`,
  };
};
