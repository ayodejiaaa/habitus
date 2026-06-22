const TRUSTED_DOMAINS = [
  // Google Drive
  "drive.google.com",
  "docs.google.com",
  "lh3.googleusercontent.com",
  "lh4.googleusercontent.com",
  "lh5.googleusercontent.com",
  "lh6.googleusercontent.com",
  // YouTube
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  // Vimeo
  "vimeo.com",
  "www.vimeo.com",
  "player.vimeo.com",
];

export function validateMediaUrl(urlStr: string): {
  isValid: boolean;
  storageProvider?: "GOOGLE_DRIVE" | "YOUTUBE" | "VIMEO" | "S3" | "R2";
  mediaType?: "IMAGE" | "VIDEO";
  extractedId?: string;
  cleanUrl?: string;
  error?: string;
} {
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname.toLowerCase();
    
    // Check if domain is trusted
    const isTrusted = TRUSTED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith("." + domain)
    );

    if (!isTrusted) {
      return { isValid: false, error: "Untrusted media domain. Only Google Drive, YouTube, and Vimeo are allowed." };
    }

    // Google Drive check
    if (hostname.includes("google.com") || hostname.includes("googleusercontent.com")) {
      let fileId = "";
      
      // Try to parse file ID from various formats
      // Format 1: drive.google.com/file/d/FILE_ID/view
      if (url.pathname.includes("/file/d/")) {
        const parts = url.pathname.split("/file/d/");
        fileId = parts[1]?.split("/")[0] || "";
      } 
      // Format 2: drive.google.com/open?id=FILE_ID
      else if (url.searchParams.has("id")) {
        fileId = url.searchParams.get("id") || "";
      }
      // Format 3: docs.google.com/uc?id=FILE_ID or export=download
      else if (url.pathname.includes("/uc") && url.searchParams.has("id")) {
        fileId = url.searchParams.get("id") || "";
      }

      // If we couldn't parse a file ID but it's a googleusercontent link, it might be a direct link
      if (!fileId && hostname.includes("googleusercontent.com")) {
        return {
          isValid: true,
          storageProvider: "GOOGLE_DRIVE",
          mediaType: "IMAGE",
          cleanUrl: urlStr,
        };
      }

      if (!fileId) {
        return { isValid: false, error: "Could not parse Google Drive file ID from the URL." };
      }

      // Generate a trusted direct download/view link
      const trustedUrl = `https://docs.google.com/uc?export=view&id=${fileId}`;

      return {
        isValid: true,
        storageProvider: "GOOGLE_DRIVE",
        mediaType: "IMAGE",
        extractedId: fileId,
        cleanUrl: trustedUrl,
      };
    }

    // YouTube check
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be") || hostname.includes("youtube-nocookie.com")) {
      let videoId = "";
      if (hostname.includes("youtu.be")) {
        videoId = url.pathname.substring(1).split(/[?#]/)[0];
      } else if (url.pathname.includes("/embed/")) {
        videoId = url.pathname.split("/embed/")[1]?.split(/[?#]/)[0] || "";
      } else {
        videoId = url.searchParams.get("v") || "";
      }

      if (!videoId) {
        return { isValid: false, error: "Could not parse YouTube video ID from the URL." };
      }

      const trustedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
      return {
        isValid: true,
        storageProvider: "YOUTUBE",
        mediaType: "VIDEO",
        extractedId: videoId,
        cleanUrl: trustedUrl,
      };
    }

    // Vimeo check
    if (hostname.includes("vimeo.com")) {
      let videoId = "";
      if (url.pathname.includes("/video/")) {
        videoId = url.pathname.split("/video/")[1]?.split(/[?#]/)[0] || "";
      } else {
        videoId = url.pathname.substring(1).split(/[?#]/)[0] || "";
      }

      if (!videoId || isNaN(Number(videoId))) {
        return { isValid: false, error: "Could not parse Vimeo video ID from the URL." };
      }

      const trustedUrl = `https://player.vimeo.com/video/${videoId}`;
      return {
        isValid: true,
        storageProvider: "VIMEO",
        mediaType: "VIDEO",
        extractedId: videoId,
        cleanUrl: trustedUrl,
      };
    }

    return { isValid: false, error: "Unsupported storage provider." };
  } catch (err) {
    return { isValid: false, error: "Invalid URL format." };
  }
}
