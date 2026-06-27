import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, MapPin, Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "Reports",
};

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Query reports
  const reports = await db.inspectionReport.findMany({
    where: {
      request: {
        userId,
      },
      status: "ISSUED",
    },
    include: {
      request: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const getAssessmentColor = (status: string) => {
    switch (status) {
      case "ON_TRACK":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "NEEDS_ATTENTION":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "ISSUE_DETECTED":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-black text-charcoal">Inspection Reports</h1>
        <p className="text-sm text-gray-500">Access independent inspection outcomes and verification history.</p>
      </div>

      {/* Reports Feed */}
      {reports.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center space-y-4 max-w-lg mx-auto">
          <FileText className="h-10 w-10 text-gray-300 mx-auto" />
          <h3 className="font-bold text-lg text-charcoal">No reports available yet</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Once an inspector audits your site and our admins verify it, your report will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="p-6 pb-2 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-charcoal">{report.request.projectName}</h3>
                    <div className="flex items-center space-x-1.5 text-xs text-gray-400 mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Published {new Date(report.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getAssessmentColor(report.assessmentStatus)}`}>
                    {report.assessmentStatus.replace("_", " ")}
                  </span>
                </div>

                <CardContent className="space-y-4">
                  {/* Address */}
                  <div className="flex items-start space-x-2 text-xs text-gray-500">
                    <MapPin className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
                    <span>{report.request.propertyAddress}, {report.request.city}, {report.request.country}</span>
                  </div>

                  {/* Summary Snippet */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Executive Summary</span>
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {report.executiveSummary}
                    </p>
                  </div>
                </CardContent>
              </div>

              {/* Action Button */}
              <div className="px-6 pb-6 pt-0 mt-2">
                <Link href={`/dashboard/reports/${report.id}`}>
                  <Button variant="default" className="w-full flex items-center justify-center gap-2 font-bold">
                    <Eye className="h-4 w-4" /> View Report
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
