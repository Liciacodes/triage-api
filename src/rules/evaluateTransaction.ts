import {type Transaction} from '../types/transaction';
import {checkStuckPending} from './checkStuckPending';
import type {RuleResult} from '../types/rule';
import { checkSettlementMismatch } from './checkSettlementMismatch';
import { checkFailedTransaction } from './checkFailedTransaction';
import { checkReversedTransaction } from './checkReversedTransaction';

export const evaluateTransaction = (transaction: Transaction): RuleResult[] => {
const issues: RuleResult[] = []

const stuckPendingResult = checkStuckPending(transaction, 24);
if (stuckPendingResult) {
    issues.push(stuckPendingResult);
}

const settlementMismatch = checkSettlementMismatch(transaction)

if (settlementMismatch) {
    issues.push(settlementMismatch)
}

const failedTransactionResult = checkFailedTransaction(transaction)

if (failedTransactionResult) {
    issues.push(failedTransactionResult)
}

const reversedTransactionResult = checkReversedTransaction(transaction)
if (reversedTransactionResult) {
    issues.push(reversedTransactionResult)
}

return issues;
}