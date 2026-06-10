import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white border border-border p-8 rounded-2xl shadow-md text-center">
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-black text-charcoal">Email Verified!</h2>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Your email address has been successfully verified. You can now access all client dashboard features.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/dashboard">
              <Button className="w-full font-bold">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
