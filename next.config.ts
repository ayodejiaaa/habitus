import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Paystack Inline (https://js.paystack.co/v1/inline.js) opens a checkout
// iframe/popup and calls their API directly from the browser; the Google
// domains mirror images.remotePatterns below (Drive-hosted evidence photos);
// youtube-nocookie/player.vimeo are the only video-embed frame sources used
// in report pages (see src/lib/media/validators.ts).
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://js.paystack.co${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://docs.google.com https://drive.google.com https://lh3.googleusercontent.com https://lh4.googleusercontent.com https://lh5.googleusercontent.com https://lh6.googleusercontent.com;
  font-src 'self';
  connect-src 'self' https://api.paystack.co;
  frame-src https://www.youtube-nocookie.com https://player.vimeo.com https://checkout.paystack.com https://standard.paystack.co;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspHeader },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "docs.google.com",
        pathname: "/uc**",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh4.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh5.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh6.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
