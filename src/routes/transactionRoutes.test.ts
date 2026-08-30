import { describe, it, expect } from 'vitest';
import request from 'supertest';

import app from '../app'

describe("POST /api/transactions/evaluate", () => {

    it("should return 400 for invalid transaction data", async () => {
        const response = await request(app)
        .post('/api/transactions/evaluate')
        .send({
            id:'001',
            reference: 'trf-001',
            currency: 'NGN',
            amount: -1000,
            customerEmail: 'not-an-email',
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })

        expect(response.status).toBe(400)
    })
})