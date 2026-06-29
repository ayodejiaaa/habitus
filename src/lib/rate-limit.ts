import { headers } from "next/headers";
import { Redis } from "@upstash/redis";
import { logSecurity } from "./security";

// Initialize Upstash Redis client if credentials are provided in env variables
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = redisUrl && redisToken
  ? new Redis({
      url: redisUrl,
      token: redisToken,
    })
  : null;

/**
 * Gets the current request client's IP address.
 */
export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    return headerList.get("x-forwarded-for")?.split(",")[0] || headerList.get("x-real-ip") || "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

/**
 * Helper to parse window string (e.g. "1m", "15m", "1h", "24h") to seconds.
 */
function parseWindowToSeconds(window: string): number {
  const num = parseInt(window.slice(0, -1));
  const unit = window.slice(-1).toLowerCase();
  switch (unit) {
    case "s": return num;
    case "m": return num * 60;
    case "h": return num * 3600;
    case "d": return num * 86400;
    default: return 60;
  }
}

interface RateLimitParams {
  action: string;
  identifier: string;
  limit: number;
  window: string;
}

/**
 * Core rate limiting utility using Redis as the single source of truth.
 * Protects actions by limiting attempts for an identifier in a given time window.
 * Fails closed (blocks request) if Redis is unavailable or unconfigured to prevent bypass.
 */
export async function rateLimit({
  action,
  identifier,
  limit,
  window,
}: RateLimitParams): Promise<{ success: boolean; limit: number; remaining: number; error?: string }> {
  const windowSeconds = parseWindowToSeconds(window);
  const key = `ratelimit:${action}:${identifier}`;

  if (!redis) {
    logSecurity("RATE_LIMITER_FAILURE", {
      reason: `Redis unconfigured. Action: ${action}, Identifier: ${identifier}`,
    });
    return {
      success: false,
      limit,
      remaining: 0,
      error: "Please try again shortly.",
    };
  }

  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }
    const remaining = Math.max(0, limit - current);
    const success = current <= limit;

    if (!success) {
      logSecurity("RATE_LIMIT_EXCEEDED", {
        userId: identifier.includes("@") ? undefined : identifier,
        email: identifier.includes("@") ? identifier : undefined,
        reason: `Rate limit exceeded for action: ${action}`,
      });
    }

    return {
      success,
      limit,
      remaining,
    };
  } catch (error: any) {
    logSecurity("RATE_LIMITER_FAILURE", {
      reason: `Redis error: ${error.message || error}. Action: ${action}, Identifier: ${identifier}`,
    });
    return {
      success: false,
      limit,
      remaining: 0,
      error: "Please try again shortly.",
    };
  }
}

/**
 * Checks if a login account (email) is currently locked out.
 * Fails closed (returns true) if Redis is unavailable.
 */
export async function isAccountLocked(email: string): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  const key = `lockout:${cleanEmail}`;

  if (!redis) {
    logSecurity("RATE_LIMITER_FAILURE", {
      email: cleanEmail,
      reason: "Redis unconfigured during lockout check",
    });
    return true; // Fail closed
  }

  try {
    const exists = await redis.exists(key);
    return exists > 0;
  } catch (err: any) {
    logSecurity("RATE_LIMITER_FAILURE", {
      email: cleanEmail,
      reason: `Redis error during lockout check: ${err.message || err}`,
    });
    return true; // Fail closed
  }
}

interface LockoutResult {
  locked: boolean;
  remainingAttempts: number;
  lockExpiration?: Date;
  error?: string;
}

/**
 * Increments failed login attempts for an email and applies a 15-minute lockout if threshold is exceeded.
 * Fails closed (returns locked: true) if Redis is unavailable.
 */
export async function incrementFailedLoginAttempts(email: string): Promise<LockoutResult> {
  const cleanEmail = email.toLowerCase().trim();
  const failKey = `loginfail:${cleanEmail}`;
  const lockKey = `lockout:${cleanEmail}`;
  const limit = 5;
  const windowSeconds = 15 * 60; // 15 minutes

  if (!redis) {
    logSecurity("RATE_LIMITER_FAILURE", {
      email: cleanEmail,
      reason: "Redis unconfigured during failed login increment",
    });
    return {
      locked: true,
      remainingAttempts: 0,
      error: "Please try again shortly.",
    };
  }

  try {
    const attempts = await redis.incr(failKey);
    if (attempts === 1) {
      await redis.expire(failKey, windowSeconds);
    }

    if (attempts >= limit) {
      await redis.set(lockKey, "locked", { ex: windowSeconds });
      
      logSecurity("ACCOUNT_LOCKED", {
        email: cleanEmail,
        reason: "Account locked after 5 failed login attempts",
      });

      return {
        locked: true,
        remainingAttempts: 0,
        lockExpiration: new Date(Date.now() + windowSeconds * 1000),
      };
    }

    return {
      locked: false,
      remainingAttempts: limit - attempts,
    };
  } catch (err: any) {
    logSecurity("RATE_LIMITER_FAILURE", {
      email: cleanEmail,
      reason: `Redis error during failed login increment: ${err.message || err}`,
    });
    return {
      locked: true,
      remainingAttempts: 0,
      error: "Please try again shortly.",
    };
  }
}

/**
 * Resets failed login attempts and unlocks an account (called upon successful login).
 */
export async function resetFailedLoginAttempts(email: string): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  const failKey = `loginfail:${cleanEmail}`;
  const lockKey = `lockout:${cleanEmail}`;

  if (!redis) {
    logSecurity("RATE_LIMITER_FAILURE", {
      email: cleanEmail,
      reason: "Redis unconfigured during failed attempts reset",
    });
    return;
  }

  try {
    await redis.del(failKey, lockKey);
  } catch (err: any) {
    logSecurity("RATE_LIMITER_FAILURE", {
      email: cleanEmail,
      reason: `Redis error during failed attempts reset: ${err.message || err}`,
    });
  }
}
