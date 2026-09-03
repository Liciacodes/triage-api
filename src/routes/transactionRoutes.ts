import { Router } from "express";
import { evaluateTransaction } from "../rules/evaluateTransaction";
import { transactionSchema } from "../schemas/transactionSchema";
import {
  createTransaction,
  getAlertsForTransaction,
  getAllTransactions,
  getTransactionByReference,
  getTransactionsNeedingAttention,
  updateTransaction,
} from "../services/transactionService";
import { createAlertsForTransaction, resolveStaleAlerts } from "../services/alertService";

const router = Router();

router.get("/", async (_req, res) => {
  const transactions = await getAllTransactions();

  return res.status(200).json({
    transactions,
  });
});

router.get("/attention", async (_req, res) => {
  const transactions = await getTransactionsNeedingAttention();

  return res.status(200).json({
    count: transactions.length,
    transactions,
  });
});

router.get("/:reference", async (req, res) => {
  const transaction = await getTransactionByReference(req.params.reference);

  if (!transaction) {
    return res.status(404).json({
      error: "Transaction not found",
    });
  }

  const parsedTransaction = transactionSchema.parse({
    ...transaction,
    expectedSettlement: transaction.expectedSettlement ?? undefined,
    actualSettlement: transaction.actualSettlement ?? undefined,
  });

  const issues = evaluateTransaction(parsedTransaction);

  const alerts = await getAlertsForTransaction(transaction.id);

  return res.status(200).json({
    transaction,
    issues,
    alerts,
    needsAttention: alerts.some((alert) => alert.status === "OPEN"),
  });
});

router.post("/evaluate", async (req, res) => {
  const parsed = transactionSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid transaction data",
      details: parsed.error.issues,
    });
  }

  const transaction = parsed.data;

  const existingTransaction = await getTransactionByReference(
    transaction.reference,
  );

  if (existingTransaction) {
  const hasChanged =
    existingTransaction.status !== transaction.status ||
    existingTransaction.amount !== transaction.amount ||
    existingTransaction.expectedSettlement !==
      (transaction.expectedSettlement ?? null) ||
    existingTransaction.actualSettlement !==
      (transaction.actualSettlement ?? null);

  if (!hasChanged) {
    return res.status(200).json({
      duplicate: true,
      transaction: existingTransaction,
    });
  }

  const updatedTransaction = await updateTransaction(transaction);

  const issues = evaluateTransaction(transaction);
  await resolveStaleAlerts(existingTransaction.id, issues); 

  const alerts = await createAlertsForTransaction(
    existingTransaction.id,
    issues,
  );



  return res.status(200).json({
    duplicate: false,
    updated: true,
    transaction: updatedTransaction,
    needsAttention: issues.length > 0,
    issues,
    alerts,
  });
}



  const savedTransaction = await createTransaction(transaction);

  const issues = evaluateTransaction(transaction);

  const alerts = await createAlertsForTransaction(
    savedTransaction.id,
    issues);

  res.status(200).json({
    needsAttention: issues.length > 0,
    issues,
    alerts,
  });
});

export default router;
