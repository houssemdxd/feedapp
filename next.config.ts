import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // désactivé en dev
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
eslint: {
    ignoreDuringBuilds: true, // ⚡ Ignore ESLint pendant le build
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default withPWA(nextConfig);
