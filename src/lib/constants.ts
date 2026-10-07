export const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

export const RATE_LIMIT_SCAN = {
  softDelay: 5, // seconds between scans before warning
  freeze: 10, // seconds of silence before the session is considered dead
  windowMs: 60 * 60 * 1000, // 1 hour sliding window
} as const;
