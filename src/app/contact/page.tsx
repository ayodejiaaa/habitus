"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !message) {
      setErrorMessage("All fields are required.");
      return;
    }
    setErrorMessage("");
    setStatus("submitting");

    try {
      // Simulate API delivery
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus("success");
      setFirstName("");
      setLastName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMessage("An error occurred while sending your message. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Title Header */}
      <section className="bg-brand-bg py-16 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h1 className="text-4xl font-extrabold text-charcoal">Contact Us</h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-lg mx-auto">
            Have questions about our inspection coverage or need support with an ongoing audit? We are here to help.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Details */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold text-charcoal">Get in Touch</h2>
                <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                  Our customer support team works to keep you connected with your inspectors and resolve any billing, request, or technical inquiries.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-charcoal">Email Support</h4>
                    <p className="text-sm text-gray-500">contact@habitus.africa</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-charcoal">Phone Enquiry</h4>
                    <p className="text-sm text-gray-500">+234 708 056 5000</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-charcoal">Mailing Address</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      43B Emina Crescent, off Toyin Street, Ikeja, Lagos, Nigeria.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-brand-bg rounded-2xl border border-border p-6 sm:p-8 shadow-sm transition-all duration-300">
              {status === "success" ? (
                <div className="flex flex-col items-center justify-center text-center py-10 space-y-4 animate-in fade-in zoom-in duration-300">
                  <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-charcoal">Message Sent Successfully!</h3>
                    <p className="text-sm text-gray-500 max-w-sm">
                      Your message has been delivered to <span className="font-semibold text-charcoal">contact@habitus.africa</span>. We will review it and get back to you shortly.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStatus("idle")}
                    className="mt-2 font-bold"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded border border-red-100 animate-in fade-in duration-200">
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-gray-500">First Name</label>
                      <input
                        type="text"
                        required
                        disabled={status === "submitting"}
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-gray-500">Last Name</label>
                      <input
                        type="text"
                        required
                        disabled={status === "submitting"}
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500">Email Address</label>
                    <input
                      type="email"
                      required
                      disabled={status === "submitting"}
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500">Message</label>
                    <textarea
                      rows={4}
                      required
                      disabled={status === "submitting"}
                      placeholder="Describe your request or property details..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none disabled:opacity-50"
                    />
                  </div>

                  <Button type="submit" disabled={status === "submitting"} className="w-full font-bold">
                    {status === "submitting" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin animate-infinite" />
                        Sending Message...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
