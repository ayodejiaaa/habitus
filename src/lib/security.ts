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
  action:
    | "PASSWORD_RESET_REQUESTED"
    | "PASSWORD_RESET_COMPLETED"
    | "PASSWORD_RESET_FAILED"
    | "VERIFICATION_EMAIL_SENT"
    | "VERIFICATION_SUCCESSFUL"
    | "VERIFICATION_FAILED"
    | "VERIFICATION_RESENT"
    | "UNAUTHORIZED_ACCESS_ATTEMPT"
    | "EVIDENCE_SUBMITTED"
    | "EVIDENCE_ATTACHED"
    | "EVIDENCE_PUBLISHED"
    | "INVALID_MEDIA_BLOCKED"
    | "RATE_LIMIT_EXCEEDED"
    | "ACCOUNT_LOCKED",
  details: { 
    email?: string; 
    userId?: string; 
    resourceType?: string; 
    resourceId?: string; 
    reason?: string; 
    ip?: string; 
    tokenId?: string 
  }
) {
  const timestamp = new Date().toISOString();
  const logMessage = `[SECURITY LOG] [${timestamp}] Action: ${action}${
    details.userId ? ` | UserId: ${details.userId}` : ""
  }${
    details.email ? ` | UserEmail: ${details.email}` : ""
  }${
    details.resourceType ? ` | ResourceType: ${details.resourceType}` : ""
  }${
    details.resourceId ? ` | ResourceId: ${details.resourceId}` : ""
  }${
    details.ip ? ` | IP: ${details.ip}` : ""
  }${
    details.tokenId ? ` | TokenId: ${details.tokenId}` : ""
  }${
    details.reason ? ` | Reason: ${details.reason}` : ""
  }`;
  console.log(logMessage);
}
