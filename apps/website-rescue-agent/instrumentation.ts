import * as Sentry from "@sentry/nextjs";

// Next.js 15 Server/Edge Instrumentation
// Hinweis: Diese Datei wird aktuell nicht zuverlässig geladen,
// daher erfolgt die Initialisierung über src/lib/sentry-init.ts

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
