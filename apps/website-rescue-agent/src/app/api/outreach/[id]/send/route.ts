import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendOutreach } from "@/server/services/outreach.service";

type Params = { params: Promise<{ id: string }> };

// POST /api/outreach/:id/send
// Sendet NUR nach expliziter Freigabe (status === "APPROVED")
export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await sendOutreach(id, session.user?.id ?? "unknown");
    return NextResponse.json({ success: true, message: "Nachricht versendet" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fehler beim Versand";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
