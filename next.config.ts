import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const isProd = process.env.NODE_ENV === "production"; // true seulement en prod

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: !isProd, // désactive PWA en dev
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offline-cache',
        expiration: { maxEntries: 200 },
      },
    },
    {
      urlPattern: /^\/(admin|signin|$)/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'protected-pages-cache',
        expiration: { maxEntries: 20 },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default withPWA(nextConfig);
