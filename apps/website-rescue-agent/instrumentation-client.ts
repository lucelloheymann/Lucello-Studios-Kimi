import * as Sentry from "@sentry/nextjs";

// Sentry client-side initialization for Next.js 15
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  
  // Debug
  debug: true,
  
  // Environment
  environment: process.env.NODE_ENV || "development",
});

// Router transitions
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
