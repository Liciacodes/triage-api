import type {Transaction} from "../types/transaction";
import type {RuleResult} from "../types/rule";

export const checkFailedTransaction = (
    transaction: Transaction
): RuleResult | null => {
    
  if (transaction.status !== "failed") {
    return null;
  }

  return {
    issue: 'failed_transaction',
    severity: 'high',
    reason: `Transaction with reference ${transaction.reference} has failed.`,
  }
}

