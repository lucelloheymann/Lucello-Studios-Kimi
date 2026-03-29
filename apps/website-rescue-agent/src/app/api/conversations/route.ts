/**
 * API Route: /api/conversations
 * 
 * Liste von Conversations mit Filtern für die Outreach-Arbeitsansicht.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ACTIVE_CONVERSATION_STATUSES, ReplySentiment, ConversationStatus } from "@/types";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  
  // Filter-Parameter
  const filter = searchParams.get("filter") || "all";
  const sentiment = searchParams.get("sentiment");
  const status = searchParams.get("status");
  const due = searchParams.get("due"); // 'today', 'overdue', 'week'
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  
  // Build where clause
  const where: any = {};
  
  // Status-Filter
  if (status) {
    where.status = status;
  } else if (filter === "active") {
    where.status = { in: ACTIVE_CONVERSATION_STATUSES };
  } else if (filter === "closed") {
    where.status = { in: ["CLOSED_WON", "CLOSED_LOST", "NO_REPLY_CLOSED"] };
  }
  
  // Sentiment-Filter
  if (sentiment) {
    where.currentSentiment = sentiment;
  }
  
  // Due-Filter (Follow-up fällig)
  if (due === "today") {
    where.status = { in: ACTIVE_CONVERSATION_STATUSES };
    where.nextFollowUpDueAt = {
      not: null,
      gte: todayStart,
      lte: todayEnd,
    };
  } else if (due === "overdue") {
    where.status = { in: ACTIVE_CONVERSATION_STATUSES };
    where.nextFollowUpDueAt = {
      not: null,
      lt: todayStart,
    };
  } else if (due === "week") {
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    where.status = { in: ACTIVE_CONVERSATION_STATUSES };
    where.nextFollowUpDueAt = {
      not: null,
      lte: weekEnd,
    };
  }
  
  // Reply-Filter
  if (filter === "replied") {
    where.status = "REPLIED";
  } else if (filter === "no-reply") {
    where.replyReceivedAt = null;
  }
  
  // Positive/Negative Filter
  if (filter === "positive") {
    where.currentSentiment = ReplySentiment.POSITIVE;
  } else if (filter === "negative") {
    where.currentSentiment = { in: [ReplySentiment.NEGATIVE, ReplySentiment.SPAM] };
  }

  try {
    const conversations = await db.conversation.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            domain: true,
            opportunityScore: true,
            status: true,
          },
        },
        replies: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            sentiment: true,
            content: true,
            receivedAt: true,
            createdBy: true,
          },
        },
        followUps: {
          orderBy: { sequenceNumber: "asc" },
          select: {
            id: true,
            sequenceNumber: true,
            status: true,
            dueAt: true,
            sentAt: true,
          },
        },
      },
      orderBy: [
        { nextFollowUpDueAt: "asc" },
        { lastContactAt: "desc" },
      ],
    });

    // Format response
    const formatted = conversations.map((c) => ({
      id: c.id,
      companyId: c.companyId,
      company: c.company,
      status: c.status,
      currentSentiment: c.currentSentiment,
      followUpCount: c.followUpCount,
      nextFollowUpDueAt: c.nextFollowUpDueAt,
      lastContactAt: c.lastContactAt,
      replyReceivedAt: c.replyReceivedAt,
      firstSentAt: c.firstSentAt,
      lastReply: c.replies[0] || null,
      followUps: c.followUps,
      isOverdue: c.nextFollowUpDueAt ? c.nextFollowUpDueAt < todayStart : false,
      isDueToday: c.nextFollowUpDueAt 
        ? c.nextFollowUpDueAt >= todayStart && c.nextFollowUpDueAt <= todayEnd 
        : false,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("[API] GET /api/conversations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
