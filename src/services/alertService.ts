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

  for (const issue of issues) {
    const alert = await db.orm.public.Alert.create({
      type: issue.issue,
      severity: issue.severity,
      reason: issue.reason,
      resolved: false,
      transactionId,
    });
    alerts.push(alert);
  }
  return alerts;
};

export const resolveAlert = async (alertId: string) => {
  return db.orm.public.Alert.where({ id: alertId }).update({
    resolved: true,
    resolvedAt: new Date().toISOString(),
  });
};

export const getUnresolvedAlerts = async () => {
    return db.orm.public.Alert
    .where({ resolved: false })
    .all();
}
