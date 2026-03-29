import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

/**
 * Sentry Test Endpoint - DEBUG VERSION
 * 
 * Wichtig: Sentry.flush() ist REQUIRED für serverseitige Events!
 * Ohne flush() werden Events asynchron gesendet und möglicherweise
 * nicht vor Response-Ende übertragen.
 */

export async function GET() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  
  if (!dsn) {
    return NextResponse.json({
      status: "SENTRY NOT CONFIGURED",
      message: "SENTRY_DSN not found",
    }, { status: 503 });
  }

  console.log("[Sentry Test] Starting with DSN:", dsn.substring(0, 20) + "...");

  // Test 1: captureException mit await und flush
  const testError = new Error("Sentry Test Error - " + new Date().toISOString());
  
  const eventId = Sentry.captureException(testError, {
    tags: { 
      test: true, 
      source: "sentry-test-route",
      test_run: "debug_v2"
    },
    extra: { 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      dsn_host: dsn.match(/@([^\.]+)/)?.[1] || "unknown"
    },
  });

  console.log("[Sentry Test] Event captured, ID:", eventId);

  // WICHTIG: flush() wartet bis Event übertragen ist
  try {
    await Sentry.flush(5000); // 5 Sekunden Timeout
    console.log("[Sentry Test] Flush successful");
  } catch (flushError) {
    console.error("[Sentry Test] Flush failed:", flushError);
    return NextResponse.json({
      status: "SENTRY FLUSH FAILED",
      eventId,
      error: flushError instanceof Error ? flushError.message : "Unknown flush error",
    }, { status: 500 });
  }

  return NextResponse.json({
    status: "SENTRY TEST COMPLETE",
    eventId,
    message: "Event captured and flushed to Sentry",
    dsn_preview: dsn.substring(0, 20) + "...",
    check_dashboard: "https://sentry.io/organizations/lucello-studio/issues/",
    next_step: "Check dashboard in 10-30 seconds",
  });
}

export async function POST() {
  // Unhandled error - sollte von Sentry automatisch erfasst werden
  throw new Error("Unhandled test error for Sentry");
}
