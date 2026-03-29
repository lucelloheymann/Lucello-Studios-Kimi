/**
 * API Route: POST /api/conversations/[id]/close
 * 
 * Schließt eine Conversation ab.
 * Erlaubte Status: CLOSED_WON oder CLOSED_LOST
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ConversationService } from "@/server/services/conversation.service";
import { ConversationStatus } from "@/types";

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
    const { status, notes } = body;

    // Validierung: Nur CLOSED_WON oder CLOSED_LOST erlaubt
    if (![ConversationStatus.CLOSED_WON, ConversationStatus.CLOSED_LOST].includes(status)) {
      return NextResponse.json(
        { error: "Invalid close status. Allowed: CLOSED_WON, CLOSED_LOST" },
        { status: 400 }
      );
    }

    const closedConversation = await ConversationService.closeConversation(
      id,
      status,
      notes
    );

    return NextResponse.json(closedConversation);
  } catch (error) {
    console.error(`[API] POST /api/conversations/${id}/close error:`, error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to close conversation" },
      { status: 500 }
    );
  }
}
