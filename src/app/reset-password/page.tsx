import React from "react";
import ResetForm from "./reset-form";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <Navbar />
      <div className="flex-1 flex flex-col justify-center">
        <ResetForm />
      </div>
      <Footer />
    </div>
  );
}
