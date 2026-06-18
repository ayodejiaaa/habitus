import type { Metadata } from "next";
import React from "react";
import { db } from "@/lib/db";
import { hashToken, logSecurity } from "@/lib/security";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import PendingForm from "../pending/pending-form";
import { auth } from "@/auth";

interface PageProps {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: "Verify Email",
};

export default async function VerifyEmailTokenPage({ params }: PageProps) {
  const { token } = await params;
  const tokenHash = hashToken(token);

  let success = false;
  let userEmail = "unknown";

  try {
    const dbToken = await db.verificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (dbToken && !dbToken.usedAt && dbToken.expiresAt > new Date()) {
      const user = dbToken.user;
      userEmail = user.email;

      // Invalidate all tokens and mark email verified in a transaction
      await db.$transaction([
        db.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        }),
        db.verificationToken.update({
          where: { id: dbToken.id },
          data: { usedAt: new Date() },
        }),
        db.verificationToken.updateMany({
          where: {
            userId: user.id,
            id: { not: dbToken.id },
            usedAt: null,
          },
          data: { usedAt: new Date() },
        }),
      ]);

      logSecurity("VERIFICATION_SUCCESSFUL", {
        email: user.email,
        tokenId: dbToken.id,
      });

      success = true;
    } else {
      logSecurity("VERIFICATION_FAILED", {
        email: dbToken?.user?.email || "unknown",
        reason: "Invalid, used, or expired token",
      });
    }
  } catch (error) {
    console.error("Token verification database error:", error);
  }

  // Check login state to render the proper resend / login button if expired
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <Navbar />
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        {success ? (
          <div className="max-w-md w-full mx-auto space-y-6 bg-white border border-border p-8 rounded-2xl shadow-md text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-charcoal font-sans">Email Verified</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your account has been activated successfully. You now have full access to your Habitus dashboard.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/dashboard">
                <Button className="w-full font-bold flex items-center justify-center gap-2">
                  Continue to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-md w-full mx-auto space-y-6 bg-white border border-border p-8 rounded-2xl shadow-md text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 border border-red-100">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-charcoal font-sans">Link Expired</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                This verification link is invalid or has expired.
              </p>
            </div>
            
            {isLoggedIn ? (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-4 text-center">
                  Request a new verification link below:
                </p>
                <PendingForm />
              </div>
            ) : (
              <div className="pt-2">
                <Link href="/login">
                  <Button className="w-full font-bold">
                    Log In to Resend Link
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
