import { NextResponse } from "next/server";

/**
 * Sentry Health Check
 * 
 * GET /api/sentry-health
 * 
 * Returns Sentry configuration status without sending test events.
 */

export async function GET() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  
  if (!dsn) {
    return NextResponse.json({
      status: "NOT_CONFIGURED",
      configured: false,
      message: "SENTRY_DSN not found in environment",
      action: "Add SENTRY_DSN to .env.local and restart server",
      docs: "/docs/tools/sentry-activation.md",
    }, { status: 503 });
  }

  // Validate DSN format (basic check)
  const isValidDsn = dsn.startsWith("https://") && dsn.includes("@") && dsn.includes(".ingest.");
  
  if (!isValidDsn) {
    return NextResponse.json({
      status: "INVALID_DSN",
      configured: true,
      valid: false,
      message: "SENTRY_DSN has invalid format",
      action: "Check your DSN in Sentry project settings",
      hint: "DSN should look like: https://xxx@yyy.ingest.sentry.io/zzz",
    }, { status: 400 });
  }

  // Extract org and project info from DSN for dashboard link
  const dsnParts = dsn.match(/https:\/\/([^@]+)@([^\.]+)\.ingest\.sentry\.io\/(\d+)/);
  const dashboardUrl = dsnParts 
    ? `https://sentry.io/organizations/${dsnParts[2]}/issues/`
    : "https://sentry.io/issues/";

  return NextResponse.json({
    status: "HEALTHY",
    configured: true,
    valid: true,
    dsn_preview: dsn.substring(0, 20) + "...",
    environment: process.env.NODE_ENV,
    message: "Sentry is configured and ready",
    next_steps: [
      "Restart dev server if you just added the DSN",
      "Send test event: curl http://localhost:3000/api/sentry-test",
      "Check dashboard: " + dashboardUrl,
    ],
    dashboard_url: dashboardUrl,
  });
}
