"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";

export default function ResetForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    // Mock reset action
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
    }, 1200);
  };

  return (
    <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white border border-border p-8 rounded-2xl shadow-md">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-charcoal">Set New Password</h2>
          <p className="text-sm text-gray-500">
            Create a new secure password for your account.
          </p>
        </div>

        {success ? (
          <div className="space-y-4 text-center">
            <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-4 rounded border border-emerald-200">
              Your password has been successfully updated!
            </div>
            <div className="pt-2">
              <Link href="/login">
                <Button className="w-full font-bold">
                  Log In with New Password
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500">New Password</label>
              <input
                type="password"
                required
                disabled={isLoading}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500">Confirm New Password</label>
              <input
                type="password"
                required
                disabled={isLoading}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full font-bold pt-2.5 pb-2.5">
              {isLoading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
