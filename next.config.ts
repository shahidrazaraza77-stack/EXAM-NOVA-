import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://iwpsckraxqrnkcfwdmgf.supabase.co https://lh3.googleusercontent.com https://*.googleusercontent.com https://images.unsplash.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://iwpsckraxqrnkcfwdmgf.supabase.co wss://iwpsckraxqrnkcfwdmgf.supabase.co https://generativelanguage.googleapis.com https://accounts.google.com",
      "media-src 'self' data: blob: https:",
      "frame-src 'self' https://accounts.google.com https://www.youtube.com https://www.youtube-nocookie.com",
      "frame-ancestors 'self' https://*.vercel.app https://vercel.com",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://accounts.google.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
  allowedDevOrigins: [
    "localhost:3000",
    "127.0.0.1:3000",
    "192.168.1.4:3000",
    "*.loca.lt",
    "*.pinggy.link",
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/_supabase/:path*",
        destination: "https://iwpsckraxqrnkcfwdmgf.supabase.co/:path*",
      },
      {
        source: "/watch%20demo.mp4",
        destination: "/watch-demo.mp4",
      },
      {
        source: "/video/watch%20demo.mp4",
        destination: "/video/watch-demo.mp4",
      },
    ];
  },
};

export default nextConfig;
