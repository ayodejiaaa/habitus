import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import RequestInspectionDialog from "@/components/RequestInspectionDialog";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, User, Calendar, Info } from "lucide-react";

export default async function RequestsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Query requests
  const requests = await db.inspectionRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "IN_PROGRESS":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "REPORT_READY":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "COMPLETED":
        return "bg-gray-50 text-gray-700 border-gray-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-3xl font-black text-charcoal">Inspection Requests</h1>
          <p className="text-sm text-gray-500">Submit new sites for independent audit and view ongoing requests.</p>
        </div>
        <RequestInspectionDialog />
      </div>

      {/* Requests Feed */}
      {requests.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center space-y-4 max-w-lg mx-auto">
          <Info className="h-10 w-10 text-gray-300 mx-auto" />
          <h3 className="font-bold text-lg text-charcoal">No requests found</h3>
          <p className="text-sm text-gray-500">
            Submit a new construction inspection request above to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((req) => (
            <Card key={req.id} className="hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
              {/* Badge */}
              <div className="p-6 pb-4 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-charcoal">{req.projectName}</h3>
                  <div className="flex items-center space-x-1 text-xs text-gray-400 mt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Submitted {new Date(req.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStatusColor(req.status)}`}>
                  {req.status}
                </span>
              </div>

              <CardContent className="space-y-4 text-sm">
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

                <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4 text-xs font-semibold text-gray-500">
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 block mb-0.5">Property Type</span>
                    <span className="text-charcoal text-sm">{req.propertyType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 block mb-0.5">Construction Stage</span>
                    <span className="text-charcoal text-sm capitalize">{req.stage.toLowerCase()}</span>
                  </div>
                </div>

                {req.notes && (
                  <div className="bg-gray-50 rounded p-3 text-xs text-gray-500 leading-relaxed">
                    <span className="font-bold text-[10px] uppercase text-gray-400 block mb-1">Notes</span>
                    {req.notes}
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
