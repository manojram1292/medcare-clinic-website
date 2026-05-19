/** @type {import('next').NextConfig} */
const supabaseHost = (() => {
  try { return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null; }
  catch { return null; }
})();

// Build a Content Security Policy. We allow inline styles (Next.js + the
// design system uses them heavily) and a small `<script>` tag in the root
// layout that flips `js-ready` before paint. Everything else is locked down.
function buildCsp() {
  const supabaseConnect = supabaseHost ? `https://${supabaseHost} wss://${supabaseHost}` : '';
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `img-src 'self' data: blob:${supabaseHost ? ` https://${supabaseHost}` : ''}`,
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src 'self' ${supabaseConnect}`.trim(),
    // Allow Google Maps embed iframes only
    "frame-src https://www.google.com https://maps.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');
}

const securityHeaders = [
  { key: 'Content-Security-Policy', value: buildCsp() },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' }]
      : [],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
