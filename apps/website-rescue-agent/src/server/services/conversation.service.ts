/**
 * Conversation Service
 * 
 * Zentrale Business-Logik für Conversation / Follow-up / Reply Management.
 * Alle Guards und Validierungen sind hier implementiert.
 */

import { db } from "@/lib/db";
import {
  ConversationStatus,
  ReplySentiment,
  FollowUpStatus,
  ACTIVE_CONVERSATION_STATUSES,
  type ReplyData,
  type ConversationFilter,
} from "@/types";
import { addDays, isAfter, isBefore } from "date-fns";

// ═══════════════════════════════════════════════════════════════════════════════
// HILFSFUNKTIONEN / GUARDS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Prüft, ob für einen Lead bereits eine aktive Conversation existiert.
 * Aktive Status: PENDING, REPLIED, FOLLOW_UP_SENT
 */
async function hasActiveConversation(companyId: string): Promise<boolean> {
  const activeConversation = await db.conversation.findFirst({
    where: {
      companyId,
      status: { in: ACTIVE_CONVERSATION_STATUSES },
    },
  });
  return !!activeConversation;
}

/**
 * Holt eine Conversation mit allen Relations.
 * Wirft Error wenn nicht gefunden.
 */
async function getConversationOrThrow(id: string) {
  const conversation = await db.conversation.findUnique({
    where: { id },
    include: {
      company: true,
      initialOutreach: true,
      replies: { orderBy: { createdAt: "desc" } },
      followUps: { orderBy: { sequenceNumber: "asc" } },
    },
  });
  
  if (!conversation) {
    throw new Error(`Conversation ${id} nicht gefunden`);
  }
  
  return conversation;
}

/**
 * Prüft, ob eine Conversation aktiv ist (nicht geschlossen).
 */
function isConversationActive(status: ConversationStatus): boolean {
  return ACTIVE_CONVERSATION_STATUSES.includes(status as any);
}

/**
 * Berechnet das nächste Follow-up-Datum basierend auf der Sequence-Nummer.
 * Intervalle: 1 → +3 Tage, 2 → +7 Tage, 3 → +14 Tage
 */
function calculateNextFollowUpDate(sequenceNumber: number, fromDate: Date): Date {
  const daysToAdd = sequenceNumber === 1 ? 3 : sequenceNumber === 2 ? 7 : 14;
  return addDays(fromDate, daysToAdd);
}

// ═══════════════════════════════════════════════════════════════════════════════
// HAUPT-SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

export const ConversationService = {
  
  // ─────────────────────────────────────────────────────────────────────────────
  // CONVERSATION ERSTELLEN
  // ─────────────────────────────────────────────────────────────────────────────
  
  /**
   * Erstellt eine neue Conversation für einen Lead.
   * 
   * GUARD: Prüft, ob bereits eine aktive Conversation existiert.
   * Wenn ja → Error (keine doppelten aktiven Conversations pro Lead).
   */
  async createConversation(
    companyId: string,
    initialOutreachId: string,
    firstSentAt: Date = new Date()
  ) {
    // GUARD: Aktive Conversation existiert bereits?
    if (await hasActiveConversation(companyId)) {
      throw new Error(
        `Für Lead ${companyId} existiert bereits eine aktive Conversation. ` +
        `Schließe die bestehende Conversation (CLOSED_WON/LOST/NO_REPLY_CLOSED), ` +
        `bevor du eine neue erstellst.`
      );
    }
    
    const conversation = await db.conversation.create({
      data: {
        companyId,
        initialOutreachId,
        status: ConversationStatus.PENDING,
        firstSentAt,
        lastContactAt: firstSentAt,
        followUpCount: 0,
        nextFollowUpDueAt: calculateNextFollowUpDate(1, firstSentAt),
      },
      include: {
        company: { select: { id: true, name: true, domain: true } },
        initialOutreach: true,
      },
    });
    
    console.log(`[ConversationService] Created for company ${companyId}: ${conversation.id}`);
    return conversation;
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // REPLY ERFASSEN
  // ─────────────────────────────────────────────────────────────────────────────
  
  /**
   * Erfasst eine eingehende Antwort auf eine Conversation.
   * 
   * GUARD: Nur aktive Conversations können Antworten erhalten.
   * EFFEKT: Setzt Status auf REPLIED, stoppt Follow-up-Logik.
   */
  async addReply(
    conversationId: string,
    data: ReplyData
  ) {
    const conversation = await getConversationOrThrow(conversationId);
    
    // GUARD: Conversation aktiv?
    if (!isConversationActive(conversation.status as ConversationStatus)) {
      throw new Error(
        `Conversation ${conversationId} ist nicht aktiv (Status: ${conversation.status}). ` +
        `Nur aktive Conversations können Antworten erhalten.`
      );
    }
    
    // GUARD: Sentiment valid?
    if (!Object.values(ReplySentiment).includes(data.sentiment)) {
      throw new Error(`Ungültiges Sentiment: ${data.sentiment}`);
    }
    
    const now = new Date();
    
    // Reply erstellen
    const reply = await db.reply.create({
      data: {
        conversationId,
        sentiment: data.sentiment,
        content: data.content ?? null,
        notes: data.notes ?? null,
        createdBy: data.createdBy,
        receivedAt: now,
      },
    });
    
    // Conversation aktualisieren
    // EFFEKT: Follow-up-Logik stoppt durch replyReceivedAt und Status-Änderung
    await db.conversation.update({
      where: { id: conversationId },
      data: {
        status: ConversationStatus.REPLIED,
        currentSentiment: data.sentiment,
        replyReceivedAt: now,
        lastContactAt: now,
        // WICHTIG: nextFollowUpDueAt wird NICHT aktualisiert,
        // da Antwort eingegangen ist → Follow-up-Logik stoppt
      },
    });
    
    console.log(`[ConversationService] Reply added to ${conversationId}: ${data.sentiment}`);
    return reply;
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // FOLLOW-UP ERSTELLEN
  // ─────────────────────────────────────────────────────────────────────────────
  
  /**
   * Erzeugt ein Follow-up für eine Conversation.
   * 
   * GUARD: Nur aktive Conversations können Follow-ups erhalten.
   * GUARD: Max 3 Follow-ups pro Conversation.
   * 
   * EFFEKT: Erhöht followUpCount, berechnet nächstes Fälligkeitsdatum.
   */
  async createFollowUp(
    conversationId: string,
    outreachDraftId?: string
  ) {
    const conversation = await getConversationOrThrow(conversationId);
    
    // GUARD: Conversation aktiv?
    if (!isConversationActive(conversation.status as ConversationStatus)) {
      throw new Error(
        `Conversation ${conversationId} ist nicht aktiv (Status: ${conversation.status}). ` +
        `Geschlossene Conversations können keine Follow-ups erhalten.`
      );
    }
    
    // GUARD: Max 3 Follow-ups?
    const nextSequence = conversation.followUpCount + 1;
    if (nextSequence > 3) {
      throw new Error(
        `Maximale Anzahl Follow-ups (3) für Conversation ${conversationId} erreicht. ` +
        `Conversation sollte auf NO_REPLY_CLOSED gesetzt werden.`
      );
    }
    
    const now = new Date();
    const nextDueAt = calculateNextFollowUpDate(nextSequence, now);
    
    // FollowUp erstellen
    const followUp = await db.followUp.create({
      data: {
        conversationId,
        sequenceNumber: nextSequence,
        status: FollowUpStatus.DRAFT,
        outreachDraftId: outreachDraftId ?? null,
        dueAt: nextDueAt,
      },
    });
    
    // Conversation aktualisieren
    await db.conversation.update({
      where: { id: conversationId },
      data: {
        status: ConversationStatus.FOLLOW_UP_SENT,
        followUpCount: nextSequence,
        lastContactAt: now,
        nextFollowUpDueAt: nextDueAt,
      },
    });
    
    console.log(`[ConversationService] FollowUp ${nextSequence} created for ${conversationId}`);
    return followUp;
  },
  
  /**
   * Markiert ein Follow-up als versendet.
   */
  async markFollowUpAsSent(followUpId: string) {
    const followUp = await db.followUp.update({
      where: { id: followUpId },
      data: {
        status: FollowUpStatus.SENT,
        sentAt: new Date(),
      },
    });
    
    console.log(`[ConversationService] FollowUp ${followUpId} marked as SENT`);
    return followUp;
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // CONVERSATION SCHLIESSEN
  // ─────────────────────────────────────────────────────────────────────────────
  
  /**
   * Schließt eine Conversation ab.
   * 
   * GUARD: Nur CLOSED_WON oder CLOSED_LOST erlaubt.
   * GUARD: Conversation muss existieren.
   */
  async closeConversation(
    conversationId: string,
    status: ConversationStatus,
    notes?: string
  ) {
    // GUARD: Nur erlaubte Close-Status
    if (status !== "CLOSED_WON" && status !== "CLOSED_LOST") {
      throw new Error(
        `Ungültiger Close-Status: ${status}. ` +
        `Erlaubt sind nur: CLOSED_WON, CLOSED_LOST.`
      );
    }
    
    const conversation = await getConversationOrThrow(conversationId);
    
    // Optional: Prüfen, ob Conversation bereits geschlossen ist
    if (!isConversationActive(conversation.status as ConversationStatus)) {
      console.warn(`[ConversationService] Conversation ${conversationId} ist bereits geschlossen.`);
    }
    
    const updated = await db.conversation.update({
      where: { id: conversationId },
      data: {
        status,
        // nextFollowUpDueAt auf null setzen (keine Follow-ups mehr nötig)
        nextFollowUpDueAt: null,
      },
    });
    
    console.log(`[ConversationService] Conversation ${conversationId} closed: ${status}`);
    return updated;
  },
  
  /**
   * Schließt eine Conversation wegen fehlender Antwort.
   * Wird automatisch nach 3 Follow-ups ohne Antwort aufgerufen.
   */
  async closeDueToNoReply(conversationId: string) {
    const conversation = await getConversationOrThrow(conversationId);
    
    if (conversation.followUpCount < 3) {
      throw new Error(
        `Conversation ${conversationId} hat erst ${conversation.followUpCount} Follow-ups. ` +
        `NO_REPLY_CLOSED erst nach 3 Follow-ups erlaubt.`
      );
    }
    
    const updated = await db.conversation.update({
      where: { id: conversationId },
      data: {
        status: ConversationStatus.NO_REPLY_CLOSED,
        nextFollowUpDueAt: null,
      },
    });
    
    console.log(`[ConversationService] Conversation ${conversationId} closed: NO_REPLY_CLOSED`);
    return updated;
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // QUERIES / FILTER
  // ─────────────────────────────────────────────────────────────────────────────
  
  /**
   * Holt eine einzelne Conversation mit allen Details.
   */
  async getConversation(id: string) {
    return getConversationOrThrow(id);
  },
  
  /**
   * Holt alle Conversations für einen Lead.
   */
  async getConversationsByCompany(companyId: string) {
    return db.conversation.findMany({
      where: { companyId },
      include: {
        replies: { orderBy: { createdAt: "desc" } },
        followUps: { orderBy: { sequenceNumber: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  
  /**
   * Filtert Conversations mit verschiedenen Kriterien.
   * Für Dashboard und Outreach-Seite.
   */
  async getConversations(filter: ConversationFilter = {}) {
    const where: any = {};
    
    if (filter.status) {
      where.status = filter.status;
    }
    
    if (filter.companyId) {
      where.companyId = filter.companyId;
    }
    
    if (filter.hasReply === true) {
      where.replyReceivedAt = { not: null };
    } else if (filter.hasReply === false) {
      where.replyReceivedAt = null;
    }
    
    if (filter.followUpDue === true) {
      where.nextFollowUpDueAt = { not: null, lte: new Date() };
    }
    
    if (filter.overdue === true) {
      where.nextFollowUpDueAt = { not: null, lt: new Date() };
      where.status = { in: ACTIVE_CONVERSATION_STATUSES };
    }
    
    return db.conversation.findMany({
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
        replies: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: [
        { nextFollowUpDueAt: "asc" },
        { company: { opportunityScore: "desc" } },
      ],
    });
  },
  
  /**
   * Dashboard-Statistiken für Conversations.
   */
  async getDashboardStats() {
    const now = new Date();
    
    const [
      totalActive,
      repliesToday,
      repliesLast7Days,
      followUpDueToday,
      overdue,
      positiveReplies,
      closedWon,
      closedLost,
    ] = await Promise.all([
      // Aktive Conversations
      db.conversation.count({
        where: { status: { in: ACTIVE_CONVERSATION_STATUSES } },
      }),
      
      // Antworten heute
      db.reply.count({
        where: { receivedAt: { gte: new Date(now.setHours(0, 0, 0, 0)) } },
      }),
      
      // Antworten letzte 7 Tage
      db.reply.count({
        where: { receivedAt: { gte: addDays(now, -7) } },
      }),
      
      // Follow-up heute fällig
      db.conversation.count({
        where: {
          nextFollowUpDueAt: {
            gte: new Date(now.setHours(0, 0, 0, 0)),
            lt: new Date(now.setHours(23, 59, 59, 999)),
          },
          status: { in: ACTIVE_CONVERSATION_STATUSES },
        },
      }),
      
      // Überfällige Follow-ups
      db.conversation.count({
        where: {
          nextFollowUpDueAt: { lt: now },
          status: { in: ACTIVE_CONVERSATION_STATUSES },
        },
      }),
      
      // Positive Antworten
      db.reply.count({
        where: { sentiment: ReplySentiment.POSITIVE },
      }),
      
      // Gewonnen
      db.conversation.count({
        where: { status: ConversationStatus.CLOSED_WON },
      }),
      
      // Verloren
      db.conversation.count({
        where: { status: ConversationStatus.CLOSED_LOST },
      }),
    ]);
    
    return {
      totalActive,
      repliesToday,
      repliesLast7Days,
      followUpDueToday,
      overdue,
      positiveReplies,
      closedWon,
      closedLost,
    };
  },
  
}; // Ende ConversationService
