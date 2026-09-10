import type { NextConfig } from 'next';

// Static pages use inline hydration scripts. Keep script-src explicit; a nonce
// policy would require dynamic rendering. No user-authored HTML is rendered.
const csp = [
  "default-src 'self'", "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob:",
  "font-src 'self'", "connect-src 'self'", "object-src 'none'",
  "base-uri 'self'", "form-action 'none'", "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');
const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { formats: ['image/webp', 'image/avif'], deviceSizes: [640, 750, 828, 1080, 1200, 1920], imageSizes: [16, 32, 48, 64, 96, 128, 256, 384] },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'Content-Security-Policy', value: csp },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ] }];
  },
};
export default nextConfig;
