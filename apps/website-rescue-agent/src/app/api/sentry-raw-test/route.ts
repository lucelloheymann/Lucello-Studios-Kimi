import { NextResponse } from "next/server";

// Direkter Import ohne Next.js Wrapper
import * as Sentry from "@sentry/node";

export async function GET() {
  // Manuelle Initialisierung für diesen Test
  if (!Sentry.getCurrentHub().getClient()) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      debug: true,
      environment: "development",
    });
    console.log("[Sentry Raw] Initialized manually");
  }

  const eventId = Sentry.captureMessage("Raw Sentry Test " + Date.now());
  console.log("[Sentry Raw] Event ID:", eventId);

  // Flush mit längerem Timeout
  const flushed = await Sentry.flush(5000);
  console.log("[Sentry Raw] Flushed:", flushed);

  return NextResponse.json({
    eventId,
    flushed,
    message: flushed ? "Event should be in Sentry" : "Flush failed",
  });
}
