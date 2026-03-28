import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateOutreachDraft } from "@/server/services/outreach.service";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/outreach/:id/edit
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    await updateOutreachDraft(id, session.user?.id ?? "unknown", {
      recipientName: body.recipientName,
      recipientEmail: body.recipientEmail,
      recipientRole: body.recipientRole,
      subject: body.subject,
      body: body.body,
      offerPriceRange: body.offerPriceRange,
      offerValidUntil: body.offerValidUntil ? new Date(body.offerValidUntil) : undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
