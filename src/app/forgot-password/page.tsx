"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MailOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);

    // Mock reset action
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white border border-border p-8 rounded-2xl shadow-md">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MailOpen className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-charcoal">Reset Password</h2>
            <p className="text-sm text-gray-500">
              Enter your email and we'll send you instructions to reset your password.
            </p>
          </div>

          {success ? (
            <div className="space-y-4 text-center">
              <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-4 rounded border border-emerald-200 leading-relaxed">
                If an account matches <strong className="text-primary">{email}</strong>, we have sent instructions to reset your password. Please check your inbox and spam folders.
              </div>
              <div className="pt-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Return to Log In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500">Email Address</label>
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  placeholder="client@habitus.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full font-bold pt-2.5 pb-2.5">
                {isLoading ? "Sending Instructions..." : "Send Reset Link"}
              </Button>
            </form>
          )}

          <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
            Remember your password?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
