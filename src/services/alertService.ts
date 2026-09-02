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
    const existingAlert = await db.orm.public.Alert.where({
      transactionId,
      type: issue.issue,
      resolved: false,
    }).first();

    if (existingAlert) {
      alerts.push(existingAlert);
      continue;
    }

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
  return db.orm.public.Alert.where({ resolved: false }).all();
};


export const getUnresolvedAlertsForTransaction = async (
  transactionId: string,
) => {
  return db.orm.public.Alert
  .where({ 
    transactionId, 
    resolved: false 
  })
  .all();
}

export const resolveStaleAlerts = async (
  transactionId: string,
  issues: RuleResult[],
) => {
  const unresolvedAlerts =
   await getUnresolvedAlertsForTransaction(transactionId); 
   
   for (const alert of unresolvedAlerts) {
    const issueStillExists = issues.some(
      (issue) => issue.issue  === alert.type,
    );

    if (!issueStillExists) {
      await resolveAlert(alert.id);
    } 
  }
}