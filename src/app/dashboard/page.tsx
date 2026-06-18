import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Award, Clock, ArrowUpRight, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Query requests
  const requests = await db.inspectionRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      reports: true,
    },
  });

  const totalRequests = requests.length;
  const completedReports = requests.filter(
    (r) => r.status === "REPORT_READY" || r.status === "COMPLETED"
  ).length;
  const pendingRequests = requests.filter(
    (r) => r.status === "SUBMITTED" || r.status === "IN_PROGRESS"
  ).length;

  const recentRequests = requests.slice(0, 5);
  const recentReports = requests
    .filter((r) => r.reports.length > 0)
    .map((r) => ({
      requestId: r.id,
      projectName: r.projectName,
      reportId: r.reports[0].id,
      date: r.reports[0].createdAt,
      assessmentStatus: r.reports[0].assessmentStatus,
    }))
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-amber-100 text-amber-800";
      case "REPORT_READY":
        return "bg-emerald-100 text-emerald-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAssessmentColor = (status: string) => {
    switch (status) {
      case "ON_TRACK":
        return "bg-emerald-100 text-emerald-800";
      case "NEEDS_ATTENTION":
        return "bg-amber-100 text-amber-800";
      case "ISSUE_DETECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-charcoal">Welcome back, {session.user.name || "Client"}</h1>
          <p className="text-sm text-gray-500">Monitor construction audits and verify progress back home.</p>
        </div>
        <Link href="/dashboard/requests">
          <Button className="font-bold flex items-center gap-2">
            <Plus className="h-4 w-4" /> Request Inspection
          </Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Requests</CardTitle>
            <ClipboardList className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-charcoal">{totalRequests}</div>
            <p className="text-xs text-gray-400 mt-1">Submitted construction audits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Completed Reports</CardTitle>
            <Award className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-charcoal">{completedReports}</div>
            <p className="text-xs text-gray-400 mt-1">Ready to view reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pending Inspections</CardTitle>
            <Clock className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-charcoal">{pendingRequests}</div>
            <p className="text-xs text-gray-400 mt-1">In progress or submitted</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Lists Section */}
      {totalRequests === 0 ? (
        <div className="bg-white border border-border rounded-xl p-10 text-center space-y-4 max-w-lg mx-auto mt-8">
          <ClipboardList className="h-12 w-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-lg text-charcoal">No inspection requests yet</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Submit your first construction project details and site contact. We'll assign an offline inspector to perform an independent audit.
          </p>
          <Link href="/dashboard/requests" className="inline-block pt-2">
            <Button className="font-bold">Submit Your First Request</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Requests */}
          <div className="bg-white border border-border rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-charcoal">Recent Requests</h3>
              <Link href="/dashboard/requests" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                View All <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {recentRequests.map((req) => (
                <div key={req.id} className="flex justify-between items-center border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                  <div>
                    <h4 className="font-bold text-sm text-charcoal">{req.projectName}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{req.city}, {req.country}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getStatusColor(req.status)}`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white border border-border rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-charcoal">Recent Reports</h3>
              <Link href="/dashboard/reports" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                View All <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {recentReports.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No reports published yet.</p>
              ) : (
                recentReports.map((rep) => (
                  <div key={rep.reportId} className="flex justify-between items-center border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                    <div>
                      <h4 className="font-bold text-sm text-charcoal">{rep.projectName}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(rep.date).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getAssessmentColor(rep.assessmentStatus)}`}>
                        {rep.assessmentStatus.replace("_", " ")}
                      </span>
                      <Link href={`/dashboard/reports/${rep.reportId}`}>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
