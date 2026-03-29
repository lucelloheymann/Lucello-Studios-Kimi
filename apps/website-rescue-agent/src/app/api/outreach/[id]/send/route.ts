import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendOutreach } from "@/server/services/outreach.service";
import { isSmtpConfigured } from "@/server/services/email.service";

type Params = { params: Promise<{ id: string }> };

// POST /api/outreach/:id/send
// Sendet NUR nach expliziter Freigabe (status === "APPROVED")
export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const result = await sendOutreach(id, session.user?.id ?? "unknown");
    
    return NextResponse.json({
      success: true,
      message: isSmtpConfigured() ? "Nachricht versendet" : "Nachricht simuliert (SMTP nicht konfiguriert)",
      messageId: result.messageId,
      previewUrl: result.previewUrl,
      mode: isSmtpConfigured() ? "smtp" : "simulated",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fehler beim Versand";
    return NextResponse.json({ 
      error: message,
      retryable: message.includes("Fehlgeschlagen"), // Bei SMTP-Fehlern kann man es erneut versuchen
    }, { status: 400 });
  }
}
