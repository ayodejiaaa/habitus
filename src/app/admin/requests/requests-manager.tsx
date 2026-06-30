"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  X, MapPin, Phone, User, Calendar, Mail, FileCheck, Download, Search, FileText 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusSelect from "./status-select";

interface RequestWithRelations {
  id: string;
  projectName: string;
  propertyAddress: string;
  city: string;
  state: string;
  country: string;
  propertyType: string;
  stage: string;
  siteContactName: string;
  siteContactPhone: string;
  notes: string | null;
  specialInstructions: string | null;
  status: string;
  paymentStatus: string;
  paystackReference: string | null;
  paymentEnvironment: string | null;
  webhookProcessed: boolean;
  webhookProcessedAt: Date | null;
  verifiedAt: Date | null;
  createdAt: Date;
  service: {
    name: string;
    price: number;
  } | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
  reports: Array<{
    id: string;
    status: string;
  }>;
}

interface RequestsManagerProps {
  requests: RequestWithRelations[];
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "PENDING_PAYMENT":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "PAYMENT_VERIFIED":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "INSPECTION_SCHEDULED":
      return "bg-indigo-50 text-indigo-700 border-indigo-100";
    case "IN_PROGRESS":
      return "bg-purple-50 text-purple-700 border-purple-100";
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "ISSUED":
      return "bg-teal-50 text-teal-700 border-teal-100";
    default:
      return "bg-gray-50 text-gray-700 border-gray-100";
  }
}

function getStatusLabel(status: string) {
  return status.replace(/_/g, " ");
}

export default function RequestsManager({ requests }: RequestsManagerProps) {
  const [selectedReq, setSelectedReq] = useState<RequestWithRelations | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Sync selected request with live status updates from table if any
  const liveSelectedReq = selectedReq 
    ? requests.find(r => r.id === selectedReq.id) || selectedReq 
    : null;

  // Filtering requests
  const filteredRequests = requests.filter((req) => {
    const term = searchTerm.toLowerCase();
    return (
      req.projectName.toLowerCase().includes(term) ||
      req.id.toLowerCase().includes(term) ||
      (req.user.name && req.user.name.toLowerCase().includes(term)) ||
      req.user.email.toLowerCase().includes(term) ||
      req.propertyAddress.toLowerCase().includes(term) ||
      req.city.toLowerCase().includes(term)
    );
  });

  return (
    <div className="relative">
      {/* Search Filter */}
      <div className="mb-6 max-w-md relative">
        <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by project name, ID, address, or client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
        />
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center text-sm text-gray-400">
          No client inspection requests match your search or have been submitted yet.
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
              <thead className="bg-brand-bg text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-border">
                <tr>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Date Submitted</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {filteredRequests.map((req) => (
                  <tr 
                    key={req.id} 
                    onClick={() => setSelectedReq(req)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-charcoal block">{req.projectName}</span>
                        <span className="text-[10px] text-primary font-bold">{req.service?.name || "Standard Inspection"}</span>
                        <span className="text-[9px] text-gray-400 font-mono block mt-0.5">ID: {req.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div>
                        <span className="font-semibold block">{req.user.name || "Client User"}</span>
                        <span className="text-xs text-gray-400 block">{req.user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center space-x-2 text-xs">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(req.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {req.paymentStatus === "PAID" ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          Paid
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${getStatusBadgeClass(req.status)}`}>
                        {getStatusLabel(req.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-out Drawer Panel */}
      {liveSelectedReq && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedReq(null)} 
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 max-w-2xl w-full bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0 border-l border-border">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                  ID: {liveSelectedReq.id}
                </span>
                <h3 className="text-xl font-black text-charcoal">{liveSelectedReq.projectName}</h3>
                <span className="text-xs text-primary font-bold block mt-0.5">
                  {liveSelectedReq.service?.name}
                </span>
              </div>
              <button 
                onClick={() => setSelectedReq(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Primary Actions Card */}
              <div className="bg-brand-bg border border-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 font-bold uppercase">Status:</span>
                  <StatusSelect 
                    requestId={liveSelectedReq.id} 
                    currentStatus={liveSelectedReq.status as any} 
                    isReportIssued={liveSelectedReq.reports.some(r => r.status === "ISSUED")} 
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/requests/${liveSelectedReq.id}/print-inspector`} target="_blank">
                    <Button variant="outline" size="sm" className="font-bold flex items-center gap-1.5 border-border hover:bg-gray-50 cursor-pointer">
                      <Download className="h-3.5 w-3.5" /> Export Job Sheet
                    </Button>
                  </Link>

                  {liveSelectedReq.reports.length === 0 ? (
                    <Link href={`/admin/reports?request=${liveSelectedReq.id}`}>
                      <Button size="sm" className="font-bold flex items-center gap-1.5 bg-accent text-white hover:bg-accent-hover cursor-pointer">
                        <FileCheck className="h-3.5 w-3.5" /> Build Report
                      </Button>
                    </Link>
                  ) : liveSelectedReq.reports[0].status === "DRAFT" ? (
                    <Link href={`/admin/reports?request=${liveSelectedReq.id}`}>
                      <Button size="sm" className="font-bold flex items-center gap-1.5 bg-amber-500 text-white hover:bg-amber-600 cursor-pointer">
                        <FileCheck className="h-3.5 w-3.5" /> Edit Draft
                      </Button>
                    </Link>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md flex items-center gap-1.5">
                      <FileCheck className="h-3.5 w-3.5" /> Report Issued
                    </span>
                  )}
                </div>
              </div>

              {/* Paystack Diagnostics */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800 space-y-3">
                <h5 className="font-black text-blue-900 uppercase tracking-wider text-[10px]">Paystack Diagnostics (Admin-Only)</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-[9px] uppercase text-blue-500 block">Reference</span>
                    <span className="font-mono text-xs block truncate" title={liveSelectedReq.paystackReference || "N/A"}>
                      {liveSelectedReq.paystackReference || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-[9px] uppercase text-blue-500 block">Environment</span>
                    <span className="uppercase text-xs font-semibold">{liveSelectedReq.paymentEnvironment || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[9px] uppercase text-blue-500 block">Payment Status</span>
                    <span className="uppercase text-xs font-bold">{liveSelectedReq.paymentStatus}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[9px] uppercase text-blue-500 block">Verified At</span>
                    <span className="text-xs">
                      {liveSelectedReq.verifiedAt ? new Date(liveSelectedReq.verifiedAt).toLocaleString() : "Unverified"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-bold text-[9px] uppercase text-blue-500 block">Webhook Processed</span>
                    <span className="text-xs font-semibold">
                      {liveSelectedReq.webhookProcessed ? `Yes (${liveSelectedReq.webhookProcessedAt ? new Date(liveSelectedReq.webhookProcessedAt).toLocaleString() : ""})` : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Site Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-gray-100 pb-1">Site Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4.5 w-4.5 shrink-0 text-gray-400 mt-0.5" />
                    <div>
                      <span className="font-semibold text-charcoal block">Location Address</span>
                      <span className="text-xs block">{liveSelectedReq.propertyAddress}</span>
                      <span className="text-xs block">{liveSelectedReq.city}, {liveSelectedReq.state}, {liveSelectedReq.country}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4.5 w-4.5 shrink-0 text-gray-400" />
                      <div>
                        <span className="font-semibold text-charcoal block">Site Contact Name</span>
                        <span className="text-xs block">{liveSelectedReq.siteContactName}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4.5 w-4.5 shrink-0 text-gray-400" />
                      <div>
                        <span className="font-semibold text-charcoal block">Site Contact Phone</span>
                        <span className="text-xs block">{liveSelectedReq.siteContactPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-gray-100 pb-1">Client Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <User className="h-4.5 w-4.5 shrink-0 text-gray-400" />
                    <div>
                      <span className="font-semibold text-charcoal block">Client Name</span>
                      <span className="text-xs block">{liveSelectedReq.user.name || "N/A"}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4.5 w-4.5 shrink-0 text-gray-400" />
                      <div>
                        <span className="font-semibold text-charcoal block">Email Address</span>
                        <span className="text-xs block">{liveSelectedReq.user.email}</span>
                      </div>
                    </div>
                    {liveSelectedReq.user.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4.5 w-4.5 shrink-0 text-gray-400" />
                        <div>
                          <span className="font-semibold text-charcoal block">Phone Number</span>
                          <span className="text-xs block">{liveSelectedReq.user.phone}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Request Properties */}
              <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4 text-xs font-semibold text-gray-500">
                <div>
                  <span className="text-[10px] uppercase text-gray-400 block mb-0.5">Property Type</span>
                  <span className="text-charcoal text-sm">{liveSelectedReq.propertyType}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-gray-400 block mb-0.5">Construction Stage</span>
                  <span className="text-charcoal text-sm capitalize">{liveSelectedReq.stage.toLowerCase()}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-gray-400 block mb-0.5">Reports Published</span>
                  <span className="text-charcoal text-sm">
                    {liveSelectedReq.reports.length > 0 ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              {/* Instructions */}
              {(liveSelectedReq.notes || liveSelectedReq.specialInstructions) && (
                <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-4 border border-gray-100">
                  {liveSelectedReq.notes && (
                    <div>
                      <span className="font-bold text-[10px] uppercase text-gray-400 block mb-1">Notes</span>
                      <p className="leading-relaxed whitespace-pre-wrap">{liveSelectedReq.notes}</p>
                    </div>
                  )}
                  {liveSelectedReq.specialInstructions && (
                    <div>
                      <span className="font-bold text-[10px] uppercase text-gray-400 block mb-1">Special Instructions</span>
                      <p className="leading-relaxed whitespace-pre-wrap">{liveSelectedReq.specialInstructions}</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </>
      )}
    </div>
  );
}
