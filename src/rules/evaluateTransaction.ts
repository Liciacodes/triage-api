import {type Transaction} from '../types/transaction';
import {checkStuckPending} from './checkStuckPending';
import type {RuleResult} from '../types/rule';

export const evaluateTransaction = (transaction: Transaction): RuleResult[] => {
const issues: RuleResult[] = []

const stuckPendingResult = checkStuckPending(transaction, 24);
if (stuckPendingResult) {
    issues.push(stuckPendingResult);
}



return issues;
}