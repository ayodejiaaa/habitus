import { headers } from "next/headers";

interface RateLimitRecord {
  timestamps: number[];
}

// Global in-memory maps for rate limiting
const emailLimiter = new Map<string, RateLimitRecord>();
const ipLimiter = new Map<string, RateLimitRecord>();
const verificationLimiter = new Map<string, RateLimitRecord>();

const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function rateLimit(email: string): Promise<{ success: boolean; limit: number; remaining: number }> {
  const now = Date.now();
  
  // Get IP address
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0] || headerList.get("x-real-ip") || "127.0.0.1";
  
  // Helper function to check limit
  const checkLimit = (key: string, limiter: Map<string, RateLimitRecord>) => {
    let record = limiter.get(key);
    if (!record) {
      record = { timestamps: [] };
      limiter.set(key, record);
    }
    
    // Filter out timestamps outside the window
    record.timestamps = record.timestamps.filter((ts) => now - ts < WINDOW_MS);
    
    if (record.timestamps.length >= LIMIT) {
      return { success: false, remaining: 0 };
    }
    
    record.timestamps.push(now);
    return { success: true, remaining: LIMIT - record.timestamps.length };
  };
  
  // Check email
  const emailCheck = checkLimit(email.toLowerCase().trim(), emailLimiter);
  if (!emailCheck.success) {
    return { success: false, limit: LIMIT, remaining: 0 };
  }
  
  // Check IP
  const ipCheck = checkLimit(ip, ipLimiter);
  if (!ipCheck.success) {
    // If IP check fails, revert the email record timestamp addition
    const emailRecord = emailLimiter.get(email.toLowerCase().trim());
    if (emailRecord) {
      emailRecord.timestamps.pop();
    }
    return { success: false, limit: LIMIT, remaining: 0 };
  }
  
  return { success: true, limit: LIMIT, remaining: Math.min(emailCheck.remaining, ipCheck.remaining) };
}

/**
 * Enforces a rate limit of 3 verification emails per hour per user account.
 */
export async function rateLimitVerification(userId: string): Promise<boolean> {
  const now = Date.now();
  const VERIFY_LIMIT = 3;
  
  let record = verificationLimiter.get(userId);
  if (!record) {
    record = { timestamps: [] };
    verificationLimiter.set(userId, record);
  }
  
  // Filter out timestamps outside the 1-hour window
  record.timestamps = record.timestamps.filter((ts) => now - ts < WINDOW_MS);
  
  if (record.timestamps.length >= VERIFY_LIMIT) {
    return false;
  }
  
  record.timestamps.push(now);
  return true;
}
