import type { Metadata } from "next";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import StatusSelect from "./status-select";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, User, Calendar, Mail, FileCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
        }
      },
      reports: true,
      service: true,
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-black text-charcoal">Inspection Requests Manager</h1>
        <p className="text-sm text-gray-500">Review client requests, update status, and initialize reports.</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center text-sm text-gray-400">
          No client inspection requests have been submitted yet.
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((req) => (
            <Card key={req.id} className="hover:shadow-sm transition-shadow">
              <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                    ID: {req.id}
                  </span>
                  <h3 className="font-bold text-lg text-charcoal">{req.projectName}</h3>
                  <span className="text-xs text-primary font-bold block mt-0.5">
                    {req.service?.name || "Standard Inspection"}
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs text-gray-400 mt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Requested {new Date(req.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                    <span className="mx-2 text-gray-300">|</span>
                    {req.paymentStatus === "PAID" ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Paid (₦{req.service?.price.toLocaleString() || "350,000"})
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Unpaid (₦{req.service?.price.toLocaleString() || "350,000"})
                      </span>
                    )}
                  </div>
                </div>
                {/* Status management controls */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 font-bold uppercase">Update Status:</span>
                  <StatusSelect 
                    requestId={req.id} 
                    currentStatus={req.status} 
                    isReportIssued={req.reports.some(r => r.status === "ISSUED")} 
                  />
                  {req.reports.length === 0 ? (
                    <Link href={`/admin/reports?request=${req.id}`}>
                      <Button size="sm" className="font-bold flex items-center gap-1.5 bg-accent text-white hover:bg-accent-hover cursor-pointer">
                        <FileCheck className="h-3.5 w-3.5" /> Build Report
                      </Button>
                    </Link>
                  ) : req.reports[0].status === "DRAFT" ? (
                    <Link href={`/admin/reports?request=${req.id}`}>
                      <Button size="sm" className="font-bold flex items-center gap-1.5 bg-amber-500 text-white hover:bg-amber-600 cursor-pointer">
                        <FileCheck className="h-3.5 w-3.5" /> Edit Draft
                      </Button>
                    </Link>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md flex items-center gap-1.5">
                      <FileCheck className="h-3.5 w-3.5" /> Issued
                    </span>
                  )}
                </div>
              </div>

              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                {/* Payment Diagnostics (Admin Only) */}
                <div className="md:col-span-2 bg-blue-50 border border-blue-100 rounded-lg p-4 text-xs text-blue-800 space-y-2">
                  <h5 className="font-black text-blue-900 uppercase tracking-wider text-[10px]">Paystack Diagnostics (Admin-Only)</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <div>
                      <span className="font-bold text-[9px] uppercase text-blue-500 block">Reference</span>
                      <span className="font-mono text-xs block truncate max-w-[150px]" title={req.paystackReference || "N/A"}>
                        {req.paystackReference || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-[9px] uppercase text-blue-500 block">Environment</span>
                      <span className="uppercase text-xs font-semibold">{req.paymentEnvironment || "N/A"}</span>
                    </div>
                    <div>
                      <span className="font-bold text-[9px] uppercase text-blue-500 block">Payment Status</span>
                      <span className="uppercase text-xs font-bold">{req.paymentStatus}</span>
                    </div>
                    <div>
                      <span className="font-bold text-[9px] uppercase text-blue-500 block">Verified At</span>
                      <span className="text-xs">
                        {req.verifiedAt ? new Date(req.verifiedAt).toLocaleString() : "Unverified"}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-[9px] uppercase text-blue-500 block">Webhook Processed</span>
                      <span className="text-xs font-semibold">
                        {req.webhookProcessed ? `Yes (${req.webhookProcessedAt ? new Date(req.webhookProcessedAt).toLocaleDateString() : ""})` : "No"}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Project Location & Contact */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Site Information</h4>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
                      <span>{req.propertyAddress}, {req.city}, {req.state}, {req.country}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 shrink-0 text-gray-400" />
                      <span>Site Contact: {req.siteContactName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                      <span>Phone: {req.siteContactPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Client info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Client Information</h4>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 shrink-0 text-gray-400" />
                      <span>Name: {req.user.name || "Client User"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                      <span>Email: {req.user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Request Properties */}
                <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-gray-50 pt-4 text-xs font-semibold text-gray-500">
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 block mb-0.5">Property Type</span>
                    <span className="text-charcoal text-sm">{req.propertyType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 block mb-0.5">Construction Stage</span>
                    <span className="text-charcoal text-sm capitalize">{req.stage.toLowerCase()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 block mb-0.5">Reports Published</span>
                    <span className="text-charcoal text-sm">
                      {req.reports.length > 0 ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                {/* Instructions */}
                {(req.notes || req.specialInstructions) && (
                  <div className="md:col-span-2 bg-gray-50 rounded p-4 text-xs text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {req.notes && (
                      <div>
                        <span className="font-bold text-[10px] uppercase text-gray-400 block mb-1">Notes</span>
                        <p className="leading-relaxed">{req.notes}</p>
                      </div>
                    )}
                    {req.specialInstructions && (
                      <div>
                        <span className="font-bold text-[10px] uppercase text-gray-400 block mb-1">Special Instructions</span>
                        <p className="leading-relaxed">{req.specialInstructions}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
