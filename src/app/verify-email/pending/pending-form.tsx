"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, LogOut, Loader2, CheckCircle2 } from "lucide-react";
import { resendVerificationEmail, logoutUser } from "@/lib/actions";

export default function PendingForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleResend = async () => {
    setStatus("sending");
    setMessage("");

    try {
      const res = await resendVerificationEmail();
      if (res?.error) {
        setStatus("error");
        setMessage(res.error);
      } else {
        setStatus("success");
        setMessage(res?.success || "Verification email resent successfully.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("An unexpected error occurred. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {status === "success" && (
        <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-4 rounded border border-emerald-100 flex items-start gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-50 text-red-700 text-xs font-semibold p-4 rounded border border-red-100 animate-in fade-in duration-200">
          {message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          onClick={handleResend}
          disabled={status === "sending"}
          className="flex-1 font-bold flex items-center justify-center gap-2"
        >
          {status === "sending" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Resending...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Resend Email
            </>
          )}
        </Button>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="font-bold flex items-center justify-center gap-2 border border-border bg-white text-charcoal hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
