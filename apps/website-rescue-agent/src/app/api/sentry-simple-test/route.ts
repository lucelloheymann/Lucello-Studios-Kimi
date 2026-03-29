import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

/**
 * Sentry Simple Test - Minimaler Test
 */
export async function GET() {
  console.log("[Sentry Simple Test] Starting...");
  
  const dsn = process.env.SENTRY_DSN;
  const publicDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  
  console.log("[Sentry Simple Test] SENTRY_DSN exists:", !!dsn);
  console.log("[Sentry Simple Test] NEXT_PUBLIC_SENTRY_DSN exists:", !!publicDsn);
  
  if (!dsn && !publicDsn) {
    return NextResponse.json({ error: "No DSN configured" }, { status: 500 });
  }

  // Simples Event
  const error = new Error("Simple Sentry Test " + Date.now());
  
  try {
    const eventId = Sentry.captureException(error);
    console.log("[Sentry Simple Test] Event ID:", eventId);
    
    // Warte auf flush
    const flushResult = await Sentry.flush(5000);
    console.log("[Sentry Simple Test] Flush result:", flushResult);
    
    return NextResponse.json({
      success: true,
      eventId,
      flushResult,
      dsnUsed: dsn ? "SENTRY_DSN" : "NEXT_PUBLIC_SENTRY_DSN",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Sentry Simple Test] Error:", err);
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    }, { status: 500 });
  }
}
