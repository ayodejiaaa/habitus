"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertOctagon, RotateCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-white border border-red-100 rounded-xl p-8 max-w-xl mx-auto my-12 text-center space-y-6 shadow-sm">
      <div className="mx-auto w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
        <AlertOctagon className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-charcoal">Something went wrong</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          We encountered an error loading this page. This is likely due to a database connection failure. Please make sure your database server is running.
        </p>
        {error.message && (
          <pre className="text-[10px] bg-red-50 text-red-800 p-3 rounded font-mono text-left overflow-x-auto max-h-32 mt-2">
            {error.message}
          </pre>
        )}
      </div>
      <div className="flex justify-center">
        <Button
          onClick={() => reset()}
          className="font-bold flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white"
        >
          <RotateCw className="h-4 w-4" /> Try Again
        </Button>
      </div>
    </div>
  );
}
