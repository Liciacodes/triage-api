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

  const difference =
    transaction.expectedSettlement - transaction.actualSettlement;

  const formattedExpected =
    transaction.expectedSettlement.toLocaleString();

  const formattedActual =
    transaction.actualSettlement.toLocaleString();

  const formattedDifference =
    Math.abs(difference).toLocaleString();

  const direction = difference > 0 ? "below" : "above";

  return {
    issue: "settlement_mismatch",
    severity: "high",
    reason: `Settlement is ${transaction.currency} ${formattedDifference} ${direction} the expected amount. Expected ${transaction.currency} ${formattedExpected}, received ${transaction.currency} ${formattedActual}.`,
  };
};