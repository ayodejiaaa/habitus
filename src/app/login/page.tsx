import React, { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-charcoal font-semibold">
          <div className="animate-pulse text-primary text-lg">Loading secure portal...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
