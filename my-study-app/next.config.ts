import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  // output: 'export' enables static HTML export for Capacitor/iOS builds.
  // When building for mobile (build:mobile), this generates a static `out/` dir
  // that Capacitor serves from the WKWebView.
  // For web/PWA, use `next build` without this flag (or with NEXT_OUTPUT unset).
  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
};

export default withPWA(nextConfig);
