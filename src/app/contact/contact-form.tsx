"use client";

import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { submitContactForm } from "@/lib/actions";

export default function ContactForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !message) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }
    setErrorMessage("");
    setStatus("submitting");

    try {
      const res = await submitContactForm({ 
        firstName, 
        lastName, 
        email, 
        whatsapp: whatsapp || undefined, 
        message 
      });
      if (res?.error) {
        setStatus("error");
        setErrorMessage(res.error);
      } else {
        setStatus("success");
        setFirstName("");
        setLastName("");
        setEmail("");
        setWhatsapp("");
        setMessage("");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("An error occurred while sending your message. Please try again.");
    }
  };

  return (
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
            <label className="text-xs font-bold uppercase text-gray-500">WhatsApp Phone Number (Optional)</label>
            <input
              type="tel"
              disabled={status === "submitting"}
              placeholder="+234..."
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
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
  );
}
