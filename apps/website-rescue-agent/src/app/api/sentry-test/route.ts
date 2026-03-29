import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

/**
 * Sentry Test Endpoint
 * 
 * Use this to verify Sentry is working:
 * 1. Set SENTRY_DSN in .env.local
 * 2. Restart dev server
 * 3. Visit: http://localhost:3000/api/sentry-test
 * 4. Check Sentry dashboard for the error
 */

export async function GET() {
  // Check if Sentry is configured
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  
  if (!dsn) {
    return NextResponse.json(
      {
        status: "SENTRY NOT CONFIGURED",
        message: "SENTRY_DSN not found in environment",
        action: "Add SENTRY_DSN to .env.local and restart",
        docs: "/docs/tools/sentry-setup.md",
      },
      { status: 503 }
    );
  }

  // Test error - this should appear in Sentry dashboard
  const testError = new Error("Sentry Test Error - " + new Date().toISOString());
  
  Sentry.captureException(testError, {
    tags: { test: true, source: "sentry-test-route" },
    extra: { 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    },
  });

  // Also throw to test error boundary
  try {
    throw new Error("Test error inside try/catch");
  } catch (error) {
    Sentry.captureException(error);
  }

  return NextResponse.json({
    status: "SENTRY TEST SENT",
    message: "Test errors sent to Sentry",
    dsn_configured: true,
    dsn_preview: dsn.substring(0, 20) + "...",
    next_step: "Check your Sentry dashboard for the test errors",
    dashboard_url: "https://sentry.io/organizations/YOUR_ORG/issues/",
  });
}

export async function POST() {
  // Simulate an unhandled error
  throw new Error("Unhandled test error for Sentry");
}
