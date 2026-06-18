import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ServicesManager from "./services-manager";

export const metadata: Metadata = {
  title: "Admin Services",
};

export default async function AdminServicesPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session?.user || role !== "ADMIN") {
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
