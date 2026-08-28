import type { Transaction } from "../types/transaction";

import type { RuleResult } from "../types/rule";


export const checkStuckPending = (
  transaction: Transaction,
  thresholdHours: number,
): RuleResult| null => {
  if (transaction.status !== "pending") {
    return null;
  }

  const thresholdTime = Date.now() - thresholdHours * 60 * 60 * 1000;

  if (transaction.updatedAt.getTime() < thresholdTime) {
    return {
      issue: "stuck_pending",
      severity: "medium",
      reason: `Transaction has been pending for longer than ${thresholdHours} hours.`,
    };
  }
  return null;
};
