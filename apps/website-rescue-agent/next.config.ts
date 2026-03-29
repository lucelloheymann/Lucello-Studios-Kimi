import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  serverExternalPackages: ["playwright", "playwright-core", "bullmq", "ioredis"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

// Sentry configuration
// For all available options, see: https://github.com/getsentry/sentry-webpack-plugin#options
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
  
  // Upload source maps only in production builds
  dryRun: process.env.NODE_ENV !== "production",
  
  // Disable telemetry
  telemetry: false,
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
