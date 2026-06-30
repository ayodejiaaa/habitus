"use client";

import React, { useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InspectionRequestSchema } from "@/lib/schemas";
import { createInspectionRequest } from "@/lib/actions";
import { Button } from "./ui/button";
import { X, Plus, ClipboardList, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  isActive: boolean;
}

interface RequestInspectionDialogProps {
  services: ServiceItem[];
}

export default function RequestInspectionDialog({ services }: RequestInspectionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step states: "service" | "details" | "payment" | "processing" | "success"
  const [step, setStep] = useState<"service" | "details" | "payment" | "processing" | "success">("service");
  const [paymentStatusText, setPaymentStatusText] = useState("Securing connection...");

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(InspectionRequestSchema),
    defaultValues: {
      serviceId: "",
      projectName: "",
      propertyAddress: "",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
      propertyType: "" as any,
      stage: "" as any,
      siteContactName: "",
      siteContactPhone: "",
      notes: "",
      specialInstructions: "",
    },
  });

  const serviceId = watch("serviceId");
  const selectedService = services.find((s) => s.id === serviceId);

  const handleProceedToPayment = async (e: React.MouseEvent) => {
    e.preventDefault();
    const isValid = await trigger([
      "projectName",
      "propertyAddress",
      "city",
      "state",
      "country",
      "propertyType",
      "stage",
      "siteContactName",
      "siteContactPhone"
    ]);
    if (isValid) {
      setStep("payment");
    }
  };

  const handlePaystackCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Trigger validation on ALL fields first!
    const isFormValid = await trigger();
    if (!isFormValid) {
      setError("Please check your request details. Some fields are invalid or missing.");
      setStep("details"); // Go back to details page to show validation errors
      return;
    }

    setIsLoading(true);
    setStep("processing");
    setPaymentStatusText("Initializing payment session...");

    try {
      const formValues = getValues();
      const res = await createInspectionRequest(formValues);

      if (res.error) {
        setIsLoading(false);
        setError(res.error);
        setStep("payment");
      } else if (res.reference && res.email && res.amount && res.publicKey && window.PaystackPop) {
        setPaymentStatusText("Opening payment popup...");
        try {
          const paystack = new window.PaystackPop();
          paystack.newTransaction({
            key: res.publicKey,
            email: res.email,
            amount: res.amount,
            ref: res.reference,
            onSuccess: (transaction: any) => {
              setPaymentStatusText("Verifying transaction...");
              setIsLoading(true);
              setStep("processing");
              window.location.href = `/api/payment/verify?reference=${transaction.reference}`;
            },
            onCancel: () => {
              setIsLoading(false);
              setStep("payment");
              setError("Payment was cancelled. You can complete the checkout process later.");
            }
          });
        } catch (popupErr: any) {
          console.error("Paystack inline popup execution failed, falling back to redirect:", popupErr);
          if (res.authorizationUrl) {
            window.location.href = res.authorizationUrl;
          } else {
            setIsLoading(false);
            setError("Could not load Paystack checkout page.");
            setStep("payment");
          }
        }
      } else if (res.authorizationUrl) {
        setPaymentStatusText("Redirecting to Paystack secure checkout...");
        window.location.href = res.authorizationUrl;
      } else {
        setIsLoading(false);
        setError("Invalid response from server action.");
        setStep("payment");
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || "Payment submission failed.");
      setStep("payment");
    }
  };

  const handleClose = () => {
    if (!isLoading && step !== "processing") {
      setIsOpen(false);
      setStep("service");
      setError(null);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="font-bold flex items-center gap-2">
        <Plus className="h-4 w-4" /> Request Inspection
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-xs" 
            onClick={handleClose}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl z-10 animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
              <div className="flex items-center space-x-2 text-primary">
                <ClipboardList className="h-5 w-5" />
                <h3 className="text-lg font-bold text-charcoal">
                  {step === "service" && "Select Inspection Type"}
                  {step === "details" && "New Inspection Request"}
                  {step === "payment" && "Secure Checkout"}
                  {step === "processing" && "Processing Payment"}
                  {step === "success" && "Request Confirmed"}
                </h3>
              </div>
              <button 
                onClick={handleClose}
                disabled={isLoading || step === "processing"}
                className="text-gray-400 hover:text-charcoal p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step: Processing */}
            {step === "processing" && (
              <div className="py-12 flex flex-col items-center justify-center space-y-6">
                <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="text-center space-y-2">
                  <h4 className="font-bold text-charcoal">Processing Transaction</h4>
                  <p className="text-sm text-gray-500 animate-pulse">{paymentStatusText}</p>
                </div>
              </div>
            )}

            {/* Step: Success */}
            {step === "success" && (
              <div className="py-8 flex flex-col items-center text-center space-y-6">
                <div className="h-16 w-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center animate-bounce">
                  <ClipboardList className="h-8 w-8" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h4 className="text-xl font-black text-charcoal">Payment Approved!</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Your inspection request has been submitted successfully. We have processed your fee of **₦{selectedService ? selectedService.price.toLocaleString() : "350,000"}**. 
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    A verification auditor has been assigned to your Lagos property. You can monitor progress under the Requests tab.
                  </p>
                </div>
                <Button onClick={() => { setIsOpen(false); setStep("service"); }} className="font-bold px-8">
                  Done
                </Button>
              </div>
            )}

            {/* Step: Service Selection */}
            <div className={cn("space-y-6", step !== "service" && "hidden")}>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Choose an Inspection Phase</h4>
                  <p className="text-xs text-gray-500">
                    Select the verification service that matches your project's current construction phase. Only active services can be ordered.
                  </p>
                </div>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {services.map((service) => {
                    const isActive = service.isActive;
                    const isSelected = serviceId === service.id;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        disabled={!isActive}
                        onClick={() => setValue("serviceId", service.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                          !isActive 
                            ? "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed" 
                            : isSelected 
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border bg-white hover:bg-gray-50 cursor-pointer"
                        }`}
                      >
                        <div className="mt-1">
                          {isActive ? (
                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${isSelected ? "border-primary text-primary" : "border-gray-300"}`}>
                              {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
                            </div>
                          ) : (
                            <Lock className="h-3.5 w-3.5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-center gap-2">
                            <span className={`font-bold text-sm ${isSelected ? "text-primary" : "text-charcoal"}`}>
                              {service.name}
                            </span>
                            {!isActive && (
                              <span className="bg-gray-100 text-gray-500 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-gray-200">
                                Coming Soon
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {service.description}
                          </p>
                          {isActive && (
                            <span className="text-xs font-semibold text-charcoal block pt-1">
                              ₦{service.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {errors.serviceId && (
                  <p className="text-red-500 text-xs">{errors.serviceId.message as string}</p>
                )}

                <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={async () => {
                      const isValid = await trigger("serviceId");
                      if (isValid) {
                        setStep("details");
                      }
                    }} 
                    className="font-bold"
                  >
                    Continue to Details
                  </Button>
                </div>
              </div>

            {/* Step: Details Form */}
            <div className={cn(step !== "details" && "hidden")}>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded border border-red-200">
                    {error}
                  </div>
                )}

                {/* Service Notice */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start space-x-3">
                  <span className="text-accent text-lg leading-none">📍</span>
                  <div>
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wide">Lagos, Nigeria Launch Notice</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      We currently only verify properties located in Lagos, Nigeria. More cities coming soon!
                    </p>
                  </div>
                </div>

                {/* SECTION: Project Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Project Information</h4>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500">Project Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Lekki Heights Villa"
                      disabled={isLoading}
                      className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                      {...register("projectName")}
                    />
                    {errors.projectName && (
                      <p className="text-red-500 text-xs mt-0.5">{errors.projectName.message as string}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500">Property Address</label>
                    <input
                      type="text"
                      placeholder="Plot 45, phase II, Lekki Peninsula"
                      disabled={isLoading}
                      className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                      {...register("propertyAddress")}
                    />
                    {errors.propertyAddress && (
                      <p className="text-red-500 text-xs mt-0.5">{errors.propertyAddress.message as string}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-gray-500">City</label>
                      <select
                        disabled={isLoading}
                        className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                        {...register("city")}
                      >
                        <option value="Lagos">Lagos</option>
                      </select>
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.city.message as string}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-gray-500">State / Region</label>
                      <input
                        type="text"
                        placeholder="Lagos"
                        readOnly
                        disabled={isLoading}
                        className="w-full bg-gray-50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none disabled:opacity-50 cursor-not-allowed"
                        {...register("state")}
                      />
                      {errors.state && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.state.message as string}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-gray-500">Country</label>
                      <input
                        type="text"
                        placeholder="Nigeria"
                        readOnly
                        disabled={isLoading}
                        className="w-full bg-gray-50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none disabled:opacity-50 cursor-not-allowed"
                        {...register("country")}
                      />
                      {errors.country && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.country.message as string}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECTION: Details */}
                <div className="space-y-4 border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Project Details</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-gray-500">Property Type</label>
                      <select
                        disabled={isLoading}
                        className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                        {...register("propertyType")}
                      >
                        <option value="">Select Property Type</option>
                        <option value="Residential">Residential</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.propertyType && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.propertyType.message as string}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-gray-500">Current Stage</label>
                      <select
                        disabled={isLoading}
                        className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                        {...register("stage")}
                      >
                        <option value="">Select Current Stage</option>
                        <option value="FOUNDATION">Foundation</option>
                        <option value="STRUCTURE">Structure</option>
                        <option value="ROOFING">Roofing</option>
                        <option value="FINISHING">Finishing</option>
                        <option value="OTHER">Other</option>
                      </select>
                      {errors.stage && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.stage.message as string}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECTION: Site Contact */}
                <div className="space-y-4 border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Site Contact</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-gray-500">Site Contact Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Samuel (Contractor)"
                        disabled={isLoading}
                        className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                        {...register("siteContactName")}
                      />
                      {errors.siteContactName && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.siteContactName.message as string}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-gray-500">Contact Phone Number</label>
                      <input
                        type="text"
                        placeholder="+234 80 1234 5678"
                        disabled={isLoading}
                        className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                        {...register("siteContactPhone")}
                      />
                      {errors.siteContactPhone && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.siteContactPhone.message as string}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECTION: Additional */}
                <div className="space-y-4 border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Additional Information</h4>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500">Notes (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="Provide context about the property size, scope, or contractor details..."
                      disabled={isLoading}
                      className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none disabled:opacity-50"
                      {...register("notes")}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500">Special Instructions (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Check foundation depth, inspect brick quality, take video of the back fence..."
                      disabled={isLoading}
                      className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none disabled:opacity-50"
                      {...register("specialInstructions")}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isLoading}
                    onClick={() => setStep("service")}
                  >
                    Back
                  </Button>
                  <Button type="button" onClick={handleProceedToPayment} className="font-bold flex items-center gap-1.5">
                    Proceed to Payment (₦{selectedService ? selectedService.price.toLocaleString() : "350,000"})
                  </Button>
                </div>
              </form>
            </div>

            {/* Step: Payment Gateway Checkout */}
            <div className={cn(step !== "payment" && "hidden")}>
              <form onSubmit={handlePaystackCheckout} className="space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded border border-red-200">
                    {error}
                  </div>
                )}

                {/* Order Summary */}
                <div className="bg-gray-50 border border-border rounded-lg p-5 space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Summary</h4>
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-charcoal">{selectedService ? selectedService.name : "Construction Verification Inspection"}</span>
                    <span className="text-primary text-base">₦{selectedService ? selectedService.price.toLocaleString() : "350,000"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 pt-2">
                    <span>Lagos Launch Verification Service</span>
                    <span>$250.00 USD equivalent</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-xs text-blue-800 space-y-2">
                  <h5 className="font-bold text-blue-900 uppercase tracking-wider">Secure Payment via Paystack</h5>
                  <p className="leading-relaxed">
                    You will be redirected to Paystack's secure checkout page to complete your payment. We support cards, bank transfers, USSD, and mobile money.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("details")}
                  >
                    Back to Details
                  </Button>
                  <Button type="submit" className="font-bold flex items-center gap-1.5">
                    Pay ₦{selectedService ? selectedService.price.toLocaleString() : "350,000"} via Paystack
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
    </>
  );
}
