"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatDateTime, formatRelative } from "@/lib/utils";
import { ConversationStatus, ReplySentiment, type Conversation, type Reply, type FollowUp } from "@/types";
import {
  ConversationStatusBadge,
  ReplySentimentBadge,
  FollowUpCounter,
  ReplyForm,
  type ReplyFormData,
} from "@/components/conversations";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  AlertCircle,
  Inbox,
  History,
  User,
  FileText,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ConversationSectionProps {
  companyId: string;
  conversation: (Conversation & { replies: Reply[]; followUps: FollowUp[] }) | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER: Timeline Events aus Conversation-Daten generieren
// ═══════════════════════════════════════════════════════════════════════════════

type TimelineEvent = {
  id: string;
  type: "INITIAL_SENT" | "REPLY_RECEIVED" | "FOLLOW_UP_CREATED" | "FOLLOW_UP_SENT" | "CLOSED";
  timestamp: Date;
  title: string;
  description?: string;
  metadata?: {
    sentiment?: ReplySentiment;
    sequenceNumber?: number;
    notes?: string;
    createdBy?: string;
    content?: string;
  };
};

function generateTimelineEvents(
  conversation: Conversation & { replies: Reply[]; followUps: FollowUp[] }
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Initialer Versand
  events.push({
    id: `${conversation.id}-initial`,
    type: "INITIAL_SENT",
    timestamp: conversation.firstSentAt,
    title: "Outreach versendet",
    description: "Erste Kontaktaufnahme",
  });

  // Follow-ups
  conversation.followUps.forEach((fu) => {
    events.push({
      id: fu.id,
      type: fu.sentAt ? "FOLLOW_UP_SENT" : "FOLLOW_UP_CREATED",
      timestamp: fu.sentAt || fu.createdAt,
      title: fu.sentAt ? `Follow-up ${fu.sequenceNumber} versendet` : `Follow-up ${fu.sequenceNumber} geplant`,
      description: fu.sentAt ? undefined : `Fällig: ${formatDateTime(fu.dueAt)}`,
      metadata: { sequenceNumber: fu.sequenceNumber },
    });
  });

  // Replies
  conversation.replies.forEach((reply) => {
    events.push({
      id: reply.id,
      type: "REPLY_RECEIVED",
      timestamp: reply.receivedAt,
      title: "Antwort erhalten",
      description: reply.content || undefined,
      metadata: {
        sentiment: reply.sentiment,
        notes: reply.notes || undefined,
        createdBy: reply.createdBy,
        content: reply.content || undefined,
      },
    });
  });

  // Geschlossen
  if (!isActiveStatus(conversation.status)) {
    events.push({
      id: `${conversation.id}-closed`,
      type: "CLOSED",
      timestamp: conversation.lastContactAt,
      title: conversation.status === "CLOSED_WON" ? "Gewonnen" : 
             conversation.status === "CLOSED_LOST" ? "Verloren" : 
             "Keine Antwort",
      description: conversation.status === "NO_REPLY_CLOSED" 
        ? "Nach 3 Follow-ups keine Antwort erhalten" 
        : undefined,
    });
  }

  // Chronologisch sortieren (neueste zuerst)
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function isActiveStatus(status: ConversationStatus): boolean {
  return ["PENDING", "REPLIED", "FOLLOW_UP_SENT"].includes(status);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIMELINE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function Timeline({ events }: { events: TimelineEvent[] }) {
  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "INITIAL_SENT": return <Send className="h-3.5 w-3.5" />;
      case "FOLLOW_UP_SENT": return <Send className="h-3.5 w-3.5" />;
      case "FOLLOW_UP_CREATED": return <Clock className="h-3.5 w-3.5" />;
      case "REPLY_RECEIVED": return <MessageSquare className="h-3.5 w-3.5" />;
      case "CLOSED": return <CheckCircle className="h-3.5 w-3.5" />;
    }
  };

  const getEventStyles = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "INITIAL_SENT": return "bg-sky-500/10 text-sky-400";
      case "FOLLOW_UP_SENT": return "bg-sky-500/10 text-sky-400";
      case "FOLLOW_UP_CREATED": return "bg-amber-500/10 text-amber-400";
      case "REPLY_RECEIVED": return "bg-emerald-500/10 text-emerald-400";
      case "CLOSED": return "bg-zinc-800 text-zinc-500";
    }
  };

  return (
    <div className="relative">
      {/* Vertikale Linie */}
      <div className="absolute left-[18px] top-2 bottom-2 w-px bg-zinc-800" />

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="relative flex items-start gap-3">
            <div className={cn(
              "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-800",
              getEventStyles(event.type)
            )}>
              {getEventIcon(event.type)}
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-zinc-200">{event.title}</span>
                {event.metadata?.sentiment && (
                  <ReplySentimentBadge sentiment={event.metadata.sentiment} />
                )}
                <span className="text-xs text-zinc-600 ml-auto tabular-nums">
                  {formatRelative(event.timestamp)}
                </span>
              </div>

              {event.description && (
                <p className="text-xs text-zinc-500 mt-0.5">{event.description}</p>
              )}

              {event.metadata?.content && (
                <div className="mt-2 p-2 rounded bg-zinc-950/50 border border-zinc-800/50">
                  <p className="text-xs text-zinc-400 line-clamp-3">&ldquo;{event.metadata.content}&rdquo;</p>
                </div>
              )}

              {event.metadata?.notes && (
                <div className="mt-1.5 flex items-start gap-1.5">
                  <FileText className="h-3 w-3 text-zinc-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-zinc-600 italic">{event.metadata.notes}</p>
                </div>
              )}

              {event.metadata?.createdBy && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <User className="h-3 w-3 text-zinc-600" />
                  <span className="text-xs text-zinc-600">{event.metadata.createdBy}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ConversationSection({ companyId, conversation }: ConversationSectionProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [optimisticConversation, setOptimisticConversation] = React.useState(conversation);

  // Sync mit Prop wenn sich etwas ändert (z.B. nach Server Refresh)
  React.useEffect(() => {
    setOptimisticConversation(conversation);
  }, [conversation]);

  const handleAddReply = async (data: ReplyFormData) => {
    if (!optimisticConversation) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/conversations/${optimisticConversation.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Antwort konnte nicht gespeichert werden");
      }

      // Reload page to get fresh data (einfacher als komplexe State-Updates)
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern");
      setIsLoading(false);
    }
  };

  const handleCreateFollowUp = async () => {
    if (!optimisticConversation) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/conversations/${optimisticConversation.id}/follow-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Follow-up konnte nicht erstellt werden");
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Erstellen");
      setIsLoading(false);
    }
  };

  const handleClose = async (status: "CLOSED_WON" | "CLOSED_LOST") => {
    if (!optimisticConversation) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/conversations/${optimisticConversation.id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Conversation konnte nicht geschlossen werden");
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Schließen");
      setIsLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // EMPTY STATE: Keine Conversation
  // ═══════════════════════════════════════════════════════════════════════════
  if (!optimisticConversation) {
    return (
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Inbox className="h-4 w-4 text-zinc-600" />
          <h3 className="text-sm font-semibold text-white">Conversation</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 mb-3">
            <Send className="h-5 w-5 text-zinc-600" />
          </div>
          <p className="text-sm text-zinc-400">Noch keine Conversation</p>
          <p className="text-xs text-zinc-600 mt-1 max-w-xs">
            Nach dem Versand des ersten Outreach wird hier die Conversation angezeigt.
          </p>
        </div>
      </div>
    );
  }

  const isActive = isActiveStatus(optimisticConversation.status);
  const timelineEvents = generateTimelineEvents(optimisticConversation);
  const lastReply = optimisticConversation.replies[0];

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-4 w-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-white">Conversation</h3>
          <ConversationStatusBadge
            status={optimisticConversation.status}
            followUpCount={optimisticConversation.followUpCount}
          />
          {lastReply && (
            <ReplySentimentBadge sentiment={lastReply.sentiment} />
          )}
        </div>

        <div className="flex items-center gap-2">
          <FollowUpCounter
            current={optimisticConversation.followUpCount}
            max={3}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-6">
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Aktive Aktionen (nur wenn Conversation aktiv) */}
        {isActive && (
          <div className="space-y-4">
            {/* Reply-Form (immer sichtbar bei aktiver Conversation) */}
            <div className="rounded-lg bg-zinc-950/50 border border-zinc-800/50 p-4">
              <h4 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-zinc-500" />
                Antwort erfassen
              </h4>
              <ReplyForm
                onSubmit={handleAddReply}
                disabled={isLoading}
              />
            </div>

            {/* Aktions-Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800">
              {/* Follow-up Button */}
              <button
                type="button"
                onClick={handleCreateFollowUp}
                disabled={isLoading || optimisticConversation.followUpCount >= 3}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border transition-colors",
                  optimisticConversation.followUpCount >= 3
                    ? "bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed opacity-60"
                    : optimisticConversation.followUpCount === 2
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                    : "bg-sky-600 hover:bg-sky-500 text-white border-transparent"
                )}
              >
                <Send className="h-3.5 w-3.5" />
                {optimisticConversation.followUpCount === 0
                  ? "Follow-up erstellen"
                  : `Follow-up ${optimisticConversation.followUpCount + 1}`}
              </button>

              <div className="flex-1" />

              {/* Close Buttons */}
              <button
                type="button"
                onClick={() => handleClose("CLOSED_LOST")}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
              >
                <XCircle className="h-3.5 w-3.5" />
                Verloren
              </button>
              <button
                type="button"
                onClick={() => handleClose("CLOSED_WON")}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Gewonnen
              </button>
            </div>
          </div>
        )}

        {/* Geschlossen-Hinweis */}
        {!isActive && (
          <div className={cn(
            "flex items-start gap-3 p-4 rounded-lg border",
            optimisticConversation.status === "CLOSED_WON"
              ? "bg-emerald-500/10 border-emerald-500/20"
              : optimisticConversation.status === "CLOSED_LOST"
              ? "bg-zinc-800 border-zinc-700"
              : "bg-zinc-800 border-zinc-700"
          )}>
            {optimisticConversation.status === "CLOSED_WON" ? (
              <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : optimisticConversation.status === "CLOSED_LOST" ? (
              <XCircle className="h-5 w-5 text-zinc-500 shrink-0" />
            ) : (
              <Clock className="h-5 w-5 text-zinc-500 shrink-0" />
            )}
            <div>
              <p className={cn(
                "text-sm font-medium",
                optimisticConversation.status === "CLOSED_WON" ? "text-emerald-400" : "text-zinc-400"
              )}>
                {optimisticConversation.status === "CLOSED_WON"
                  ? "Diese Conversation wurde erfolgreich abgeschlossen."
                  : optimisticConversation.status === "CLOSED_LOST"
                  ? "Diese Conversation wurde als verloren markiert."
                  : "Diese Conversation wurde wegen fehlender Antwort geschlossen."}
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                Keine weiteren Aktionen möglich.
              </p>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-4 w-4 text-zinc-600" />
            <h4 className="text-sm font-medium text-zinc-300">Verlauf</h4>
            <span className="text-xs text-zinc-600">{timelineEvents.length} Ereignisse</span>
          </div>

          {timelineEvents.length > 0 ? (
            <Timeline events={timelineEvents} />
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Clock className="h-5 w-5 text-zinc-700 mb-2" />
              <p className="text-xs text-zinc-600">Noch keine Aktivitäten</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
