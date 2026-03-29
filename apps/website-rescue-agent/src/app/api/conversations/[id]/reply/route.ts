/**
 * API Route: POST /api/conversations/[id]/reply
 * 
 * Erfasst eine eingehende Antwort auf eine Conversation.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ConversationService } from "@/server/services/conversation.service";
import { ReplySentiment } from "@/types";

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
    const { sentiment, content, notes } = body;

    // Validierung
    if (!sentiment || !Object.values(ReplySentiment).includes(sentiment)) {
      return NextResponse.json(
        { error: `Invalid sentiment. Allowed: ${Object.values(ReplySentiment).join(", ")}` },
        { status: 400 }
      );
    }

    const reply = await ConversationService.addReply(id, {
      sentiment,
      content,
      notes,
      createdBy: session.user?.name || "unknown",
    });

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error(`[API] POST /api/conversations/${id}/reply error:`, error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add reply" },
      { status: 500 }
    );
  }
}
