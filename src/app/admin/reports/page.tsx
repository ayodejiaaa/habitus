import type { Metadata } from "next";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";
import ReportBuilderForm from "@/components/ReportBuilderForm";
import { requireAuthenticatedUser, requireAdminAccess, AuthorizationError } from "@/lib/access-policy";
import SecurityErrorPage from "@/components/SecurityErrorPage";

export const metadata: Metadata = {
  title: "Admin Reports",
};

export default async function AdminReportsPage() {
  try {
    const user = await requireAuthenticatedUser();
    await requireAdminAccess(user);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      if (error.code === "UNAUTHENTICATED") {
        return <SecurityErrorPage type="UNAUTHENTICATED" />;
      }
      if (error.code === "UNAUTHORIZED") {
        return <SecurityErrorPage type="UNAUTHORIZED" />;
      }
    }
    redirect("/login");
  }

  // Fetch requests that either have no reports OR have a draft report
  const requestsWithDraftsOrNoReports = await db.inspectionRequest.findMany({
    where: {
      OR: [
        { reports: { none: {} } },
        { reports: { some: { status: "DRAFT" } } }
      ]
    },
    select: {
      id: true,
      projectName: true,
      city: true,
      country: true,
      reports: {
        where: { status: "DRAFT" },
        select: {
          id: true,
          assessmentStatus: true,
          executiveSummary: true,
          findings: true,
          recommendation: true,
          status: true,
          mediaAssets: {
            select: {
              id: true,
              storageProvider: true,
              mediaType: true,
              trustedUrl: true,
              displayName: true,
              originalFileName: true,
              checksum: true,
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-black text-charcoal">Report Builder</h1>
        <p className="text-sm text-gray-500">Draft, verify, and publish new construction reports to clients.</p>
      </div>

      <Suspense fallback={<div className="text-sm text-gray-400">Loading form builder...</div>}>
        <ReportBuilderForm requests={requestsWithDraftsOrNoReports as any} />
      </Suspense>
    </div>
  );
}
