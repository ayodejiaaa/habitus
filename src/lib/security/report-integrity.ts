import { db } from "@/lib/db";

/**
 * Checks whether a request or its associated report can be modified.
 * Once a report has been successfully ISSUED to a client, all associated workflow components
 * (request status, report findings, recommendations, and attached media assets) are frozen.
 * Returns allowed: false if modification is prohibited.
 */
export async function canModifyRequest(requestId: string): Promise<{ allowed: boolean; reason?: string }> {
  try {
    if (!requestId) {
      return { allowed: false, reason: "Request ID is required." };
    }

    const report = await db.inspectionReport.findUnique({
      where: { requestId },
      select: { status: true },
    });

    if (report && report.status === "ISSUED") {
      return {
        allowed: false,
        reason: "This request cannot be modified because an inspection report has already been issued.",
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Error evaluating report integrity state:", error);
    // Fail closed to prevent unsafe bypass
    return {
      allowed: false,
      reason: "Security integrity check failed.",
    };
  }
}
