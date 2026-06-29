import type { Metadata } from "next";
import React from "react";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/security";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { auth } from "@/auth";
import VerificationClient from "./verification-client";

interface PageProps {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: "Verify Email",
};

export default async function VerifyEmailTokenPage({ params }: PageProps) {
  const { token } = await params;
  const tokenHash = hashToken(token);

  let initialStatus: "EXPIRED" | "INVALID" | "ALREADY_VERIFIED" | undefined;

  try {
    const dbToken = await db.verificationToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            emailVerified: true,
          }
        }
      },
    });

    if (!dbToken) {
      initialStatus = "INVALID";
    } else if (dbToken.user.emailVerified || dbToken.usedAt) {
      initialStatus = "ALREADY_VERIFIED";
    } else if (dbToken.expiresAt < new Date()) {
      initialStatus = "EXPIRED";
    }
  } catch (error) {
    console.error("Token verification preflight database error:", error);
    initialStatus = "INVALID";
  }

  // Check login state to render the proper resend / login button if expired
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <Navbar />
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <VerificationClient 
          token={token} 
          isLoggedIn={isLoggedIn} 
          initialStatus={initialStatus} 
        />
      </div>
      <Footer />
    </div>
  );
}
