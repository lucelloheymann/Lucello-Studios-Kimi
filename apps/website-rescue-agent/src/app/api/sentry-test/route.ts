import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn) {
    return NextResponse.json(
      { status: "NOT_CONFIGURED", message: "SENTRY_DSN not set" },
      { status: 503 }
    );
  }

  // Capture with current hub
  const eventId = Sentry.captureMessage("Sentry Wizard Test " + Date.now(), {
    level: "info",
    tags: { test: true, wizard: true },
  });

  console.log("[Sentry] Event captured:", eventId);

  // Flush
  await Sentry.flush(5000);
  console.log("[Sentry] Flush done");

  return NextResponse.json({
    status: "SENT",
    eventId,
    dsn_preview: dsn.substring(0, 20) + "...",
    check_dashboard: "https://sentry.io/organizations/lucello/issues/",
  });
}
