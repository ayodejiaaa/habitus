"use client";

import { useState } from "react";
import { updateRequestStatus } from "@/lib/actions";
import { RequestStatus } from "@prisma/client";

interface StatusSelectProps {
  requestId: string;
  currentStatus: RequestStatus;
  isReportIssued?: boolean;
}

export default function StatusSelect({ requestId, currentStatus, isReportIssued = false }: StatusSelectProps) {
  const [status, setStatus] = useState<RequestStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as RequestStatus;
    setLoading(true);
    const res = await updateRequestStatus(requestId, nextStatus);
    setLoading(false);
    if (!res.error) {
      setStatus(nextStatus);
    } else {
      alert(res.error);
    }
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={loading || isReportIssued}
      className="bg-white border border-border rounded-md px-2.5 py-1.5 text-xs font-semibold text-charcoal focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      <option value="PENDING_PAYMENT" disabled>Pending Payment</option>
      <option value="PAYMENT_VERIFIED" disabled>Payment Verified</option>
      <option value="INSPECTION_SCHEDULED">Inspection Scheduled</option>
      <option value="IN_PROGRESS">In Progress</option>
      <option value="COMPLETED">Completed</option>
      <option value="ISSUED">Report Issued</option>
    </select>
  );
}
