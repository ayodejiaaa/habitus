import type { Metadata } from "next";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import RequestsManager from "./requests-manager";
import { requireAuthenticatedUser, requireAdminAccess, AuthorizationError } from "@/lib/access-policy";
import SecurityErrorPage from "@/components/SecurityErrorPage";

export const metadata: Metadata = {
  title: "Admin Requests",
};

export default async function AdminRequestsPage() {
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

  // Fetch all requests
  const requests = await db.inspectionRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        }
      },
      reports: {
        select: {
          id: true,
          status: true,
        }
      },
      service: {
        select: {
          name: true,
          price: true,
        }
      },
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-black text-charcoal">Inspection Requests Manager</h1>
        <p className="text-sm text-gray-500">Review client requests, update status, and initialize reports.</p>
      </div>

      <RequestsManager requests={requests as any} />
    </div>
  );
}
