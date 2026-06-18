import type { Metadata } from "next";
import React from "react";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/security";
import ResetForm from "../reset-form";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface PageProps {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: "Reset Password",
};

export default async function ResetPasswordTokenPage({ params }: PageProps) {
  const { token } = await params;
  const tokenHash = hashToken(token);

  let isValid = false;

  try {
    const dbToken = await db.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (dbToken && !dbToken.usedAt && dbToken.expiresAt > new Date()) {
      isValid = true;
    }
  } catch (error) {
    console.error("Token verification database error:", error);
    // In case database is offline (like in build/seeding fallback mode), we proceed with invalid state
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <Navbar />
      <div className="flex-1 flex flex-col justify-center">
        {isValid ? (
          <ResetForm token={token} />
        ) : (
          <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 bg-white border border-border p-8 rounded-2xl shadow-md text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 border border-red-100">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-charcoal font-sans">Link Invalid or Expired</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  This password reset link is invalid or has expired.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/forgot-password">
                  <Button className="w-full font-bold">
                    Request a new link
                  </Button>
                </Link>
              </div>
            </div>
          </main>
        )}
      </div>
      <Footer />
    </div>
  );
}
