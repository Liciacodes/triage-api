import { db } from "../prisma/db";
import { evaluateTransaction } from "../rules/evaluateTransaction";
import {
  transactionSchema,
  type ValidatedTransaction,
} from "../schemas/transactionSchema";
import { getUnresolvedAlerts } from "./alertService";

export const createTransaction = async (transaction: ValidatedTransaction) => {
  return db.orm.public.Transaction.create({
    reference: transaction.reference,
    amount: transaction.amount,
    currency: transaction.currency,
    customerEmail: transaction.customerEmail,
    status: transaction.status,
    expectedSettlement: transaction.expectedSettlement,
    actualSettlement: transaction.actualSettlement,
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  });
};

export const getAllTransactions = async () => {
  return db.orm.public.Transaction.all();
};

export const getTransactionByReference = async (reference: string) => {
  return db.orm.public.Transaction.where({ reference }).first();
};

export const getTransactionsNeedingAttention = async () => {
  const transactions = await getAllTransactions();
  const unresolvedAlerts = await getUnresolvedAlerts();

  return transactions
    .map((transaction) => {
    const alerts = unresolvedAlerts.filter(
      (alert) => alert.transactionId === transaction.id
      );

      return {
        ...transaction,
        issues: alerts.map((alert) => ({
          issue: alert.type,
          severity: alert.severity,
          reason: alert.reason, 
        }))
      };
      })
    .filter((transaction) => transaction.issues.length > 0);
};


export const getAlertsForTransaction = async (transactionId: string) => {
  return db.orm.public.Alert
  .where({ transactionId})
  .all();
}

export const updateTransaction = async (transaction: ValidatedTransaction) => {
  return db.orm.public.Transaction.where({ reference: transaction.reference }).update({
    amount: transaction.amount,
    currency: transaction.currency,
    customerEmail: transaction.customerEmail,
    status: transaction.status, 
    expectedSettlement: transaction.expectedSettlement,
    actualSettlement: transaction.actualSettlement,
    updatedAt: transaction.updatedAt.toISOString(),
  });
}
