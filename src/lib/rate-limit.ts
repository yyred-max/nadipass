//  SERVER ONLY  In-memory rate limiter for break-glass scans.
//  Keyed by device fingerprint (client-supplied header).
//  - 5x/hour  -> delay 5 seconds (soft warning)
//  - 10x/hour  -> freeze, return 429
//  Cleanup runs automatically every hour.

const fingerprints = new Map<string, { count: number; firstAttempt: number }>();

export function checkRateLimit(fingerprint: string): { allowed: boolean; delayMs?: number; reason?: string } {
  const now = Date.now();
  const entry = fingerprints.get(fingerprint);

  if (!entry) {
    fingerprints.set(fingerprint, { count: 1, firstAttempt: now });
    return { allowed: true };
  }

  // Reset if the first attempt is older than the sliding window
  if (now - entry.firstAttempt > 60 * 60 * 1000) {
    fingerprints.set(fingerprint, { count: 1, firstAttempt: now });
    return { allowed: true };
  }

  entry.count += 1;

  if (entry.count >= 10) {
    return { allowed: false, reason: 'freeze' };
  }

  if (entry.count >= 5) {
    const delay = 5 * 1000; // 5 seconds
    return { allowed: true, delayMs: delay };
  }

  return { allowed: true };
}

// Clean up expired entries every hour
export function cleanupRateLimit(): void {
  const now = Date.now();
  for (const [fingerprint, entry] of fingerprints) {
    if (now - entry.firstAttempt > 60 * 60 * 1000) {
      fingerprints.delete(fingerprint);
    }
  }
}

// Expose a simple tick for tests / cron if needed
export function getRateLimitStats(): { [fingerprint: string]: { count: number; firstAttempt: number } } {
  return Object.fromEntries(fingerprints);
}
