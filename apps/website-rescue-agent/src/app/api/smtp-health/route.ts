import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifySmtpConnection, isSmtpConfigured } from "@/server/services/email.service";

/**
 * SMTP Health Check Endpoint
 * 
 * GET /api/smtp-health
 * 
 * Verifies SMTP configuration without sending actual emails.
 * Useful for testing connection before attempting real sends.
 */

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if SMTP is configured
  const configured = isSmtpConfigured();
  
  if (!configured) {
    return NextResponse.json({
      status: "NOT_CONFIGURED",
      configured: false,
      message: "SMTP not configured",
      required: ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"],
      optional: ["SMTP_PORT", "SMTP_FROM", "SMTP_FROM_NAME"],
    }, { status: 503 });
  }

  // Try to verify connection
  const verification = await verifySmtpConnection();

  if (verification.ok) {
    return NextResponse.json({
      status: "HEALTHY",
      configured: true,
      connected: true,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || "587",
      from: process.env.SMTP_FROM,
      message: "SMTP connection successful",
    });
  } else {
    return NextResponse.json({
      status: "UNHEALTHY",
      configured: true,
      connected: false,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || "587",
      error: verification.error,
      message: "SMTP connection failed",
      hints: [
        "Check if SMTP_HOST is correct",
        "Verify SMTP_USER and SMTP_PASS",
        "Check if port is correct (587 for TLS, 465 for SSL)",
        "Ensure firewall allows outgoing SMTP connections",
      ],
    }, { status: 503 });
  }
}
