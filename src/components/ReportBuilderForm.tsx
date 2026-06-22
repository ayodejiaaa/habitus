"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InspectionReportSchema } from "@/lib/schemas";
import { publishInspectionReport } from "@/lib/actions";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { FileText, Save, Info, Link2, Trash2, PlayCircle, Image as ImageIcon, AlertCircle } from "lucide-react";
import { validateMediaUrl } from "@/lib/media/validators";

interface RequestItem {
  id: string;
  projectName: string;
  city: string;
  country: string;
}

interface ReportBuilderFormProps {
  requests: RequestItem[];
}

export default function ReportBuilderForm({ requests }: ReportBuilderFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pre-select request from search param if available
  const defaultRequestId = searchParams.get("request") || (requests[0]?.id ?? "");

  const [mediaAssets, setMediaAssets] = useState<any[]>([]);
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(InspectionReportSchema),
    defaultValues: {
      requestId: defaultRequestId,
      assessmentStatus: "ON_TRACK" as any,
      executiveSummary: "",
      findings: "",
      recommendation: "PROCEED" as any,
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      ...data,
      mediaAssets,
    };

    const res = await publishInspectionReport(payload);

    setIsLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Inspection report published successfully!");
      reset();
      setMediaAssets([]);
      setMediaUrlInput("");
      // Refresh to update available projects in the list
      router.refresh();
      // Redirect to requests after 1.5 seconds
      setTimeout(() => {
        router.push("/admin/requests");
      }, 1500);
    }
  };

  const handleAddMedia = () => {
    setValidationError(null);
    const trimmed = mediaUrlInput.trim();
    if (!trimmed) return;

    const validation = validateMediaUrl(trimmed);
    if (!validation.isValid || !validation.cleanUrl || !validation.storageProvider || !validation.mediaType) {
      setValidationError(validation.error || "Invalid URL or untrusted media domain.");
      return;
    }

    if (mediaAssets.some((asset) => asset.trustedUrl === validation.cleanUrl)) {
      setValidationError("This media link is already added.");
      return;
    }

    const filename = trimmed.split("/").pop()?.split("?")[0] || "unnamed_asset";

    const newAsset = {
      storageProvider: validation.storageProvider,
      mediaType: validation.mediaType,
      trustedUrl: validation.cleanUrl,
      originalFileName: filename,
      displayName: filename,
    };

    setMediaAssets([...mediaAssets, newAsset]);
    setMediaUrlInput("");
  };

  const handleRemoveMedia = (index: number) => {
    setMediaAssets(mediaAssets.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-x-3 pb-4 border-b border-gray-50 bg-brand-bg/50">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <CardTitle>Report Builder</CardTitle>
          <p className="text-xs text-gray-400">Compile site findings, recommendations, and evidence.</p>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {requests.length === 0 && !defaultRequestId ? (
          <div className="flex items-center space-x-2 text-sm text-gray-400 bg-gray-50 p-4 rounded border">
            <Info className="h-5 w-5" />
            <span>All inspection requests currently have published reports.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
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

            {/* Select Request */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500">Target Project</label>
              <select
                disabled={isLoading}
                className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                {...register("requestId")}
              >
                {requests.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.projectName} ({r.city}, {r.country})
                  </option>
                ))}
                {/* Fallback if a specific preselected request is not in the un-reported list */}
                {defaultRequestId && !requests.find((r) => r.id === defaultRequestId) && (
                  <option value={defaultRequestId}>Preselected Request ID: {defaultRequestId}</option>
                )}
              </select>
            </div>

            {/* Assessment & Recommendation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500">Assessment Status</label>
                <select
                  disabled={isLoading}
                  className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                  {...register("assessmentStatus")}
                >
                  <option value="ON_TRACK">On Track</option>
                  <option value="NEEDS_ATTENTION">Needs Attention</option>
                  <option value="ISSUE_DETECTED">Issue Detected</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500">Action Recommendation</label>
                <select
                  disabled={isLoading}
                  className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                  {...register("recommendation")}
                >
                  <option value="PROCEED">Proceed</option>
                  <option value="PROCEED_WITH_CAUTION">Proceed with caution</option>
                  <option value="PAUSE_FUNDING">Pause further funding</option>
                </select>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500">Executive Summary</label>
              <textarea
                rows={5}
                disabled={isLoading}
                placeholder="Provide a written summary of the overall progress and findings..."
                className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none disabled:opacity-50"
                {...register("executiveSummary")}
              />
              {errors.executiveSummary && (
                <p className="text-red-500 text-xs mt-0.5">{errors.executiveSummary.message as string}</p>
              )}
            </div>

            {/* Key Findings */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500">Key Findings (one observation per line)</label>
              <textarea
                rows={5}
                disabled={isLoading}
                placeholder="e.g. Blockwork completed on ground floor.&#10;Substandard cement mixture detected in columns.&#10;Roof support timbers show structural integrity."
                className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none disabled:opacity-50"
                {...register("findings")}
              />
              {errors.findings && (
                <p className="text-red-500 text-xs mt-0.5">{errors.findings.message as string}</p>
              )}
            </div>

            {/* Media Selector Component */}
            <div className="space-y-4 border border-border rounded-xl p-5 bg-brand-bg/10">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-charcoal flex items-center gap-1.5">
                  <Link2 className="h-4 w-4 text-primary" />
                  Attach Media Evidence (Google Drive, YouTube, Vimeo)
                </label>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    disabled={isLoading}
                    value={mediaUrlInput}
                    onChange={(e) => {
                      setMediaUrlInput(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="Paste sharing link (e.g. Google Drive file link, YouTube/Vimeo video link)"
                    className="flex-1 bg-white border border-border rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading || !mediaUrlInput}
                    onClick={handleAddMedia}
                    className="font-bold border border-border bg-white text-charcoal hover:bg-gray-50 text-xs animate-in fade-in duration-200"
                  >
                    Attach
                  </Button>
                </div>
                {validationError && (
                  <p className="text-red-500 text-[10px] font-semibold mt-1 flex items-center gap-1 animate-in fade-in duration-100">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {validationError}
                  </p>
                )}
                <p className="text-[9px] text-gray-400 leading-relaxed pt-1">
                  Security policy: Paste Google Drive file links, YouTube watch links, or Vimeo video links. Arbitrary domains are blocked.
                </p>
              </div>

              {/* Selected Assets List */}
              {mediaAssets.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Attached Evidence Items ({mediaAssets.length})
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {mediaAssets.map((asset, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3 bg-white border border-border p-2 rounded-lg text-xs animate-in slide-in-from-bottom-2 duration-200"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {asset.mediaType === "IMAGE" ? (
                            <ImageIcon className="h-4 w-4 text-primary shrink-0" />
                          ) : (
                            <PlayCircle className="h-4 w-4 text-accent shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-charcoal truncate block">
                              {asset.displayName}
                            </span>
                            <span className="text-[9px] text-gray-400 uppercase font-mono block">
                              {asset.storageProvider} • {asset.mediaType}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleRemoveMedia(index)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-50 focus:outline-none"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="font-bold flex items-center gap-2">
              <Save className="h-4 w-4" /> {isLoading ? "Publishing..." : "Publish Report"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
