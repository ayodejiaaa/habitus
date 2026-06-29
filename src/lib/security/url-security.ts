const APPROVED_PROTOCOLS = ["http:", "https:"];

/**
 * Checks if the protocol of a given URL is in the explicitly approved list (http: and https:).
 * Follows a strict default-deny policy.
 */
export function isAllowedProtocol(urlStr: string): boolean {
  try {
    const trimmed = urlStr.trim();
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();
    
    if (!APPROVED_PROTOCOLS.includes(protocol)) {
      return false;
    }
    
    return trimmed.toLowerCase().startsWith(`${protocol}//`);
  } catch {
    return false;
  }
}

/**
 * Validates a URL against the strict protocol security policy.
 * Returns true if valid, false if malformed or containing an unauthorized protocol.
 */
export function validateUrl(urlStr: string | null | undefined): { isValid: boolean; error?: string } {
  if (!urlStr) {
    return { isValid: false, error: "URL is empty or undefined." };
  }

  const trimmed = urlStr.trim();
  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();
    
    if (!APPROVED_PROTOCOLS.includes(protocol)) {
      return {
        isValid: false,
        error: `Unauthorized URL protocol: ${protocol.slice(0, -1)}`,
      };
    }

    // Enforce that valid HTTP/HTTPS URLs explicitly use the standard '//' separator
    const protocolPrefix = `${protocol}//`;
    if (!trimmed.toLowerCase().startsWith(protocolPrefix)) {
      return {
        isValid: false,
        error: "Invalid URL format (missing protocol separator '//').",
      };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: "Invalid URL format." };
  }
}

/**
 * Sanitizes a URL string by ensuring only approved protocols (http/https) are returned.
 * Returns an empty string for any malformed or unauthorized URL.
 */
export function sanitizeUrl(urlStr: string | null | undefined): string {
  if (!urlStr) return "";
  const trimmed = urlStr.trim();
  const validation = validateUrl(trimmed);
  if (!validation.isValid) {
    return "";
  }
  return trimmed;
}
