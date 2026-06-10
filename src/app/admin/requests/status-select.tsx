"use client";

import { useState } from "react";
import { updateRequestStatus } from "@/lib/actions";
import { RequestStatus } from "@prisma/client";

interface StatusSelectProps {
  requestId: string;
  currentStatus: RequestStatus;
}

export default function StatusSelect({ requestId, currentStatus }: StatusSelectProps) {
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
      disabled={loading}
      className="bg-white border border-border rounded-md px-2.5 py-1.5 text-xs font-semibold text-charcoal focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 cursor-pointer"
    >
      <option value="SUBMITTED">Submitted</option>
      <option value="IN_PROGRESS">In Progress</option>
      <option value="REPORT_READY">Report Ready</option>
      <option value="COMPLETED">Completed</option>
    </select>
  );
}
