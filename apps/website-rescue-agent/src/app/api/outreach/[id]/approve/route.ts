import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { approveOutreach } from "@/server/services/outreach.service";

type Params = { params: Promise<{ id: string }> };

// POST /api/outreach/:id/approve
export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await approveOutreach(id, session.user?.id ?? "unknown");
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
