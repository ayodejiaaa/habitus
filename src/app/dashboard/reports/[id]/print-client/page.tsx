import { db } from "@/lib/db";
import { requireAuthenticatedUser, requireReportAccess } from "@/lib/access-policy";
import { notFound, redirect } from "next/navigation";
import PrintTrigger from "./print-trigger";
import { validateMediaUrl } from "@/lib/media/validators";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await db.inspectionReport.findUnique({
    where: { id },
    select: {
      request: {
        select: {
          projectName: true,
        },
      },
    },
  });
  if (!report) {
    return { title: "Habitus_Report" };
  }
  const cleanProjectName = report.request.projectName.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_");
  return {
    title: {
      absolute: `Habitus_Report_${cleanProjectName}`,
    },
  };
}

export default async function PrintClientReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let report;
  try {
    const user = await requireAuthenticatedUser();
    const dbReport = await db.inspectionReport.findUnique({
      where: { id },
      include: {
        request: {
          include: {
            service: true,
          },
        },
        mediaAssets: true,
      },
    });

    if (!dbReport) {
      notFound();
    }

    const isAuthorized = user.role === "ADMIN" || (dbReport.request.userId === user.id && dbReport.status === "ISSUED");
    if (!isAuthorized) {
      redirect("/login");
    }
    report = dbReport;
  } catch {
    redirect("/login");
  }

  const findingsList = report.findings.split("\n").filter((line) => line.trim() !== "");

  const getAssessmentLabel = (status: string) => {
    switch (status) {
      case "ON_TRACK":
        return {
          label: "On Track",
          style: "bg-emerald-50 border-emerald-200 text-emerald-800",
        };
      case "NEEDS_ATTENTION":
        return {
          label: "Needs Attention",
          style: "bg-amber-50 border-amber-200 text-amber-800",
        };
      case "ISSUE_DETECTED":
        return {
          label: "Issue Detected",
          style: "bg-red-50 border-red-200 text-red-800",
        };
      default:
        return {
          label: "Unknown",
          style: "bg-gray-50 border-gray-200 text-gray-800",
        };
    }
  };

  const getRecommendationLabel = (rec: string) => {
    switch (rec) {
      case "PROCEED":
        return {
          title: "Proceed",
          style: "bg-emerald-50 text-emerald-800 border-emerald-100",
        };
      case "PROCEED_WITH_CAUTION":
        return {
          title: "Proceed With Caution",
          style: "bg-amber-50 text-amber-800 border-amber-100",
        };
      case "PAUSE_FUNDING":
        return {
          title: "Pause Further Funding",
          style: "bg-red-50 text-red-800 border-red-100",
        };
      default:
        return {
          title: rec,
          style: "bg-gray-50 text-gray-800 border-gray-100",
        };
    }
  };

  const assessment = getAssessmentLabel(report.assessmentStatus);
  const recDetails = getRecommendationLabel(report.recommendation);

  const photos = report.mediaAssets.filter((asset) => asset.mediaType === "IMAGE");
  const videos = report.mediaAssets.filter((asset) => asset.mediaType === "VIDEO");

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
          aside, nav, .md\\:hidden, button, header, footer, a.back-btn {
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
          /* Prevent page-breaks in critical blocks */
          .no-break {
            page-break-inside: avoid !important;
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
          <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Verification Audit Report</h1>
          <span className="text-xs text-gray-400 font-mono">Report ID: {report.id}</span>
        </div>
      </div>

      {/* Basic Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <div>
            <label className="text-[9px] text-gray-400 uppercase font-bold block">Project Name</label>
            <span className="text-sm font-semibold text-gray-800">{report.request.projectName}</span>
          </div>
          <div>
            <label className="text-[9px] text-gray-400 uppercase font-bold block">Property Address</label>
            <span className="text-xs font-semibold text-gray-800">
              {report.request.propertyAddress}, {report.request.city}, {report.request.state}, {report.request.country}
            </span>
          </div>
        </div>
        <div className="space-y-2 md:text-right">
          <div>
            <label className="text-[9px] text-gray-400 uppercase font-bold block">Report Date</label>
            <span className="text-xs font-semibold text-gray-800">
              {new Date(report.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}
            </span>
          </div>
          <div>
            <label className="text-[9px] text-gray-400 uppercase font-bold block">Inspection Type</label>
            <span className="text-xs font-semibold text-gray-800">
              {report.request.service?.name || "Standard Inspection"}
            </span>
          </div>
        </div>
      </div>

      {/* Assessment and Recommendation Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 no-break">
        <div className={`p-4 rounded-lg border text-center ${assessment.style}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70 mb-1">Assessment Outcome</span>
          <span className="font-extrabold text-sm uppercase">{assessment.label}</span>
        </div>
        <div className={`p-4 rounded-lg border text-center ${recDetails.style}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70 mb-1">Action Recommendation</span>
          <span className="font-extrabold text-sm uppercase">{recDetails.title}</span>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="border border-gray-100 rounded-lg p-5 mb-6 no-break">
        <h3 className="text-xs font-bold text-[#1F7A5A] uppercase tracking-wider border-b border-gray-100 pb-1.5 mb-3">Executive Summary</h3>
        <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
          {report.executiveSummary}
        </p>
      </div>

      {/* Key Findings */}
      <div className="border border-gray-100 rounded-lg p-5 mb-6 no-break">
        <h3 className="text-xs font-bold text-[#1F7A5A] uppercase tracking-wider border-b border-gray-100 pb-1.5 mb-3">Key Findings</h3>
        {findingsList.length === 0 ? (
          <p className="text-xs text-gray-400">No findings logged.</p>
        ) : (
          <ul className="space-y-2.5">
            {findingsList.map((finding, index) => (
              <li key={index} className="flex items-start space-x-2.5 text-xs text-gray-600">
                <span className="h-4.5 w-4.5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-[10px]">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{finding}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Evidence Section */}
      {(photos.length > 0 || videos.length > 0) && (
        <div className="border border-gray-100 rounded-lg p-5 mb-6 no-break">
          <h3 className="text-xs font-bold text-[#1F7A5A] uppercase tracking-wider border-b border-gray-100 pb-1.5 mb-3">Audit Evidence Logs</h3>
          
          {/* Photos */}
          {photos.length > 0 && (
            <div className="space-y-3 mb-4">
              <label className="text-[10px] text-gray-400 uppercase font-bold block">Photo Evidence</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {photos.map((photo) => {
                  const isTrusted = validateMediaUrl(photo.trustedUrl).isValid;
                  return (
                    <div key={photo.id} className="border border-gray-100 rounded overflow-hidden bg-gray-50 flex flex-col justify-center min-h-[10rem]">
                      {isTrusted ? (
                        photo.trustedUrl.includes("/folders/") ? (
                          <div className="p-4 text-center">
                            <span className="text-xs font-bold text-gray-700 block">{photo.displayName || "Google Drive Photos"}</span>
                            <span className="text-[9px] text-gray-400 font-mono block mt-1 break-all">{photo.trustedUrl}</span>
                          </div>
                        ) : (
                          <>
                            <img
                              src={photo.trustedUrl}
                              alt={photo.displayName || "Evidence"}
                              className="w-full h-36 object-cover"
                            />
                            <div className="bg-gray-100 text-gray-600 p-1.5 text-center text-[9px] font-semibold">
                              {photo.displayName || "Site Photo Log"}
                            </div>
                          </>
                        )
                      ) : (
                        <div className="p-4 text-center text-xs text-red-500 font-bold">
                          Unverified or untrusted photo source.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="text-[10px] text-gray-400 uppercase font-bold block">Video Evidence Links</label>
              <ul className="space-y-1.5">
                {videos.map((vid) => (
                  <li key={vid.id} className="text-xs text-gray-600">
                    <span className="font-semibold">{vid.displayName || "Video Log"}: </span>
                    <a href={vid.trustedUrl} target="_blank" rel="noopener noreferrer" className="text-[#1F7A5A] underline break-all font-mono text-[10px]">
                      {vid.trustedUrl}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Footer Branding Statement */}
      <div className="mt-12 border-t border-gray-200 pt-4 text-center text-[10px] text-gray-400 uppercase tracking-widest print:absolute print:bottom-6 print:w-full print:left-0">
        Habitus Africa • Build Back Home With Confidence • www.habitus.africa
      </div>
    </div>
  );
}
