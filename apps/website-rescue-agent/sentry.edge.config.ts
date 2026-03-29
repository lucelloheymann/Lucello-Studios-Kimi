import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adds request headers and IP for users
  sendDefaultPii: true,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  
  // Environment
  environment: process.env.NODE_ENV || "development",
  
  // Release tracking
  release: process.env.SENTRY_RELEASE,
  
  // Debug mode
  debug: process.env.NODE_ENV === "development" && process.env.SENTRY_DEBUG === "true",
});
