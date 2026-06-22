import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, KeyRound } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface SecurityErrorPageProps {
  type: "UNAUTHENTICATED" | "UNAUTHORIZED";
}

export default function SecurityErrorPage({ type }: SecurityErrorPageProps) {
  const isAuth = type === "UNAUTHENTICATED";
  
  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 bg-white border border-border p-8 rounded-2xl shadow-md text-center">
          <div className={`inline-flex h-16 w-16 items-center justify-center rounded-full border shadow-sm ${
            isAuth 
              ? "bg-amber-50 text-amber-600 border-amber-100" 
              : "bg-red-50 text-red-500 border-red-100"
          }`}>
            {isAuth ? <KeyRound className="h-8 w-8" /> : <ShieldAlert className="h-8 w-8" />}
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-charcoal font-sans">
              {isAuth ? "Authentication Required" : "Access Denied"}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {isAuth 
                ? "You must be signed in to access this resource." 
                : "You do not have permission to access this resource."}
            </p>
          </div>
          
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            {isAuth ? (
              <>
                <Link href="/login" className="flex-1">
                  <Button className="w-full font-bold">Go to Login</Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full font-bold border border-border bg-white text-charcoal hover:bg-gray-50">
                    Return Home
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="flex-1">
                  <Button className="w-full font-bold">Return to Dashboard</Button>
                </Link>
                <Link href="/contact" className="flex-1">
                  <Button variant="outline" className="w-full font-bold border border-border bg-white text-charcoal hover:bg-gray-50">
                    Contact Support
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
