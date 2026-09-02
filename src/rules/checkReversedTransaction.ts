import type {Transaction} from '../types/transaction';
import type {RuleResult} from '../types/rule';


export const checkReversedTransaction = (
    transaction: Transaction,
): RuleResult | null => {

    if (transaction.status !== 'reversed') {
        return null;
    }

    return {
        issue: 'reversed_transaction',
        severity: 'medium',
        reason: `Transaction with reference ${transaction.reference} has been reversed.`,
    }

}
