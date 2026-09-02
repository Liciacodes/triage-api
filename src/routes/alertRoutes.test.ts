import {describe, it, expect, beforeEach, vi} from 'vitest';

import request from 'supertest';
vi.mock('../services/alertService', () => ({
resolveAlert: vi.fn(),
}))

import {resolveAlert} from '../services/alertService';
import app from '../app';

const mockedResolveAlert = vi.mocked(resolveAlert);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('PATCH /api/alerts/:id/resolve', () => {
    it('should resolve an alert', async () => {
        mockedResolveAlert.mockResolvedValue({
            id: "alert-001",
            type: "settlement_mismatch",
            severity: "high",
            reason: "Expected settlement of 9850 but received 9000",
            resolved: true,
            resolvedAt: new Date().toISOString(),
            transactionId: "db-test-001",
            createdAt: new Date().toISOString(),
        });

        const response = await request(app)
        .patch("/api/alerts/alert-001/resolve");

        expect(response.status).toBe(200);
        expect(mockedResolveAlert).toHaveBeenCalledWith("alert-001");
        expect(response.body.alert.resolved).toBe(true);
    });

    it('should return 404 if alert doesnt exist', async () => {
        mockedResolveAlert.mockResolvedValue(null);

        const response= await request(app)
        .patch("/api/alerts/non-existent-alert/resolve");

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Alert not found");
    })
});