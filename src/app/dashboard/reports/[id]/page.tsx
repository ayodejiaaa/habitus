import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, ShieldCheck, AlertCircle, AlertOctagon, HelpCircle, Folder, Download } from "lucide-react";
import { requireAuthenticatedUser, requireReportAccess, AuthorizationError } from "@/lib/access-policy";
import SecurityErrorPage from "@/components/SecurityErrorPage";
import { validateMediaUrl } from "@/lib/media/validators";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { title: "Authentication Required | Habitus" };
    }

    const { id } = await params;
    const report = await db.inspectionReport.findUnique({
      where: { id },
      select: {
        request: {
          select: {
            userId: true,
            projectName: true,
          },
        },
      },
    });

    if (!report) {
      return { title: "Report Details | Habitus" };
    }

    const isAuthorized = (session.user as any).role === "ADMIN" || report.request.userId === session.user.id;
    if (!isAuthorized) {
      return { title: "Access Denied | Habitus" };
    }

    return { title: `Report: ${report.request.projectName} | Habitus` };
  } catch (error) {
    return { title: "Report Details | Habitus" };
  }
}



export default async function ReportDetailPage({ params }: PageProps) {
  const { id } = await params;

  let report;
  let isAdmin = false;

  try {
    const user = await requireAuthenticatedUser();
    isAdmin = user.role === "ADMIN";
    report = await requireReportAccess(id, user);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      if (error.code === "UNAUTHENTICATED") {
        return <SecurityErrorPage type="UNAUTHENTICATED" />;
      }
      if (error.code === "UNAUTHORIZED") {
        return <SecurityErrorPage type="UNAUTHORIZED" />;
      }
    }
    notFound();
  }

  const findingsList = report.findings.split("\n").filter((line) => line.trim() !== "");

  const getAssessmentStyles = (status: string) => {
    switch (status) {
      case "ON_TRACK":
        return {
          bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
          badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: ShieldCheck,
          label: "On Track",
        };
      case "NEEDS_ATTENTION":
        return {
          bg: "bg-amber-50 border-amber-200 text-amber-800",
          badge: "bg-amber-100 text-amber-800 border-amber-200",
          icon: AlertCircle,
          label: "Needs Attention",
        };
      case "ISSUE_DETECTED":
        return {
          bg: "bg-red-50 border-red-200 text-red-800",
          badge: "bg-red-100 text-red-800 border-red-200",
          icon: AlertOctagon,
          label: "Issue Detected",
        };
      default:
        return {
          bg: "bg-gray-50 border-gray-200 text-gray-800",
          badge: "bg-gray-100 text-gray-800 border-gray-200",
          icon: HelpCircle,
          label: "Unknown",
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

  const assessment = getAssessmentStyles(report.assessmentStatus);
  const recDetails = getRecommendationLabel(report.recommendation);
  const AssessmentIcon = assessment.icon;

  const photos = report.mediaAssets.filter((asset) => asset.mediaType === "IMAGE");
  const videos = report.mediaAssets.filter((asset) => asset.mediaType === "VIDEO");

  return (
    <div className="space-y-8 pb-16">
      {/* Back button */}
      <div className="flex justify-between items-center">
        <Link href={isAdmin ? "/admin/reports" : "/dashboard/reports"}>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 font-bold">
            <ArrowLeft className="h-4 w-4" /> Back to Reports
          </Button>
        </Link>
        <Link href={`/dashboard/reports/${id}/print-client`} target="_blank">
          <Button size="sm" className="font-bold flex items-center gap-1.5 bg-primary text-white hover:bg-primary/95 cursor-pointer">
            <Download className="h-4 w-4" /> Download Report (PDF)
          </Button>
        </Link>
      </div>

      {/* Report Header */}
      <div className="bg-white border border-border rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Verification Audit Report</span>
          <h1 className="text-3xl font-black text-charcoal">{report.request.projectName}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-500 pt-1">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{report.request.propertyAddress}, {report.request.city}, {report.request.country}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>Report Date: {new Date(report.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}</span>
            </div>
          </div>
        </div>

        <div className={`flex items-center space-x-3 px-5 py-3 rounded-lg border ${assessment.bg} shrink-0`}>
          <AssessmentIcon className="h-6 w-6" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">Assessment</span>
            <span className="font-extrabold text-sm uppercase">{assessment.label}</span>
          </div>
        </div>
      </div>

      {/* Grid: Summary & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Executive Summary & Findings */}
        <div className="lg:col-span-2 space-y-8">
          {/* Executive Summary */}
          <div className="bg-white border border-border rounded-xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-charcoal border-b border-gray-50 pb-2">Executive Summary</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {report.executiveSummary}
            </p>
          </div>

          {/* Key Findings */}
          <div className="bg-white border border-border rounded-xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-charcoal border-b border-gray-50 pb-2">Key Findings</h3>
            {findingsList.length === 0 ? (
              <p className="text-sm text-gray-400">No specific findings logged.</p>
            ) : (
              <ul className="space-y-3">
                {findingsList.map((finding, index) => (
                  <li key={index} className="flex items-start space-x-3 text-sm text-gray-600">
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{finding}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right side: Recommendation & Specs */}
        <div className="space-y-8">
          {/* Recommendation */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-charcoal">Action Recommendation</h3>
            <div className={`p-4 rounded-lg border font-bold text-center ${recDetails.style}`}>
              {recDetails.title}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed text-center">
              Based on the inspector's observations, we suggest aligning on this recommendation with your site contractor.
            </p>
          </div>

          {/* Site Metadata */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-charcoal">Project Properties</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-400 uppercase font-bold">Property Type</span>
                <span className="text-charcoal font-semibold">{report.request.propertyType}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-400 uppercase font-bold">Stage Audited</span>
                <span className="text-charcoal font-semibold capitalize">{report.request.stage.toLowerCase()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-400 uppercase font-bold">Site Contact</span>
                <span className="text-charcoal font-semibold">{report.request.siteContactName}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-400 uppercase font-bold">Contact Phone</span>
                <span className="text-charcoal font-semibold">{report.request.siteContactPhone}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Media Evidence Gallery */}
      <div className="bg-white border border-border rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="text-lg font-bold text-charcoal border-b border-gray-50 pb-2">Inspection Evidence</h3>
        
        {/* Photos Grid */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Photo Logs</h4>
          {photos.length === 0 ? (
            <p className="text-xs text-gray-400 bg-gray-50 p-4 rounded text-center">No photo evidence uploaded.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => {
                const isTrusted = validateMediaUrl(photo.trustedUrl).isValid;
                return (
                  <div key={photo.id} className="relative rounded-lg overflow-hidden border border-border group bg-gray-50 flex flex-col justify-center min-h-[12rem]">
                    {isTrusted ? (
                      photo.trustedUrl.includes("/folders/") ? (
                        <a 
                          href={photo.trustedUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center p-6 text-center h-48 bg-gray-50 border border-border rounded-lg hover:bg-gray-100 transition-colors group cursor-pointer"
                        >
                          <div className="p-3 bg-amber-100 rounded-full text-amber-600 mb-3 group-hover:scale-110 transition-transform duration-200">
                            <Folder className="h-8 w-8" />
                          </div>
                          <span className="text-sm font-bold text-charcoal truncate max-w-xs block">
                            {photo.displayName || "View Drive Photos"}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono mt-1">
                            GOOGLE DRIVE FOLDER
                          </span>
                        </a>
                      ) : (
                        <>
                          <img
                            src={photo.trustedUrl}
                            alt={photo.displayName || "Construction site evidence"}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white p-2 text-center text-[10px] font-bold">
                            {photo.displayName || "Site Capture Log"}
                          </div>
                        </>
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center h-48 bg-gray-50 border border-red-100 rounded-lg">
                        <AlertOctagon className="h-6 w-6 text-red-400 mb-1.5 shrink-0" />
                        <span className="text-xs font-bold text-gray-500">This evidence is currently unavailable.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Videos Section */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Video Logs</h4>
          {videos.length === 0 ? (
            <p className="text-xs text-gray-400 bg-gray-50 p-4 rounded text-center">No video logs provided.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.map((vid) => {
                const isTrusted = validateMediaUrl(vid.trustedUrl).isValid;
                return (
                  <div key={vid.id} className="space-y-2">
                    {isTrusted ? (
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-black">
                        <iframe
                          src={vid.trustedUrl}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full border-0"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center aspect-video bg-gray-50 border border-red-100 rounded-lg">
                        <AlertOctagon className="h-6 w-6 text-red-400 mb-1.5 shrink-0" />
                        <span className="text-xs font-bold text-gray-500">This evidence is currently unavailable.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Report Footer */}
      <div className="text-center text-xs text-gray-400 pt-6">
        <p>Published by: <strong>Habitus Verification Team</strong></p>
      </div>
    </div>
  );
}
