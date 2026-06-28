/**
 * Backup security sanitization layer (Defense-in-depth)
 * Removes any sensitive user fields to prevent accidental exposure.
 */
export function sanitizeUser<T extends Record<string, any>>(user: T): Omit<T, "password" | "passwordHash" | "resetToken" | "resetTokenExpiry" | "verificationToken" | "verificationTokenExpiry" | "loginAttempts" | "lockoutUntil" | "securityFlags" | "internalNotes" | "auditData"> {
  if (!user || typeof user !== "object") {
    return user;
  }

  // Create a shallow copy
  const sanitized = { ...user };

  const sensitiveFields = [
    "password",
    "passwordHash",
    "resetToken",
    "resetTokenExpiry",
    "verificationToken",
    "verificationTokenExpiry",
    "loginAttempts",
    "lockoutUntil",
    "securityFlags",
    "internalNotes",
    "auditData",
  ];

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      delete sanitized[field];
    }
  }

  return sanitized as any;
}

/**
 * Sanitizes an array of user objects.
 */
export function sanitizeUserList<T extends Record<string, any>>(users: T[]) {
  return users.map(user => sanitizeUser(user));
}
