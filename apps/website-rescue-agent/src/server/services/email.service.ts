/**
 * Email Service
 * 
 * SMTP-basierter E-Mail-Versand mit Status-Tracking.
 * Provider-agnostisch - funktioniert mit jedem SMTP-Server.
 * 
 * Für Development: Mailtrap (empfohlen) oder Gmail
 * Für Production: Transactional Email Service (SendGrid, Mailgun, etc.)
 */

import nodemailer from "nodemailer";
import type { Transporter, SendMailOptions } from "nodemailer";

export interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  body: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
  previewUrl?: string; // Für Mailtrap Sandbox
}

// SMTP Transporter (lazy initialization)
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP not configured. Required: SMTP_HOST, SMTP_USER, SMTP_PASS"
    );
  }

  transporter = nodemailer.createTransporter({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: { user, pass },
    // Debug in development
    logger: process.env.NODE_ENV === "development",
    debug: process.env.NODE_ENV === "development" && process.env.SMTP_DEBUG === "true",
  });

  return transporter;
}

/**
 * Sendet eine E-Mail
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  try {
    const transport = getTransporter();

    const fromAddress = params.from || process.env.SMTP_FROM;
    const fromName = params.fromName || process.env.SMTP_FROM_NAME || "Website Rescue Agent";

    if (!fromAddress) {
      throw new Error("SMTP_FROM not configured");
    }

    const mailOptions: SendMailOptions = {
      from: `"${fromName}" <${fromAddress}>`,
      to: params.toName 
        ? `"${params.toName}" <${params.to}>` 
        : params.to,
      subject: params.subject,
      text: params.body, // Plain text version
      // html: params.body, // Uncomment if body is HTML
      replyTo: params.replyTo || fromAddress,
    };

    const info = await transport.sendMail(mailOptions);

    // Mailtrap Sandbox URL for testing
    const previewUrl = process.env.SMTP_HOST?.includes("mailtrap") 
      ? `https://mailtrap.io/inboxes/test/messages/${info.messageId}`
      : undefined;

    return {
      success: true,
      messageId: info.messageId,
      provider: "smtp",
      previewUrl,
    };

  } catch (error) {
    console.error("[EmailService] Failed to send email:", error);
    
    return {
      success: false,
      provider: "smtp",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Verifiziert SMTP-Verbindung (für Health-Checks)
 */
export async function verifySmtpConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const transport = getTransporter();
    await transport.verify();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "SMTP verification failed",
    };
  }
}

/**
 * Prüft ob SMTP konfiguriert ist
 */
export function isSmtpConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

/**
 * Erstellt E-Mail-Body mit Lead-Link
 * MVP: Link im Body, keine Attachments
 */
export function createEmailBody(body: string, leadUrl?: string): string {
  let finalBody = body;

  if (leadUrl) {
    finalBody += "\n\n";
    finalBody += "─────────────────────────────────────\n";
    finalBody += `Lead Details: ${leadUrl}\n`;
    finalBody += "─────────────────────────────────────\n";
  }

  // Standard-Footer
  finalBody += "\n\n";
  finalBody += "Mit freundlichen Grüßen\n";
  finalBody += process.env.SMTP_FROM_NAME || "Ihr Website-Team\n";

  return finalBody;
}
