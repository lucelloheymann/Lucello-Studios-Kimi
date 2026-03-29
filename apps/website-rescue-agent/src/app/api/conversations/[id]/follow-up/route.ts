/**
 * API Route: POST /api/conversations/[id]/follow-up
 * 
 * Erstellt ein Follow-Up für eine Conversation.
 * Guard: Nur wenn Conversation nicht bereits geschlossen.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ConversationService } from "@/server/services/conversation.service";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { outreachDraftId } = body;

    const followUp = await ConversationService.createFollowUp(id, outreachDraftId);
    return NextResponse.json(followUp, { status: 201 });
  } catch (error) {
    console.error(`[API] POST /api/conversations/${id}/follow-up error:`, error);

    if (error instanceof Error) {
      // 409 für "Conversation closed" oder andere Business-Rule-Verletzungen
      const status = error.message.includes("closed") ? 409 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json(
      { error: "Failed to create follow-up" },
      { status: 500 }
    );
  }
}
