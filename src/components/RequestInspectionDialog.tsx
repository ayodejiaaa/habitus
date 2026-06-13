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

  const {
    register,
    handleSubmit,
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
    setSuccess(null);

    const res = await createInspectionRequest(data);
    
    setIsLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(res.success || "Request submitted!");
      reset();
      // Close modal after 1.5 seconds
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
      }, 1500);
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
            onClick={() => !isLoading && setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl z-10 animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
              <div className="flex items-center space-x-2 text-primary">
                <ClipboardList className="h-5 w-5" />
                <h3 className="text-lg font-bold text-charcoal">New Inspection Request</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="text-gray-400 hover:text-charcoal p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

              {error && (
                <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded border border-red-200">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 text-emerald-700 text-xs font-semibold p-3 rounded border border-emerald-200">
                  {success}
                </div>
              )}

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
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="font-bold">
                  {isLoading ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
