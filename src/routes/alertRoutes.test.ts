import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";

vi.mock("../services/alertService", () => ({
  acknowledgeAlert: vi.fn(),
}));

import { acknowledgeAlert } from "../services/alertService";
import app from "../app";

const mockedAcknowledgeAlert = vi.mocked(acknowledgeAlert);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PATCH /api/alerts/:id/acknowledge", () => {
  it("should acknowledge an alert", async () => {
    mockedAcknowledgeAlert.mockResolvedValue({
      id: "alert-001",
      type: "settlement_mismatch",
      severity: "high",
      reason: "Expected settlement of 9850 but received 9000",
      status: "ACKNOWLEDGED",
      acknowledgedAt: new Date().toISOString(),
     
      resolvedAt: null,
      transactionId: "db-test-001",
      createdAt: new Date().toISOString(),
    });

    const response = await request(app)
      .patch("/api/alerts/alert-001/acknowledge");

    expect(response.status).toBe(200);
    expect(mockedAcknowledgeAlert).toHaveBeenCalledWith("alert-001");
    expect(response.body.alert.status).toBe("ACKNOWLEDGED");
    expect(response.body.alert.acknowledgedAt).not.toBeNull();
  });

  it("should return 404 if alert does not exist", async () => {
    mockedAcknowledgeAlert.mockResolvedValue(null);

    const response = await request(app)
      .patch("/api/alerts/non-existent-alert/acknowledge");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Alert not found");
  });
});