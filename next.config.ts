import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "prava-ge-assets.s3.eu-north-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  allowedDevOrigins: ["10.0.0.153"],

  // the service worker must never be served from the HTTP cache, or app updates get stuck
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },

  experimental: {
    optimizePackageImports: [
      "react",
      "react-dom",
      "antd",
      "next-intl",
      "@ant-design/icons",
    ],
  },
};

export default withNextIntl(nextConfig);
