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

  experimental: {
    optimizePackageImports: ["react", "react-dom"],
  },
};

export default withNextIntl(nextConfig);
