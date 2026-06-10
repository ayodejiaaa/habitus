import React from "react";
import ForgotForm from "./forgot-form";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <Navbar />
      <div className="flex-1 flex flex-col justify-center">
        <ForgotForm />
      </div>
      <Footer />
    </div>
  );
}
