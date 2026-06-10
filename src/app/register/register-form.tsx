"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "@/lib/schemas";
import { registerUser } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const res = await registerUser(data);

    setIsLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(res.success || "Account created successfully!");
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white border border-border p-8 rounded-2xl shadow-md">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-charcoal">Create your Account</h2>
          <p className="text-sm text-gray-500">
            Join Habitus and verify your ongoing projects back home.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-700 text-xs font-semibold p-3 rounded border border-emerald-200">
              {success}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-500">Full Name</label>
            <input
              type="text"
              disabled={isLoading}
              placeholder="Chidi Okafor"
              className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-0.5">{errors.name.message as string}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-500">Email Address</label>
            <input
              type="email"
              disabled={isLoading}
              placeholder="client@habitus.com"
              className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-0.5">{errors.email.message as string}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-500">Password</label>
            <input
              type="password"
              disabled={isLoading}
              placeholder="••••••••"
              className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-0.5">{errors.password.message as string}</p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full font-bold pt-2.5 pb-2.5">
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        {/* Footer redirects */}
        <div className="text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </main>
  );
}
