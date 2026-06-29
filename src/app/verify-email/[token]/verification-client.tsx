"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PendingForm from "../pending/pending-form";
import { verifyEmailToken } from "@/lib/auth-actions";

interface VerificationClientProps {
  token: string;
  isLoggedIn: boolean;
  initialStatus?: "EXPIRED" | "INVALID" | "ALREADY_VERIFIED";
}

export default function VerificationClient({ token, isLoggedIn, initialStatus }: VerificationClientProps) {
  const [status, setStatus] = useState<"LOADING" | "SUCCESS" | "EXPIRED" | "ALREADY_VERIFIED" | "INVALID" | "ERROR">(
    initialStatus || "LOADING"
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // If we already resolved to a terminal state on the server, don't execute POST
    if (initialStatus) {
      return;
    }

    let isMounted = true;

    async function triggerVerification() {
      try {
        const res = await verifyEmailToken(token);
        if (!isMounted) return;

        if (res.status === "SUCCESS") {
          setStatus("SUCCESS");
        } else if (res.status === "ALREADY_VERIFIED") {
          setStatus("ALREADY_VERIFIED");
        } else if (res.status === "EXPIRED") {
          setStatus("EXPIRED");
        } else if (res.status === "INVALID") {
          setStatus("INVALID");
        } else {
          setStatus("ERROR");
          setErrorMsg(res.error || "Verification failed.");
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Verification execution error:", err);
        setStatus("ERROR");
        setErrorMsg("Something went wrong. Please try again.");
      }
    }

    // Delay slightly to give visual feedback of the auto-verification trigger
    const timer = setTimeout(() => {
      triggerVerification();
    }, 800);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [token, initialStatus]);

  // LOADING State
  if (status === "LOADING") {
    return (
      <div className="max-w-md w-full mx-auto space-y-6 bg-white border border-border p-8 rounded-2xl shadow-md text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-primary border border-primary/10 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-charcoal font-sans">Verifying...</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Please wait while we confirm your email address. This will take only a second.
          </p>
        </div>
      </div>
    );
  }

  // SUCCESS State
  if (status === "SUCCESS") {
    return (
      <div className="max-w-md w-full mx-auto space-y-6 bg-white border border-border p-8 rounded-2xl shadow-md text-center animate-fadeIn">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm animate-bounce">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-charcoal font-sans">Email Verified</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your email has been successfully verified! You now have full access to the Habitus platform.
          </p>
        </div>
        <div className="pt-2">
          <Link href={isLoggedIn ? "/dashboard" : "/login"}>
            <Button className="w-full font-bold flex items-center justify-center gap-2">
              {isLoggedIn ? "Continue to Dashboard" : "Sign In to Dashboard"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ALREADY VERIFIED State
  if (status === "ALREADY_VERIFIED") {
    return (
      <div className="max-w-md w-full mx-auto space-y-6 bg-white border border-border p-8 rounded-2xl shadow-md text-center animate-fadeIn">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-charcoal font-sans">Already Verified</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your email address has already been verified.
          </p>
        </div>
        <div className="pt-2">
          <Link href={isLoggedIn ? "/dashboard" : "/login"}>
            <Button className="w-full font-bold flex items-center justify-center gap-2">
              {isLoggedIn ? "Continue to Dashboard" : "Sign In to Dashboard"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // EXPIRED State
  if (status === "EXPIRED") {
    return (
      <div className="max-w-md w-full mx-auto space-y-6 bg-white border border-border p-8 rounded-2xl shadow-md text-center animate-fadeIn">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 border border-red-100">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-charcoal font-sans">Link Expired</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            This verification link has expired.
          </p>
        </div>
        {isLoggedIn ? (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-4">Request a new verification link below:</p>
            <PendingForm />
          </div>
        ) : (
          <div className="pt-2">
            <Link href="/login">
              <Button className="w-full font-bold">Log In to Resend Link</Button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  // INVALID / ERROR / OTHER State
  return (
    <div className="max-w-md w-full mx-auto space-y-6 bg-white border border-border p-8 rounded-2xl shadow-md text-center animate-fadeIn">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 border border-red-100">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-charcoal font-sans">Invalid Link</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          {errorMsg || "This verification link is invalid or has expired."}
        </p>
      </div>
      {isLoggedIn ? (
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-4">Request a new verification link below:</p>
          <PendingForm />
        </div>
      ) : (
        <div className="pt-2">
          <Link href="/login">
            <Button className="w-full font-bold">Log In to Resend Link</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
