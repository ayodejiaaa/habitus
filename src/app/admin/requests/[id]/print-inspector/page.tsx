import { db } from "@/lib/db";
import { requireAuthenticatedUser, requireAdminAccess } from "@/lib/access-policy";
import { notFound, redirect } from "next/navigation";
import PrintTrigger from "./print-trigger";

export default async function PrintInspectorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Authenticate and Authorize
  try {
    const user = await requireAuthenticatedUser();
    await requireAdminAccess(user);
  } catch {
    redirect("/login");
  }

  // 2. Fetch the specific request, including service details
  const req = await db.inspectionRequest.findUnique({
    where: { id },
    include: {
      service: true,
    },
  });

  if (!req) {
    notFound();
  }

  // 3. Render printable sheet (no client details, no payment details)
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-gray-900 font-sans print:p-0">
      <PrintTrigger />
      
      {/* Printable Sheet Header */}
      <div className="flex justify-between items-center border-b-2 border-[#1F7A5A] pb-6 mb-8">
        <div className="flex items-center space-x-2">
          <span className="text-3xl font-black tracking-tight text-[#1F7A5A]">Habitus</span>
          <span className="h-3 w-3 rounded-full bg-[#E57A44]"></span>
        </div>
        <div className="text-right">
          <h1 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Inspection Job Sheet</h1>
          <span className="text-xs text-gray-400 font-mono">Job ID: {req.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Project Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#1F7A5A] uppercase tracking-wider border-b border-gray-100 pb-1">Project Details</h3>
          <div>
            <label className="text-[10px] text-gray-400 uppercase font-bold block">Project Name</label>
            <span className="text-sm font-semibold text-gray-800">{req.projectName}</span>
          </div>
          <div>
            <label className="text-[10px] text-gray-400 uppercase font-bold block">Inspection Service</label>
            <span className="text-sm font-semibold text-gray-800">{req.service?.name || "Standard Inspection"}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-bold block">Property Type</label>
              <span className="text-sm font-semibold text-gray-800">{req.propertyType}</span>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-bold block">Construction Stage</label>
              <span className="text-sm font-semibold text-gray-800 capitalize">{req.stage.toLowerCase()}</span>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#1F7A5A] uppercase tracking-wider border-b border-gray-100 pb-1">Site Location</h3>
          <div>
            <label className="text-[10px] text-gray-400 uppercase font-bold block">Address</label>
            <span className="text-sm font-semibold text-gray-800 block">{req.propertyAddress}</span>
            <span className="text-sm font-semibold text-gray-800 block">{req.city}, {req.state}</span>
            <span className="text-sm font-semibold text-gray-800 block">{req.country}</span>
          </div>
        </div>
      </div>

      {/* Site Contact Section */}
      <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 mb-8">
        <h3 className="text-sm font-bold text-[#1F7A5A] uppercase tracking-wider border-b border-gray-200/50 pb-2 mb-4">Site Contact Person</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-gray-400 uppercase font-bold block">Contact Name</label>
            <span className="text-sm font-semibold text-gray-800">{req.siteContactName}</span>
          </div>
          <div>
            <label className="text-[10px] text-gray-400 uppercase font-bold block">Contact Phone</label>
            <span className="text-sm font-semibold text-gray-800">{req.siteContactPhone}</span>
          </div>
        </div>
      </div>

      {/* Instructions & Notes */}
      <div className="space-y-6">
        {req.notes && (
          <div className="border border-gray-100 rounded-lg p-6">
            <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">General Notes</h4>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{req.notes}</p>
          </div>
        )}
        {req.specialInstructions && (
          <div className="border border-gray-100 rounded-lg p-6">
            <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Special Instructions</h4>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{req.specialInstructions}</p>
          </div>
        )}
      </div>

      {/* Footer Branding Statement */}
      <div className="mt-16 border-t border-gray-200 pt-6 text-center text-[10px] text-gray-400 uppercase tracking-widest print:absolute print:bottom-8 print:w-full print:left-0">
        Habitus Africa • Verify Ongoing Construction Work Remotely
      </div>
    </div>
  );
}
