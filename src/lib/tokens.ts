import crypto from "crypto";
import { db } from "@/lib/db";
import { hashToken } from "./security";

/**
 * Generates and stores a new verification token for a user.
 * Marks any previous unused verification tokens as used to invalidate them.
 */
export async function generateVerificationToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Invalidate previous pending tokens for this user
  await db.verificationToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  // Create new verification token
  await db.verificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return rawToken;
}
