import { validateMediaUrl } from "./validators";

export interface MediaAssetInput {
  url: string;
  displayName?: string;
  originalFileName?: string;
  mediaType?: "IMAGE" | "VIDEO";
  uploadedBy?: string;
  checksum?: string;
}

export interface ProcessedMediaAsset {
  storageProvider: "GOOGLE_DRIVE" | "YOUTUBE" | "VIMEO" | "S3" | "R2";
  mediaType: "IMAGE" | "VIDEO";
  trustedUrl: string;
  extractedId?: string;
  displayName?: string;
  originalFileName?: string;
  checksum?: string;
}

/**
 * Sanitizes and processes raw entries through the validation and formatting rules.
 */
export async function processMediaIntake(input: MediaAssetInput): Promise<ProcessedMediaAsset> {
  const validation = validateMediaUrl(input.url);
  if (!validation.isValid || !validation.storageProvider || !validation.cleanUrl || !validation.mediaType) {
    throw new Error(validation.error || "Invalid media asset.");
  }

  // Use override mediaType if specified, otherwise fall back to validation default
  const mediaType = input.mediaType || validation.mediaType;

  return {
    storageProvider: validation.storageProvider,
    mediaType,
    trustedUrl: validation.cleanUrl,
    extractedId: validation.extractedId,
    displayName: input.displayName || input.originalFileName || `${validation.storageProvider.toLowerCase()}_asset`,
    originalFileName: input.originalFileName,
    checksum: input.checksum,
  };
}
