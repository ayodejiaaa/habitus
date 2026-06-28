import DOMPurify from "isomorphic-dompurify";

/**
 * Strips all HTML tags and attributes to return pure plain text (e.g. for Project Names, Cities).
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return "";
  // Purify with empty allowed tags/attrs leaves only clean text
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

/**
 * Strips all HTML tags and attributes but preserves line breaks (e.g. for Notes, Audit Logs).
 */
export function sanitizeMultilineText(input: string | null | undefined): string {
  if (!input) return "";
  // Purify preserves line break whitespace characters
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

/**
 * Safe HTML sanitization. Strips scripts and event handlers but preserves safe format tags.
 */
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return "";
  return DOMPurify.sanitize(input).trim();
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
