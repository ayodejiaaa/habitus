import crypto from "crypto";

export function generateResetToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}

export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function logSecurity(
  action: "PASSWORD_RESET_REQUESTED" | "PASSWORD_RESET_COMPLETED" | "PASSWORD_RESET_FAILED",
  details: { email: string; reason?: string; ip?: string; tokenId?: string }
) {
  const timestamp = new Date().toISOString();
  const logMessage = `[SECURITY LOG] [${timestamp}] Action: ${action} | UserEmail: ${details.email} | IP: ${details.ip || "unknown"} | TokenId: ${details.tokenId || "N/A"}${
    details.reason ? ` | Reason: ${details.reason}` : ""
  }`;
  console.log(logMessage);
}
