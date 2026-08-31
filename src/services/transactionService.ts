import { db } from "../prisma/db";
import { evaluateTransaction } from "../rules/evaluateTransaction";
import {
  transactionSchema,
  type ValidatedTransaction,
} from "../schemas/transactionSchema";

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

  return transactions
    .map((transaction) => {
      const parsedTransaction = transactionSchema.parse({
        ...transaction,
        expectedSettlement: transaction.expectedSettlement ?? undefined,

        actualSettlement: transaction.actualSettlement ?? undefined,
      });

      return {
        ...transaction,
        issues: evaluateTransaction(parsedTransaction),
      };
    })
    .filter((item) => item.issues.length > 0);
};
