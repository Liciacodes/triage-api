const DEFAULT_STUCK_PENDING_THRESHOLD_HOURS = 24;

// Read on each call rather than at import time, so the value is picked up
// regardless of when dotenv loads the environment.
export const getStuckPendingThresholdHours = (): number => {
  const configured = Number(process.env.STUCK_PENDING_THRESHOLD_HOURS);

  if (!Number.isFinite(configured) || configured <= 0) {
    return DEFAULT_STUCK_PENDING_THRESHOLD_HOURS;
  }

  return configured;
};
