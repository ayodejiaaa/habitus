import React from "react";
import RegisterForm from "./register-form";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <Navbar />
      <div className="flex-1 flex flex-col justify-center">
        <RegisterForm />
      </div>
      <Footer />
    </div>
  );
}
