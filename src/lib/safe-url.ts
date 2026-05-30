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

// Pull the src="..." out of a pasted <iframe> tag. Google Maps' "Share →
// Embed a map" gives you the full <iframe ...></iframe> HTML, so accept that
// and extract just the URL.
function extractIframeSrc(input: string): string {
  const m = input.match(/<iframe[^>]*\ssrc\s*=\s*["']([^"']+)["']/i);
  return m ? m[1] : input;
}

// Stricter than safeHref: only https Google Maps embed URLs. Accepts either
// a bare URL or a full <iframe> paste. Returns the clean src or null.
export function safeMapsEmbed(input: string | null | undefined): string | null {
  if (!input) return null;
  const candidate = extractIframeSrc(input.trim()).trim();
  try {
    const u = new URL(candidate);
    if (u.protocol !== 'https:') return null;
    // google.com, google.ca, www.google.*, maps.google.* etc.
    if (!/(^|\.)google\.(com|[a-z]{2,3})$/i.test(u.hostname)) return null;
    // Accept /maps, /maps/embed, /maps/... — the address-derived embed uses
    // /maps?q=...&output=embed, the Share embed uses /maps/embed?pb=...
    if (!u.pathname.startsWith('/maps')) return null;
    return u.toString();
  } catch {
    return null;
  }
}

// The map shown on the public site. Priority:
//   1. A custom embed the admin pasted (precise pin), else
//   2. An auto-generated map from the clinic address — this updates
//      automatically whenever the address changes, and needs no API key.
// Returns null only when there's neither a valid embed nor an address.
export function mapsEmbedSrc(opts: {
  embed?: string | null;
  address?: string | null;
}): string | null {
  const custom = safeMapsEmbed(opts.embed);
  if (custom) return custom;
  const address = (opts.address ?? '').trim();
  if (!address) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}
