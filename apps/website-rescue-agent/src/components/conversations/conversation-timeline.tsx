"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatDateTime, formatRelative } from "@/lib/utils";
import { ConversationStatus, ReplySentiment, FollowUpStatus } from "@/types";
import { ReplySentimentBadge, ConversationStatusBadge } from "./conversation-status";
import {
  Send,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  ArchiveX,
  AlertCircle,
  Calendar,
  User,
  MoreHorizontal,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type TimelineEventType =
  | "INITIAL_SENT"      // Erster Outreach versendet
  | "REPLY_RECEIVED"    // Antwort erfasst
  | "FOLLOW_UP_CREATED" // Follow-up erstellt (Draft)
  | "FOLLOW_UP_SENT"    // Follow-up tatsächlich versendet
  | "CLOSED_WON"        // Gewonnen
  | "CLOSED_LOST"       // Verloren
  | "NO_REPLY_CLOSED";  // Keine Antwort nach max Follow-ups

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: Date;
  title: string;
  description?: string;
  metadata?: {
    sentiment?: ReplySentiment;
    sequenceNumber?: number;
    followUpStatus?: FollowUpStatus;
    notes?: string;
    createdBy?: string;
    content?: string;
  };
}

interface ConversationTimelineProps {
  events: TimelineEvent[];
  className?: string;
  emptyMessage?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

interface EventConfig {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
}

const EVENT_CONFIG: Record<TimelineEventType, EventConfig> = {
  INITIAL_SENT: {
    icon: <Send className="h-3.5 w-3.5" />,
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-400",
    label: "Initialer Versand",
  },
  REPLY_RECEIVED: {
    icon: <MessageCircle className="h-3.5 w-3.5" />,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    label: "Antwort erfasst",
  },
  FOLLOW_UP_CREATED: {
    icon: <Clock className="h-3.5 w-3.5" />,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    label: "Follow-up geplant",
  },
  FOLLOW_UP_SENT: {
    icon: <Send className="h-3.5 w-3.5" />,
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-400",
    label: "Follow-up versendet",
  },
  CLOSED_WON: {
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    label: "Gewonnen",
  },
  CLOSED_LOST: {
    icon: <XCircle className="h-3.5 w-3.5" />,
    iconBg: "bg-zinc-800",
    iconColor: "text-zinc-500",
    label: "Verloren",
  },
  NO_REPLY_CLOSED: {
    icon: <ArchiveX className="h-3.5 w-3.5" />,
    iconBg: "bg-zinc-800",
    iconColor: "text-zinc-500",
    label: "Keine Antwort",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════════════════════════════════════

function sortEventsChronologically(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

function formatEventDescription(event: TimelineEvent): string | undefined {
  if (event.description) return event.description;

  switch (event.type) {
    case "FOLLOW_UP_CREATED":
      return event.metadata?.sequenceNumber 
        ? `Follow-up ${event.metadata.sequenceNumber} erstellt` 
        : undefined;
    
    case "FOLLOW_UP_SENT":
      return event.metadata?.sequenceNumber 
        ? `Follow-up ${event.metadata.sequenceNumber} versendet` 
        : undefined;
    
    case "NO_REPLY_CLOSED":
      return "Nach 3 Follow-ups keine Antwort erhalten";
    
    default:
      return undefined;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ConversationTimeline({
  events,
  className,
  emptyMessage = "Noch keine Aktivitäten",
}: ConversationTimelineProps) {
  const sortedEvents = sortEventsChronologically(events);

  if (sortedEvents.length === 0) {
    return (
      <div className={cn("rounded-xl bg-zinc-900 border border-zinc-800 p-6", className)}>
        <div className="flex flex-col items-center justify-center text-center py-4">
          <Calendar className="h-5 w-5 text-zinc-700 mb-2" />
          <p className="text-sm text-zinc-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-zinc-600" />
          <h3 className="text-sm font-medium text-zinc-300">Verlauf</h3>
        </div>
        <span className="text-xs text-zinc-600">{sortedEvents.length} Ereignisse</span>
      </div>

      {/* Timeline */}
      <div className="px-4 py-4">
        <div className="relative">
          {/* Vertikale Linie */}
          <div className="absolute left-[18px] top-2 bottom-2 w-px bg-zinc-800" />

          {/* Events */}
          <div className="space-y-4">
            {sortedEvents.map((event, index) => {
              const config = EVENT_CONFIG[event.type];
              const isLast = index === sortedEvents.length - 1;
              const description = formatEventDescription(event);

              return (
                <div key={event.id} className="relative flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                      config.iconBg,
                      config.iconColor,
                      "border-zinc-800"
                    )}
                  >
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    {/* Header Row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-zinc-200">
                        {event.title || config.label}
                      </span>
                      
                      {/* Sentiment Badge für Reply-Events */}
                      {event.metadata?.sentiment && (
                        <ReplySentimentBadge sentiment={event.metadata.sentiment} />
                      )}

                      {/* Timestamp */}
                      <span className="text-xs text-zinc-600 ml-auto tabular-nums">
                        {formatRelative(event.timestamp)}
                      </span>
                    </div>

                    {/* Description */}
                    {description && (
                      <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
                    )}

                    {/* Reply Content (collapsed/expandable potenziell) */}
                    {event.metadata?.content && (
                      <div className="mt-2 p-2 rounded bg-zinc-950/50 border border-zinc-800/50">
                        <p className="text-xs text-zinc-400 line-clamp-3">
                          &ldquo;{event.metadata.content}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Interne Notiz */}
                    {event.metadata?.notes && (
                      <div className="mt-1.5 flex items-start gap-1.5">
                        <AlertCircle className="h-3 w-3 text-zinc-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-zinc-600 italic">
                          {event.metadata.notes}
                        </p>
                      </div>
                    )}

                    {/* Created By */}
                    {event.metadata?.createdBy && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <User className="h-3 w-3 text-zinc-600" />
                        <span className="text-xs text-zinc-600">
                          {event.metadata.createdBy}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPACT VARIANT (für Listen/Übersichten)
// ═══════════════════════════════════════════════════════════════════════════════

interface CompactTimelineProps {
  lastEvent?: TimelineEvent;
  eventCount: number;
  className?: string;
}

export function CompactTimeline({
  lastEvent,
  eventCount,
  className,
}: CompactTimelineProps) {
  if (!lastEvent) {
    return (
      <div className={cn("flex items-center gap-2 text-zinc-600", className)}>
        <Clock className="h-3.5 w-3.5" />
        <span className="text-xs">Keine Aktivität</span>
      </div>
    );
  }

  const config = EVENT_CONFIG[lastEvent.type];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("flex h-5 w-5 items-center justify-center rounded-full", config.iconBg)}>
        <span className={config.iconColor}>{config.icon}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-zinc-400">{config.label}</span>
        <span className="text-[10px] text-zinc-600">
          {formatRelative(lastEvent.timestamp)}
          {eventCount > 1 && ` · ${eventCount} Ereignisse`}
        </span>
      </div>
    </div>
  );
}
