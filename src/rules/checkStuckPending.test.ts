import {describe, it, expect} from 'vitest';
import { checkStuckPending } from './checkStuckPending';
import type { Transaction } from '../types/transaction';


describe('checkStuckPending', () => {
it('should return null when transaction is not pending', () => {
    const transaction: Transaction = {
        id:'txn-001',
        reference: 'ref-001',
        amount: 5000,
        currency: 'NGN',
        customerEmail: 'customer@example.com',
        status: 'success',
        createdAt: new Date(),
        updatedAt: new Date(),
    }

    const result = checkStuckPending(transaction, 24);
    expect (result).toBeNull();
})


it('should return null when pending transaction is within threshold', () => {
    const transaction: Transaction = {
        id: 'txn-002',
        reference: 'ref-002',
        amount: 10000,
        currency: 'NGN',
        customerEmail: 'customer@example.com',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date((Date.now() - 2 * 60 * 60 * 1000)),     
    }

    const result = checkStuckPending(transaction, 24);
    expect(result).toBeNull();
})

it('should flag a transaction pending longer than threshold', () => {
    const transaction: Transaction = {
        id: 'txn-003',
        reference: 'ref-003',
        amount: 15000,
        currency: 'NGN',
        customerEmail: 'customer@example.com',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date((Date.now() - 30 * 60 * 60 * 1000)),     
    }
    const result = checkStuckPending(transaction, 24);
    expect(result).toEqual({
        issue: 'stuck_pending',
        severity: 'medium',
        reason: 'Transaction has been pending for longer than 24 hours.',
    })
})
})