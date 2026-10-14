import {afterEach, describe, expect, it, vi} from "vitest";
import {evaluateTransaction} from "./evaluateTransaction";

import type {Transaction } from "../types/transaction";

afterEach(() => {
    vi.unstubAllEnvs();
});

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

    it('should use the configured stuck pending threshold', () => {
        vi.stubEnv('STUCK_PENDING_THRESHOLD_HOURS', '2');

        const transaction: Transaction = {
            id: 'txn-004',
            reference: 'ref-004',
            amount: 10000,
            currency: 'NGN',
            customerEmail: 'customer@example.com',
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        }
        const issues = evaluateTransaction(transaction);
        expect(issues).toEqual([
            {
                issue: 'stuck_pending',
                severity: 'medium',
                reason: 'Transaction has been pending for longer than 2 hours.',
            }
        ]);
    })

    it('should fall back to 24 hours when the configured threshold is invalid', () => {
        vi.stubEnv('STUCK_PENDING_THRESHOLD_HOURS', 'soon');

        const transaction: Transaction = {
            id: 'txn-005',
            reference: 'ref-005',
            amount: 10000,
            currency: 'NGN',
            customerEmail: 'customer@example.com',
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        }
        const issues = evaluateTransaction(transaction);
        expect(issues).toEqual([]);
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
                reason:
  "Settlement is NGN 1,000 above the expected amount. Expected NGN 2,000, received NGN 3,000.",
        }
        
        ])
    })
})