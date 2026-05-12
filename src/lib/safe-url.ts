// Validate user-supplied URLs before rendering them as href / src.
// Blocks javascript:, data:, vbscript: schemes which could trigger XSS.

const ALLOWED_HREF_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:']);

export function safeHref(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Allow site-relative paths
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
  try {
    const u = new URL(trimmed);
    return ALLOWED_HREF_SCHEMES.has(u.protocol) ? trimmed : null;
  } catch {
    return null;
  }
}

// Stricter than safeHref: only https Google Maps embed URLs.
export function safeMapsEmbed(input: string | null | undefined): string | null {
  if (!input) return null;
  try {
    const u = new URL(input.trim());
    if (u.protocol !== 'https:') return null;
    if (!/(^|\.)google\.(com|[a-z]{2,3})$/i.test(u.hostname)) return null;
    if (!u.pathname.startsWith('/maps/')) return null;
    return u.toString();
  } catch {
    return null;
  }
}
