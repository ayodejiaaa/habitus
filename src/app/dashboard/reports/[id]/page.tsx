import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, ShieldCheck, AlertCircle, AlertOctagon, HelpCircle } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
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
    if (!report?.request?.projectName) {
      return { title: "Report Details" };
    }
    return { title: `Report: ${report.request.projectName}` };
  } catch (error) {
    return { title: "Report Details" };
  }
}

function getEmbedUrl(url: string) {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split(/[?#]/)[0];
    } else if (url.includes("embed/")) {
      videoId = url.split("embed/")[1]?.split(/[?#]/)[0];
    } else {
      const match = url.match(/[?&]v=([^&#]+)/);
      videoId = match ? match[1] : "";
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }
  if (url.includes("vimeo.com")) {
    const videoId = url.split("vimeo.com/")[1]?.split(/[?#]/)[0];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
  }
  return null;
}

export default async function ReportDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  // Query report details
  const report = await db.inspectionReport.findUnique({
    where: { id },
    include: {
      request: true,
      mediaAssets: true,
    },
  });

  if (!report) {
    notFound();
  }

  // Double check authorization: Client can only read their own reports
  const isAdmin = (session.user as any).role === "ADMIN";
  if (!isAdmin && report.request.userId !== session.user.id) {
    redirect("/dashboard");
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

  const photos = report.mediaAssets.filter((asset) => asset.type === "PHOTO");
  const videos = report.mediaAssets.filter((asset) => asset.type === "VIDEO");

  return (
    <div className="space-y-8 pb-16">
      {/* Back button */}
      <div>
        <Link href={isAdmin ? "/admin/reports" : "/dashboard/reports"}>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 font-bold">
            <ArrowLeft className="h-4 w-4" /> Back to Reports
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
              {photos.map((photo) => (
                <div key={photo.id} className="relative rounded-lg overflow-hidden border border-border group bg-gray-50">
                  {/* Since url is a mock or external link, we use a standard HTML img */}
                  <img
                    src={photo.url.startsWith("http") ? photo.url : "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=500&q=80"}
                    alt="Construction site evidence"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white p-2 text-center text-[10px] font-bold">
                    Site Capture Log
                  </div>
                </div>
              ))}
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
                const embedUrl = getEmbedUrl(vid.url);
                return (
                  <div key={vid.id} className="space-y-2">
                    {embedUrl ? (
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-black">
                        <iframe
                          src={embedUrl}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full border-0"
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4 border border-border flex flex-col justify-between h-32">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400">Direct Video link</span>
                          <p className="text-xs text-gray-600 truncate mt-1">{vid.url}</p>
                        </div>
                        <a href={vid.url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="w-full">
                            Open External Video
                          </Button>
                        </a>
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
