"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { rateLimit, isAccountLocked, incrementFailedLoginAttempts, resetFailedLoginAttempts, getClientIp } from "./rate-limit";
import { generateResetToken, hashToken, logSecurity } from "./security";
import { sendPasswordResetEmail } from "./email";
import { LoginSchema } from "./schemas";

const ResetPasswordRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const NewPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
    .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
    .regex(/[0-9]/, "Password must contain at least 1 number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

/**
 * Initiates the forgot password flow.
 */
export async function requestPasswordReset(formData: { email: string }) {
  const genericSuccessMessage = "If an account exists for this email address, we have sent password reset instructions.";
  
  try {
    const validated = ResetPasswordRequestSchema.safeParse(formData);
    if (!validated.success) {
      return { error: "Invalid email address." };
    }

    const { email } = validated.data;

    const ip = await getClientIp();
    const cleanEmail = email.toLowerCase().trim();

    // 1. IP rate limiting (5 per hour)
    const ipLimitCheck = await rateLimit({
      action: "forgot-password-ip",
      identifier: ip,
      limit: 5,
      window: "1h",
    });
    if (!ipLimitCheck.success) {
      logSecurity("RATE_LIMIT_EXCEEDED", {
        ip,
        reason: "Forgot password IP rate limit exceeded",
      });
      return { error: "Too many requests. Please try again later." };
    }

    // 2. Email rate limiting (5 per hour)
    const emailLimitCheck = await rateLimit({
      action: "forgot-password-email",
      identifier: cleanEmail,
      limit: 5,
      window: "1h",
    });
    if (!emailLimitCheck.success) {
      logSecurity("RATE_LIMIT_EXCEEDED", {
        email: cleanEmail,
        ip,
        reason: "Forgot password email rate limit exceeded",
      });
      return { error: "Too many requests. Please try again later." };
    }

    // Look up user
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true },
    });

    // Security best practice: Do not reveal if email exists.
    if (!user) {
      logSecurity("PASSWORD_RESET_REQUESTED", {
        email,
        reason: "User not found (silently handled)",
      });
      return { success: genericSuccessMessage };
    }

    // Generate token
    const { rawToken, tokenHash } = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save hashed token
    const createdToken = await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Construct reset link
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/reset-password/${rawToken}`;

    // Send email
    await sendPasswordResetEmail(user.email, resetLink);

    logSecurity("PASSWORD_RESET_REQUESTED", {
      email: user.email,
      tokenId: createdToken.id,
    });

    return { success: genericSuccessMessage };
  } catch (error: any) {
    console.error("Forgot password error:", error);
    // Generic error fallback for security
    return { error: "An unexpected error occurred. Please try again later." };
  }
}

/**
 * Resets the password using a token.
 */
export async function resetPassword(token: string, values: any) {
  try {
    if (!token) {
      return { error: "This password reset link is invalid or has expired." };
    }

    const validated = NewPasswordSchema.safeParse(values);
    if (!validated.success) {
      const errorMsg = validated.error.issues[0]?.message || "Invalid password inputs.";
      return { error: errorMsg };
    }

    const { password } = validated.data;
    const tokenHash = hashToken(token);

    // Fetch token details
    const dbToken = await db.passwordResetToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          }
        }
      },
    });

    if (!dbToken || dbToken.usedAt || dbToken.expiresAt < new Date()) {
      logSecurity("PASSWORD_RESET_FAILED", {
        email: dbToken?.user?.email || "unknown",
        reason: "Invalid, used, or expired token",
      });
      return { error: "This password reset link is invalid or has expired." };
    }

    const user = dbToken.user;

    // Hash password with 10 salt rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    // Invalidate all previous reset tokens and mark current token as used in a transaction
    await db.$transaction([
      // Update password and increment session version (invalidates active sessions)
      db.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordVersion: { increment: 1 },
        },
        select: { id: true },
      }),
      // Mark current token as used
      db.passwordResetToken.update({
        where: { id: dbToken.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate all other pending tokens for the user
      db.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          id: { not: dbToken.id },
          usedAt: null,
        },
        data: { usedAt: new Date() },
      }),
    ]);

    logSecurity("PASSWORD_RESET_COMPLETED", {
      email: user.email,
      tokenId: dbToken.id,
    });

    return { success: "Password updated successfully. Redirecting to login..." };
  } catch (error: any) {
    console.error("Reset password error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Pre-flight verification for login attempts to handle custom messages, lockout increments, and IP limits
 */
export async function loginPreflight(values: any) {
  try {
    const validated = LoginSchema.safeParse(values);
    if (!validated.success) {
      return { error: "Invalid form input." };
    }

    const { email, password } = validated.data;
    const ip = await getClientIp();
    const cleanEmail = email.toLowerCase().trim();

    // 1. IP rate limiting (10 per minute)
    const ipLimit = await rateLimit({
      action: "login-ip",
      identifier: ip,
      limit: 10,
      window: "1m",
    });
    if (!ipLimit.success) {
      logSecurity("RATE_LIMIT_EXCEEDED", {
        ip,
        reason: "Login IP rate limit exceeded during pre-flight",
      });
      return { error: "Too many attempts detected. Please wait a few minutes and try again." };
    }

    // 2. Lockout check
    const locked = await isAccountLocked(cleanEmail);
    if (locked) {
      logSecurity("RATE_LIMIT_EXCEEDED", {
        email: cleanEmail,
        ip,
        reason: "Pre-flight login attempt to locked account",
      });
      return { error: "For security reasons, this action has been temporarily restricted." };
    }

    // 3. Check credentials
    const user = await db.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, password: true },
    });

    if (!user || !user.password) {
      // Increment failed attempts
      const lockoutRes = await incrementFailedLoginAttempts(cleanEmail);
      if (lockoutRes.locked) {
        logSecurity("ACCOUNT_LOCKED", {
          email: cleanEmail,
          ip,
          reason: "Account locked after 5 failed login attempts",
        });
        return { error: "For security reasons, this action has been temporarily restricted." };
      }
      return { error: "Invalid email address or password." };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      // Increment failed attempts
      const lockoutRes = await incrementFailedLoginAttempts(cleanEmail);
      if (lockoutRes.locked) {
        logSecurity("ACCOUNT_LOCKED", {
          email: cleanEmail,
          ip,
          reason: "Account locked after 5 failed login attempts",
        });
        return { error: "For security reasons, this action has been temporarily restricted." };
      }
      return { error: "Invalid email address or password." };
    }

    // Reset failed login attempts on pre-flight success
    await resetFailedLoginAttempts(cleanEmail);

    return { success: true };
  } catch (error) {
    console.error("Login preflight error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}
