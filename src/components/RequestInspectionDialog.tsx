"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InspectionRequestSchema } from "@/lib/schemas";
import { createInspectionRequest } from "@/lib/actions";
import { Button } from "./ui/button";
import { X, Plus, ClipboardList } from "lucide-react";

export default function RequestInspectionDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Step states: "details" | "payment" | "processing" | "success"
  const [step, setStep] = useState<"details" | "payment" | "processing" | "success">("details");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">("card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [paymentStatusText, setPaymentStatusText] = useState("Securing connection...");

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(InspectionRequestSchema),
    defaultValues: {
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

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    const res = await createInspectionRequest({
      ...data,
      paymentStatus: "PAID",
    });
    
    setIsLoading(false);
    if (res.error) {
      setError(res.error);
      setStep("payment");
    } else {
      setStep("success");
      reset();
      // Reset card details
      setCardName("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
    }
  };

  const handleProceedToPayment = async (e: React.MouseEvent) => {
    e.preventDefault();
    const isValid = await trigger();
    if (isValid) {
      setStep("payment");
    }
  };

  const handleSimulatedPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (paymentMethod === "card") {
      if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
        setError("Please fill out all card details for the simulation.");
        return;
      }
    }

    setStep("processing");

    // Cycle through simulated loading states
    setPaymentStatusText("Securing SSL connection...");
    setTimeout(() => {
      setPaymentStatusText("Contacting card issuer network...");
      setTimeout(() => {
        setPaymentStatusText("Authorizing ₦350,000 charge...");
        setTimeout(async () => {
          await handleSubmit(onSubmit)();
        }, 800);
      }, 800);
    }, 800);
  };

  const handleClose = () => {
    if (!isLoading && step !== "processing") {
      setIsOpen(false);
      setStep("details");
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
                    Your inspection request has been submitted successfully. We have processed your fee of **₦350,000** ($250 USD). 
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    A verification auditor has been assigned to your Lagos property. You can monitor progress under the Requests tab.
                  </p>
                </div>
                <Button onClick={() => { setIsOpen(false); setStep("details"); }} className="font-bold px-8">
                  Done
                </Button>
              </div>
            )}

            {/* Step: Details Form */}
            {step === "details" && (
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
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleProceedToPayment} className="font-bold flex items-center gap-1.5">
                    Proceed to Payment (₦350k)
                  </Button>
                </div>
              </form>
            )}

            {/* Step: Payment Gateway Checkout */}
            {step === "payment" && (
              <form onSubmit={handleSimulatedPayment} className="space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded border border-red-200">
                    {error}
                  </div>
                )}

                {/* Order Summary */}
                <div className="bg-gray-50 border border-border rounded-lg p-5 space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Summary</h4>
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-charcoal">Construction Verification Inspection</span>
                    <span className="text-primary text-base">₦350,000</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 pt-2">
                    <span>Lagos Launch Verification Service</span>
                    <span>$250.00 USD equivalent</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500 block">Select Payment Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-3 rounded-lg border text-sm font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                        paymentMethod === "card"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-lg">💳</span>
                      <span>Debit / Credit Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("transfer")}
                      className={`p-3 rounded-lg border text-sm font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                        paymentMethod === "transfer"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-lg">🏦</span>
                      <span>Bank Transfer</span>
                    </button>
                  </div>
                </div>

                {/* Card input forms */}
                {paymentMethod === "card" && (
                  <div className="space-y-4 border-t border-gray-100 pt-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-gray-500">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="Chidi Okafor"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-gray-500">Card Number</label>
                      <input
                        type="text"
                        placeholder="4000 1234 5678 9010"
                        maxLength={19}
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-gray-500">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM / YY"
                          maxLength={5}
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-gray-500">CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={3}
                          required
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulated Bank Transfer instructions */}
                {paymentMethod === "transfer" && (
                  <div className="space-y-4 border-t border-gray-100 pt-4 bg-primary/5 p-4 rounded-lg border border-primary/15">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Sterling Bank Transfer</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      To complete this inspection order, please transfer **₦350,000** to the following account:
                    </p>
                    <div className="space-y-1.5 text-xs text-charcoal font-semibold">
                      <div>Bank: <span className="text-primary font-bold">Sterling Bank PLC</span></div>
                      <div>Account Name: <span className="text-primary font-bold">Habitus Verification Ltd</span></div>
                      <div>Account Number: <span className="text-primary font-bold">0012345678</span></div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">
                      *Please click the payment button below once the transfer is completed to submit your order. Our coordinators will verify the transaction before dispatching the auditor.
                    </p>
                  </div>
                )}

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
                    Pay ₦350,000 ($250 USD)
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
