import { db } from "../prisma/db";
import { RuleResult } from "../types/rule";

export const createAlertsForTransaction = async (
  transactionId: string,
  issues: RuleResult[],
) => {
  if (issues.length === 0) {
    return [];
  }

  const alerts = [];

  const activeAlerts = await getActiveAlertsForTransaction(transactionId);

  for (const issue of issues) {
    // An acknowledged alert is still active, so reuse it instead of
    // reopening the same issue as a new alert.
    const existingAlert = activeAlerts.find(
      (alert) => alert.type === issue.issue,
    );

      if (existingAlert) {
  const updatedAlert = await db.orm.public.Alert
    .where({ id: existingAlert.id })
    .update({
      severity: issue.severity,
      reason: issue.reason,
    });

  alerts.push(updatedAlert);
  continue;
}

    const alert = await db.orm.public.Alert.create({
      type: issue.issue,
      severity: issue.severity,
      reason: issue.reason,
      status: "OPEN",
      transactionId,
    });

    alerts.push(alert);
  }

  return alerts;
};

export const acknowledgeAlert = async (alertId: string) => {
  return db.orm.public.Alert
    .where({ id: alertId })
    .update({
      status: "ACKNOWLEDGED",
      acknowledgedAt: new Date().toISOString(),
    });
};

export const resolveAlert = async (alertId: string) => {
  return db.orm.public.Alert
    .where({ id: alertId })
    .update({
      status: "RESOLVED",
      resolvedAt: new Date().toISOString(),
    });
};

// Acknowledged alerts are still active: the operator has seen the issue,
// but the underlying condition has not cleared.
export const getActiveAlerts = async () => {
  const [openAlerts, acknowledgedAlerts] = await Promise.all([
    db.orm.public.Alert.where({ status: "OPEN" }).all(),
    db.orm.public.Alert.where({ status: "ACKNOWLEDGED" }).all(),
  ]);

  return [...openAlerts, ...acknowledgedAlerts];
};

export const getUnresolvedAlertsForTransaction = async (
  transactionId: string,
) => {
  return db.orm.public.Alert
    .where({
      transactionId,
      status: "OPEN",
    })
    .all();
};


export const getActiveAlertsForTransaction = async (
  transactionId: string,
) => {
  const alerts = await db.orm.public.Alert
    .where({ transactionId })
    .all();

  return alerts.filter(
    (alert) =>
      alert.status === "OPEN" ||
      alert.status === "ACKNOWLEDGED",
  );
};

export const resolveStaleAlerts = async (
  transactionId: string,
  issues: RuleResult[],
) => {
  const activeAlerts =
    await getActiveAlertsForTransaction(transactionId);

  for (const alert of activeAlerts) {
    const issueStillExists = issues.some(
      (issue) => issue.issue === alert.type,
    );

    if (!issueStillExists) {
      await resolveAlert(alert.id);
    }
  }
};