import * as Sentry from "@sentry/nextjs";

// Server-Konfiguration für Sentry
// Wird über instrumentation.ts geladen (falls diese funktioniert)

const DSN = process.env.SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    debug: false,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  });
}
