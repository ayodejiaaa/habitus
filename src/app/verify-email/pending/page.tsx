import type { Metadata } from "next";
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PendingForm from "./pending-form";
import { MailOpen } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Verify Email",
};

export default async function VerifyEmailPendingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // If already verified in the DB, send to dashboard directly
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true },
  });

  if (user?.emailVerified) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 bg-white border border-border p-8 rounded-2xl shadow-md">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MailOpen className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-charcoal font-sans">Verify Your Email</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                We've sent a verification link to your email address. Please check your inbox (and spam folder) to activate your account.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <PendingForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}

