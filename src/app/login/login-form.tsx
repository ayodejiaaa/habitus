"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/lib/schemas";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { KeyRound, Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If redirect path is specified in URL (e.g. from middleware), redirect back there
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email address or password.");
        setIsLoading(false);
      } else {
        // Redirect to dashboard (or callbackUrl) and trigger hard reload to refresh auth state
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white border border-border p-8 rounded-2xl shadow-md">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-charcoal">Welcome Back</h2>
          <p className="text-sm text-gray-500">
            Log in to manage your inspection requests and view reports.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase text-gray-500">Email Address</label>
            </div>
            <input
              type="email"
              disabled={isLoading}
              placeholder="client@habitus.africa"
              className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-0.5">{errors.email.message as string}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase text-gray-500">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full bg-white border border-border rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-charcoal focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-0.5">{errors.password.message as string}</p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full font-bold pt-2.5 pb-2.5">
            {isLoading ? "Logging In..." : "Log In"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <span className="relative bg-white px-3 text-xs text-gray-400 font-bold uppercase">
            Or continue with
          </span>
        </div>

        {/* Google Button */}
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={handleGoogleLogin}
          className="w-full border border-border bg-white hover:bg-gray-50 text-charcoal flex items-center justify-center gap-2"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Google</span>
        </Button>

        {/* Footer redirects */}
        <div className="text-center text-xs text-gray-500">
          Don't have an account?{" "}
          <Link href="/register" className="font-bold text-primary hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
