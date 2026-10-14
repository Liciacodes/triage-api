import { db } from "../prisma/db";
import { evaluateTransaction } from "../rules/evaluateTransaction";
import { transactionSchema } from "../schemas/transactionSchema";
import { createAlertsForTransaction } from "./alertService";

export const getPendingTransactions = async () => {
  return db.orm.public.Transaction.where({ status: "pending" }).all();
};

// Rules only run when a transaction event arrives, so a transaction that
// goes quiet while pending would never be flagged. The sweep re-runs them.
export const sweepPendingTransactions = async () => {
  const pendingTransactions = await getPendingTransactions();

  let flagged = 0;

  for (const transaction of pendingTransactions) {
    const parsedTransaction = transactionSchema.parse({
      ...transaction,
      expectedSettlement: transaction.expectedSettlement ?? undefined,
      actualSettlement: transaction.actualSettlement ?? undefined,
    });

    const issues = evaluateTransaction(parsedTransaction);

    if (issues.length === 0) {
      continue;
    }

    await createAlertsForTransaction(transaction.id, issues);
    flagged += 1;
  }

  return {
    checked: pendingTransactions.length,
    flagged,
  };
};
