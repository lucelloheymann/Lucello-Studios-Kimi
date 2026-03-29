/**
 * API Route: /api/conversations
 * 
 * GET: Liste von Conversations mit Filtern
 * POST: Neue Conversation erstellen (normalerweise automatisch beim Versand)
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ConversationService } from "@/server/services/conversation.service";
import { ConversationStatus } from "@/types";

// GET /api/conversations?status=PENDING&followUpDue=true
export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    
    const filter = {
      status: searchParams.get("status") as ConversationStatus | undefined,
      companyId: searchParams.get("companyId") || undefined,
      hasReply: searchParams.has("hasReply") 
        ? searchParams.get("hasReply") === "true" 
        : undefined,
      followUpDue: searchParams.has("followUpDue")
        ? searchParams.get("followUpDue") === "true"
        : undefined,
      overdue: searchParams.has("overdue")
        ? searchParams.get("overdue") === "true"
        : undefined,
    };

    const conversations = await ConversationService.getConversations(filter);
    return NextResponse.json(conversations);
  } catch (error) {
    console.error("[API] GET /api/conversations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST /api/conversations
// Wird normalerweise automatisch beim Outreach-Versand aufgerufen
export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { companyId, initialOutreachId } = body;

    if (!companyId || !initialOutreachId) {
      return NextResponse.json(
        { error: "Missing required fields: companyId, initialOutreachId" },
        { status: 400 }
      );
    }

    const conversation = await ConversationService.createConversation(
      companyId,
      initialOutreachId
    );

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("[API] POST /api/conversations error:", error);
    
    // Service-Error (z.B. aktive Conversation existiert bereits)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
