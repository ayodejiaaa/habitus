import type { Metadata } from "next";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ServicesManager from "./services-manager";
import { requireAuthenticatedUser, requireAdminAccess, AuthorizationError } from "@/lib/access-policy";
import SecurityErrorPage from "@/components/SecurityErrorPage";

export const metadata: Metadata = {
  title: "Admin Services",
};

export default async function AdminServicesPage() {
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

  // Fetch all services
  const services = await db.inspectionService.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-black text-charcoal">Manage Inspection Services</h1>
        <p className="text-sm text-gray-500">
          Activate or deactivate inspection types throughout the platform, modify fee prices, and define order sequence.
        </p>
      </div>

      <ServicesManager initialServices={services} />
    </div>
  );
}
