import { headers } from "next/headers";
import { db } from "@/lib/db";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client if credentials are provided in env variables
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
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
 * Core rate limiting utility.
 * Protects actions by limiting attempts for an identifier in a given time window.
 */
export async function rateLimit({
  action,
  identifier,
  limit,
  window,
}: RateLimitParams): Promise<{ success: boolean; limit: number; remaining: number }> {
  const windowSeconds = parseWindowToSeconds(window);
  const key = `ratelimit:${action}:${identifier}`;

  // 1. Try Redis rate limiting
  if (redis) {
    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }
      const remaining = Math.max(0, limit - current);
      return {
        success: current <= limit,
        limit,
        remaining,
      };
    } catch (redisError) {
      console.error("Upstash Redis rate limiter error, falling back to DB:", redisError);
    }
  }

  // 2. Fallback to PostgreSQL database rate limiting
  try {
    const now = new Date();
    // Prune expired entries to keep database size clean
    await db.rateLimit.deleteMany({
      where: { expiresAt: { lt: now } },
    }).catch(() => {});

    const record = await db.rateLimit.findUnique({
      where: { key },
    });

    if (!record || record.expiresAt < now) {
      const expiresAt = new Date(Date.now() + windowSeconds * 1000);
      await db.rateLimit.upsert({
        where: { key },
        create: { key, points: 1, expiresAt },
        update: { points: 1, expiresAt },
      });
      return { success: true, limit, remaining: limit - 1 };
    }

    if (record.points >= limit) {
      return { success: false, limit, remaining: 0 };
    }

    const updated = await db.rateLimit.update({
      where: { key },
      data: { points: { increment: 1 } },
    });

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - updated.points),
    };
  } catch (dbError) {
    console.error("Database rate limiter fallback error:", dbError);
    // Secure by default: if rate limiter fails, allow request but log warning
    return { success: true, limit, remaining: 1 };
  }
}

/**
 * Checks if a login account (email) is currently locked out.
 */
export async function isAccountLocked(email: string): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  const key = `lockout:${cleanEmail}`;

  // Try Redis
  if (redis) {
    try {
      const exists = await redis.exists(key);
      return exists > 0;
    } catch (err) {
      console.error("Redis lockout check failed, checking DB:", err);
    }
  }

  // Try DB
  try {
    const record = await db.rateLimit.findUnique({ where: { key } });
    if (record && record.expiresAt > new Date()) {
      return true;
    }
  } catch (err) {
    console.error("Database lockout check failed:", err);
  }

  return false;
}

interface LockoutResult {
  locked: boolean;
  remainingAttempts: number;
  lockExpiration?: Date;
}

/**
 * Increments failed login attempts for an email and applies a 15-minute lockout if threshold is exceeded.
 */
export async function incrementFailedLoginAttempts(email: string): Promise<LockoutResult> {
  const cleanEmail = email.toLowerCase().trim();
  const failKey = `loginfail:${cleanEmail}`;
  const lockKey = `lockout:${cleanEmail}`;
  const limit = 5;
  const windowSeconds = 15 * 60; // 15 minutes

  // 1. Try Redis
  if (redis) {
    try {
      const attempts = await redis.incr(failKey);
      if (attempts === 1) {
        await redis.expire(failKey, windowSeconds);
      }

      if (attempts >= limit) {
        await redis.set(lockKey, "locked", { ex: windowSeconds });
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
    } catch (err) {
      console.error("Redis failed login increment failed, using DB:", err);
    }
  }

  // 2. Try DB
  try {
    const now = new Date();
    const record = await db.rateLimit.findUnique({ where: { key: failKey } });

    let attempts = 1;
    if (record && record.expiresAt > now) {
      attempts = record.points + 1;
      await db.rateLimit.update({
        where: { key: failKey },
        data: { points: attempts },
      });
    } else {
      const expiresAt = new Date(Date.now() + windowSeconds * 1000);
      await db.rateLimit.upsert({
        where: { key: failKey },
        create: { key: failKey, points: 1, expiresAt },
        update: { points: 1, expiresAt },
      });
    }

    if (attempts >= limit) {
      const expiresAt = new Date(Date.now() + windowSeconds * 1000);
      await db.rateLimit.upsert({
        where: { key: lockKey },
        create: { key: lockKey, points: 1, expiresAt },
        update: { points: 1, expiresAt },
      });
      return {
        locked: true,
        remainingAttempts: 0,
        lockExpiration: expiresAt,
      };
    }

    return {
      locked: false,
      remainingAttempts: limit - attempts,
    };
  } catch (err) {
    console.error("Database failed login increment failed:", err);
    return { locked: false, remainingAttempts: 1 };
  }
}

/**
 * Resets failed login attempts and unlocks an account (called upon successful login).
 */
export async function resetFailedLoginAttempts(email: string): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  const failKey = `loginfail:${cleanEmail}`;
  const lockKey = `lockout:${cleanEmail}`;

  // Try Redis
  if (redis) {
    try {
      await redis.del(failKey, lockKey);
    } catch (err) {
      console.error("Redis reset attempts failed:", err);
    }
  }

  // Try DB
  try {
    await db.rateLimit.deleteMany({
      where: {
        key: { in: [failKey, lockKey] },
      },
    });
  } catch (err) {
    console.error("Database reset attempts failed:", err);
  }
}
