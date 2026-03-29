// Sentry Initialisierungs-Helper
// Notwendig da instrumentation.ts in Next.js 15 nicht zuverlässig geladen wird
import * as Sentry from "@sentry/nextjs";

const DSN = process.env.SENTRY_DSN;

let isInitialized = false;

export function ensureSentryInitialized() {
  if (isInitialized || Sentry.getClient()) {
    return;
  }

  if (!DSN) {
    console.warn("[Sentry] DSN not configured, skipping initialization");
    return;
  }

  Sentry.init({
    dsn: DSN,
    debug: false, // Kein Debug in Production
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.0, // Deaktiviert bis explizit benötigt
    replaysOnErrorSampleRate: 1.0,
  });

  isInitialized = true;
}

export * from "@sentry/nextjs";
