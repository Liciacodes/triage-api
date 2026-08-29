import {describe, expect, it} from "vitest";
import {evaluateTransaction} from "./evaluateTransaction";

import type {Transaction } from "../types/transaction";


describe('evaluateTransaction', () => {
    it('should return an empty array when there are no issues', () => {
        const transaction: Transaction = {
            id: 'txn-001',
            reference: 'ref-001',
            amount: 5000,
            currency: 'NGN',
            customerEmail: 'customer@example.com',
            status: 'success',
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        const issues = evaluateTransaction(transaction);
        expect(issues).toEqual([]);
    })

    it('should return an array with issues when there are issues', () => {
        const transaction: Transaction = {
            id: 'txn-002',
            reference: 'ref-002',
            amount: 10000,
            currency: 'NGN',
            customerEmail: 'customer@example.com',
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(Date.now() - 30 * 60 * 60 * 1000), // 30 hours ago
        }
        const issues = evaluateTransaction(transaction);
        expect(issues).toEqual([
            {
                issue: 'stuck_pending',
                severity: 'medium',
                reason: 'Transaction has been pending for longer than 24 hours.',
            }
        ]);
    })

    it("should return settlement mismatch issue when settlement amount differ", () => {
        const transaction: Transaction = {
            id: 'txn-003',
            reference: 'ref-003',
            amount: 10000,
            currency: 'NGN',
            customerEmail: 'customer@example.com',
            status: 'success',
            createdAt: new Date(),
            updatedAt: new Date(),
            expectedSettlement: 2000,
            actualSettlement: 3000
        }

        const issues = evaluateTransaction(transaction)

        expect(issues).toEqual([{
                 issue: "settlement_mismatch",
                 severity: "high",
                 reason: `Expected settlement of 2000 but received 3000`,
        }
        
        ])
    })
})