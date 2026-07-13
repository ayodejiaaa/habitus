import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logSecurity } from "@/lib/security";

export class AuthorizationError extends Error {
  constructor(public code: "UNAUTHENTICATED" | "UNAUTHORIZED" | "NOT_FOUND", message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Logs unauthorized access attempts.
 */
export function logUnauthorizedAccess(userId: string, resourceType: string, resourceId: string) {
  logSecurity("UNAUTHORIZED_ACCESS_ATTEMPT", {
    userId,
    resourceType,
    resourceId,
  });
}

/**
 * Validates that a user is logged in.
 * Returns the authenticated user object.
 */
export async function requireAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthorizationError("UNAUTHENTICATED", "You must be signed in to access this resource.");
  }
  return session.user as { id: string; name?: string | null; email?: string | null; role?: string };
}

/**
 * Validates that the user is an admin.
 */
export async function requireAdminAccess(user: { id: string; role?: string }) {
  if (user.role !== "ADMIN") {
    logUnauthorizedAccess(user.id, "ADMIN_SECTION", "ALL");
    throw new AuthorizationError("UNAUTHORIZED", "You do not have permission to access this resource.");
  }
}

/**
 * Validates report access: ADMINs or the report owner.
 * Returns the report details.
 */
export async function requireReportAccess(reportId: string, user: { id: string; role?: string }) {
  const report = await db.inspectionReport.findUnique({
    where: { id: reportId },
    include: {
      request: {
        include: {
          service: true,
        },
      },
      mediaAssets: true,
    },
  });

  if (!report) {
    throw new AuthorizationError("NOT_FOUND", "Resource not found.");
  }

  const isAuthorized = user.role === "ADMIN" || (report.request.userId === user.id && report.status === "ISSUED");
  if (!isAuthorized) {
    logUnauthorizedAccess(user.id, "REPORT", reportId);
    throw new AuthorizationError("UNAUTHORIZED", "You do not have permission to access this resource.");
  }

  return report;
}

/**
 * Validates project access (InspectionRequest) based on ownership or admin status.
 */
export async function requireProjectAccess(projectId: string, user: { id: string; role?: string }) {
  const request = await db.inspectionRequest.findUnique({
    where: { id: projectId },
  });

  if (!request) {
    throw new AuthorizationError("NOT_FOUND", "Resource not found.");
  }

  const isAuthorized = user.role === "ADMIN" || request.userId === user.id;
  if (!isAuthorized) {
    logUnauthorizedAccess(user.id, "PROJECT", projectId);
    throw new AuthorizationError("UNAUTHORIZED", "You do not have permission to access this resource.");
  }

  return request;
}

/**
 * Validates inspection request access based on ownership or admin status.
 */
export async function requireInspectionRequestAccess(requestId: string, user: { id: string; role?: string }) {
  const request = await db.inspectionRequest.findUnique({
    where: { id: requestId },
    include: {
      reports: true,
    },
  });

  if (!request) {
    throw new AuthorizationError("NOT_FOUND", "Resource not found.");
  }

  const isAuthorized = user.role === "ADMIN" || request.userId === user.id;
  if (!isAuthorized) {
    logUnauthorizedAccess(user.id, "INSPECTION_REQUEST", requestId);
    throw new AuthorizationError("UNAUTHORIZED", "You do not have permission to access this resource.");
  }

  return request;
}
