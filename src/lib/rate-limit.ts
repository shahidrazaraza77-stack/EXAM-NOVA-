/**
 * Server-Side In-Memory Sliding-Window Rate Limiter
 * Provides robust rate limiting for sensitive endpoints (Auth, AI, File Uploads, Admin)
 */

interface RateLimitRecord {
  timestamps: number[];
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// In-memory bucket store
const ipStores = new Map<string, RateLimitRecord>();

// Predefined rate-limit profiles
export const RATE_LIMIT_PROFILES = {
  // Authentication: 10 attempts per minute (prevents brute-force)
  auth: { maxRequests: 10, windowMs: 60 * 1000 },
  // MFA verification: 5 attempts per minute (prevents TOTP guessing)
  mfa: { maxRequests: 5, windowMs: 60 * 1000 },
  // AI generation endpoints: 15 calls per minute (controls cost & abuse)
  ai: { maxRequests: 15, windowMs: 60 * 1000 },
  // File uploads: 10 uploads per minute (prevents storage flooding)
  upload: { maxRequests: 10, windowMs: 60 * 1000 },
  // Admin actions: 30 calls per minute
  admin: { maxRequests: 30, windowMs: 60 * 1000 },
  // General API: 100 calls per minute
  general: { maxRequests: 100, windowMs: 60 * 1000 },
} as const;

// Periodic cleanup to avoid memory leak
let lastCleanup = Date.now();
function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < 60 * 1000) return;
  lastCleanup = now;

  for (const [key, record] of ipStores.entries()) {
    // Keep only timestamps within the last 15 minutes
    record.timestamps = record.timestamps.filter((ts) => now - ts < 15 * 60 * 1000);
    if (record.timestamps.length === 0) {
      ipStores.delete(key);
    }
  }
}

/**
 * Checks and increments the rate limit for a given identifier (IP or User ID)
 */
export function checkRateLimit(
  identifier: string,
  profile: keyof typeof RATE_LIMIT_PROFILES | RateLimitConfig = "general"
): {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
} {
  cleanupExpired();

  const config: RateLimitConfig =
    typeof profile === "string" ? RATE_LIMIT_PROFILES[profile] || RATE_LIMIT_PROFILES.general : profile;

  const now = Date.now();
  const windowStart = now - config.windowMs;
  const key = `${typeof profile === "string" ? profile : "custom"}:${identifier}`;

  let record = ipStores.get(key);
  if (!record) {
    record = { timestamps: [] };
    ipStores.set(key, record);
  }

  // Filter out timestamps outside current sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= config.maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const resetMs = Math.max(0, config.windowMs - (now - oldestTimestamp));
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetMs,
    };
  }

  // Record this request
  record.timestamps.push(now);

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - record.timestamps.length,
    resetMs: config.windowMs,
  };
}

/**
 * Helper to extract client IP from NextRequest
 */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
