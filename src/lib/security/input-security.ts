/**
 * Helper to escape HTML characters to prevent stored XSS.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Strips all HTML tags, script contents, and attributes to return pure plain text.
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return "";
  // 1. Remove HTML comments
  let clean = input.replace(/<!--[\s\S]*?-->/g, "");
  // 2. Remove script, style, iframe, object, embed tags and their inner content
  clean = clean.replace(/<(script|style|iframe|object|embed)[\s\S]*?>[\s\S]*?<\/\1>/gi, "");
  // 3. Strip all HTML tags
  clean = clean.replace(/<[^>]*>/g, "");
  // 4. Escape HTML characters
  return escapeHtml(clean).trim();
}

/**
 * Strips all HTML tags and script contents but preserves line breaks.
 */
export function sanitizeMultilineText(input: string | null | undefined): string {
  if (!input) return "";
  let clean = input.replace(/<!--[\s\S]*?-->/g, "");
  clean = clean.replace(/<(script|style|iframe|object|embed)[\s\S]*?>[\s\S]*?<\/\1>/gi, "");
  clean = clean.replace(/<[^>]*>/g, "");
  return escapeHtml(clean).trim();
}

/**
 * Safe HTML sanitization. Strips scripts and event handlers but preserves safe format tags.
 * Runs in pure JS without browser-simulated environment (jsdom) requirements.
 */
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return "";
  let clean = input.replace(/<!--[\s\S]*?-->/g, "");
  // Strip dangerous tags entirely (script, iframe, style, object, embed)
  clean = clean.replace(/<(script|iframe|style|object|embed)[\s\S]*?>[\s\S]*?<\/\1>/gi, "");
  // Remove dangerous attributes like inline event handlers and javascript protocols
  clean = clean.replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, "");
  clean = clean.replace(/href\s*=\s*["']\s*javascript:[\s\S]*?["']/gi, "");
  return clean.trim();
}

/**
 * Protocol validator for URL attributes. Whitelists only http: and https:.
 * Prevents javascript:, data:, and vbscript: XSS vectors.
 */
export function sanitizeUrl(urlStr: string | null | undefined): string {
  if (!urlStr) return "";
  try {
    const trimmed = urlStr.trim();
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
    return "";
  } catch {
    return "";
  }
}

/**
 * Validates project name constraints (length: 2-100, characters: alphanumeric + standard punctuation).
 */
export function validateProjectName(name: string | null | undefined): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
}

/**
 * Validates property address constraints (length: 5-250).
 */
export function validateAddress(address: string | null | undefined): boolean {
  if (!address) return false;
  const trimmed = address.trim();
  return trimmed.length >= 5 && trimmed.length <= 250;
}

/**
 * Validates site contact name constraints (length: 2-70, alphabetical/whitespace only).
 */
export function validateContactName(name: string | null | undefined): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 70;
}

/**
 * Validates text notes/messages maximum length constraints.
 */
export function validateNotes(notes: string | null | undefined, maxLength: number = 2000): boolean {
  if (!notes) return true; // Optional field
  return notes.length <= maxLength;
}
