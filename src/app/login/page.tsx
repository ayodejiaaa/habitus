import type { Metadata } from "next";
import React, { Suspense } from "react";
import LoginForm from "./login-form";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <Navbar />
      <div className="flex-1 flex flex-col justify-center">
        <Suspense
          fallback={
            <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-charcoal font-semibold">
              <div className="animate-pulse text-primary text-lg">Loading secure portal...</div>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
