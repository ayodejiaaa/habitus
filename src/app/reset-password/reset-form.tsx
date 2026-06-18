"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";
import { resetPassword } from "@/lib/auth-actions";

interface ResetFormProps {
  token: string;
}

export default function ResetForm({ token }: ResetFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "Very Weak", color: "bg-gray-200" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    
    if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 3) return { score, label: "Medium", color: "bg-amber-500" };
    return { score, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least 1 uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least 1 lowercase letter.");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least 1 number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await resetPassword(token, { password, confirmPassword });
      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      } else {
        setSuccess(true);
        setIsLoading(false);
        // Redirect after a brief delay
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
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
              Password updated successfully. Redirecting to login...
            </div>
            <div className="pt-2">
              <Link href="/login">
                <Button className="w-full font-bold">
                  Go to Log In
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
              
              {password && (
                <div className="space-y-1.5 pt-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-500 font-medium">Strength:</span>
                    <span className={`font-bold ${
                      strength.score <= 1 ? "text-red-500" : strength.score <= 3 ? "text-amber-500" : "text-emerald-500"
                    }`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${strength.color} transition-all duration-300`} 
                      style={{ width: `${(strength.score / 4) * 100}%` }}
                    />
                  </div>
                  <ul className="text-[10px] text-gray-400 space-y-0.5 pt-1">
                    <li className={password.length >= 8 ? "text-emerald-600 font-semibold" : ""}>✓ Minimum 8 characters</li>
                    <li className={/[A-Z]/.test(password) ? "text-emerald-600 font-semibold" : ""}>✓ At least 1 uppercase letter</li>
                    <li className={/[a-z]/.test(password) ? "text-emerald-600 font-semibold" : ""}>✓ At least 1 lowercase letter</li>
                    <li className={/[0-9]/.test(password) ? "text-emerald-600 font-semibold" : ""}>✓ At least 1 number</li>
                  </ul>
                </div>
              )}
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
