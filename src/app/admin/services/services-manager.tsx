"use client";

import React, { useState } from "react";
import { updateServicePrice, toggleServiceActive } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Edit2, Check, X, Loader2 } from "lucide-react";

interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  isActive: boolean;
  displayOrder: number;
}

interface ServicesManagerProps {
  initialServices: ServiceItem[];
}

export default function ServicesManager({ initialServices }: ServicesManagerProps) {
  const [services, setServices] = useState(initialServices);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setError(null);
    setSuccess(null);
    setActionLoadingId(id + "-status");
    const res = await toggleServiceActive(id, !currentStatus);
    setActionLoadingId(null);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(res.success || "Service status updated.");
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: !currentStatus } : s))
      );
    }
  };

  const startEdit = (id: string, currentPrice: number) => {
    setEditingId(id);
    setEditPrice(currentPrice.toString());
  };

  const handleSavePrice = async (id: string) => {
    setError(null);
    setSuccess(null);
    const parsedPrice = parseFloat(editPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Please enter a valid price.");
      return;
    }

    setActionLoadingId(id + "-price");
    const res = await updateServicePrice(id, parsedPrice);
    setActionLoadingId(null);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(res.success || "Price updated successfully.");
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, price: parsedPrice } : s))
      );
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded border border-red-200 animate-in fade-in duration-200">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 text-emerald-700 text-xs font-semibold p-3 rounded border border-emerald-250 animate-in fade-in duration-200">
          {success}
        </div>
      )}

      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-border text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4 sm:p-5">Service Name</th>
                <th className="p-4 sm:p-5">Price</th>
                <th className="p-4 sm:p-5 text-center">Status</th>
                <th className="p-4 sm:p-5 text-center">Display Order</th>
                <th className="p-4 sm:p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {services.map((service) => {
                const isEditing = editingId === service.id;
                const isStatusLoading = actionLoadingId === service.id + "-status";
                const isPriceLoading = actionLoadingId === service.id + "-price";

                return (
                  <tr key={service.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Name */}
                    <td className="p-4 sm:p-5 font-semibold text-charcoal">
                      <div>
                        <span>{service.name}</span>
                        <span className="block text-[10px] text-gray-400 font-normal mt-0.5 max-w-sm leading-relaxed">
                          {service.description}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="p-4 sm:p-5 whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500 font-semibold">₦</span>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            disabled={isPriceLoading}
                            className="w-24 bg-white border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                          />
                          <button
                            onClick={() => handleSavePrice(service.id)}
                            disabled={isPriceLoading}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            {isPriceLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            disabled={isPriceLoading}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-charcoal">
                            ₦{service.price.toLocaleString()}
                          </span>
                          <button
                            onClick={() => startEdit(service.id, service.price)}
                            className="text-gray-400 hover:text-primary p-1 rounded transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4 sm:p-5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleToggleActive(service.id, service.isActive)}
                          disabled={isStatusLoading}
                          className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            service.isActive
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : "bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100"
                          }`}
                        >
                          {isStatusLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                          <span>{service.isActive ? "Active" : "Coming Soon"}</span>
                        </button>
                      </div>
                    </td>

                    {/* Display Order */}
                    <td className="p-4 sm:p-5 text-center text-gray-500 font-semibold">
                      {service.displayOrder}
                    </td>

                    {/* Quick Toggles */}
                    <td className="p-4 sm:p-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(service.id, service.isActive)}
                        disabled={isStatusLoading}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer"
                      >
                        {service.isActive ? "Set Coming Soon" : "Set Active"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
