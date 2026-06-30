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
    <div className="print-container max-w-4xl mx-auto p-6 bg-white text-gray-900 font-sans print:p-0">
      <PrintTrigger />
      
      {/* CSS overrides specifically for printer layouts */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          /* Hide sidebar, headers, and screens-only content */
          aside, nav, .md\\:hidden, button, header, footer {
            display: none !important;
          }
          /* Reset wrapper margins and background colors for page printing */
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .min-h-screen, .bg-brand-bg, main, .max-w-6xl, .max-w-4xl {
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            min-height: auto !important;
            box-shadow: none !important;
            border: none !important;
          }
          /* Setup margins on the print container */
          .print-container {
            padding: 15mm 15mm 15mm 15mm !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
        }
      `}} />
      
      {/* Printable Sheet Header */}
      <div className="flex justify-between items-center border-b-2 border-[#1F7A5A] pb-4 mb-6">
        <div className="flex items-center space-x-1.5">
          <span className="text-3xl font-black tracking-tight text-[#1F7A5A]">Habitus</span>
          <svg className="h-3 w-3 text-[#E57A44] fill-current" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" />
          </svg>
        </div>
        <div className="text-right">
          <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Inspection Job Sheet</h1>
          <span className="text-xs text-gray-400 font-mono">Job ID: {req.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Project Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#1F7A5A] uppercase tracking-wider border-b border-gray-100 pb-1">Project Details</h3>
          <div>
            <label className="text-[9px] text-gray-400 uppercase font-bold block">Project Name</label>
            <span className="text-xs font-semibold text-gray-800">{req.projectName}</span>
          </div>
          <div>
            <label className="text-[9px] text-gray-400 uppercase font-bold block">Inspection Service</label>
            <span className="text-xs font-semibold text-gray-800">{req.service?.name || "Standard Inspection"}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] text-gray-400 uppercase font-bold block">Property Type</label>
              <span className="text-xs font-semibold text-gray-800">{req.propertyType}</span>
            </div>
            <div>
              <label className="text-[9px] text-gray-400 uppercase font-bold block">Construction Stage</label>
              <span className="text-xs font-semibold text-gray-800 capitalize">{req.stage.toLowerCase()}</span>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#1F7A5A] uppercase tracking-wider border-b border-gray-100 pb-1">Site Location</h3>
          <div>
            <label className="text-[9px] text-gray-400 uppercase font-bold block">Address</label>
            <span className="text-xs font-semibold text-gray-800 block">{req.propertyAddress}</span>
            <span className="text-xs font-semibold text-gray-800 block">{req.city}, {req.state}</span>
            <span className="text-xs font-semibold text-gray-800 block">{req.country}</span>
          </div>
        </div>
      </div>

      {/* Site Contact Section */}
      <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-6">
        <h3 className="text-xs font-bold text-[#1F7A5A] uppercase tracking-wider border-b border-gray-200/50 pb-1.5 mb-3">Site Contact Person</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[9px] text-gray-400 uppercase font-bold block">Contact Name</label>
            <span className="text-xs font-semibold text-gray-800">{req.siteContactName}</span>
          </div>
          <div>
            <label className="text-[9px] text-gray-400 uppercase font-bold block">Contact Phone</label>
            <span className="text-xs font-semibold text-gray-800">{req.siteContactPhone}</span>
          </div>
        </div>
      </div>

      {/* Instructions & Notes */}
      <div className="space-y-4">
        {req.notes && (
          <div className="border-l-4 border-[#1F7A5A] bg-gray-50/50 p-3 rounded-r-md">
            <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">General Notes</h4>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{req.notes}</p>
          </div>
        )}
        {req.specialInstructions && (
          <div className="border-l-4 border-[#1F7A5A] bg-gray-50/50 p-3 rounded-r-md">
            <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Special Instructions</h4>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{req.specialInstructions}</p>
          </div>
        )}
      </div>

      {/* Footer Branding Statement */}
      <div className="mt-12 border-t border-gray-200 pt-4 text-center text-[10px] text-gray-400 uppercase tracking-widest print:absolute print:bottom-6 print:w-full print:left-0">
        Habitus Africa • Build Back Home With Confidence • habitus.africa
      </div>
    </div>
  );
}
