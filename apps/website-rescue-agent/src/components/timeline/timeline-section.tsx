"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";
import { History, Clock, FileText, TrendingUp, Globe, LayoutTemplate, Send, AlertTriangle, CheckCircle, XCircle, Activity, Target } from "lucide-react";

export interface TimelineEvent {
  id: string;
  eventType: string;
  timestamp: Date;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  severity: string | null;
  isSystem: boolean;
  metadata: Record<string, unknown> | null;
}

interface TimelineSectionProps {
  events: TimelineEvent[];
}

export function TimelineSection({ events }: TimelineSectionProps) {
  const [filter, setFilter] = React.useState<string>("ALL");

  const filteredEvents = filter === "ALL" 
    ? events 
    : events.filter((e) => {
        if (filter === "ERROR") return e.severity === "ERROR" || e.severity === "CRITICAL" || e.eventType === "ERROR";
        if (filter === "OUTREACH") return e.eventType === "OUTREACH" || e.eventType === "SEND";
        if (filter === "WORKFLOW") return e.eventType === "WORKFLOW" || e.eventType === "SYSTEM";
        return true;
      });

  const filters = [
    { key: "ALL", label: "Alle", count: events.length },
    { key: "WORKFLOW", label: "Workflow", count: events.filter((e) => e.eventType === "WORKFLOW" || e.eventType === "SYSTEM").length },
    { key: "OUTREACH", label: "Outreach", count: events.filter((e) => e.eventType === "OUTREACH" || e.eventType === "SEND").length },
    { key: "ERROR", label: "Fehler", count: events.filter((e) => e.severity === "ERROR" || e.severity === "CRITICAL").length },
  ];

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
      {/* Header mit Filtern */}
      <div className="px-5 py-4 border-b border-zinc-800 space-y-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-zinc-600" />
          <h3 className="text-sm font-semibold text-white">Verlauf & Timeline</h3>
          <span className="ml-auto text-xs text-zinc-600">{filteredEvents.length} von {events.length}</span>
        </div>
        
        {/* Filter-Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-md transition-colors",
                filter === f.key
                  ? "bg-zinc-700 text-white"
                  : "bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              )}
            >
              {f.label}
              <span className="ml-1.5 text-zinc-600">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <Clock className="h-5 w-5 text-zinc-700 mb-2" />
          <p className="text-xs text-zinc-600">Keine Ereignisse für diesen Filter.</p>
        </div>
      ) : (
        <div className="px-5 py-4 space-y-3 max-h-96 overflow-y-auto">
          {filteredEvents.map((event, i) => (
            <div key={event.id} className="flex items-start gap-3 group">
              {/* Icon/Indicator */}
              <div className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 group-hover:bg-zinc-700 transition-colors",
                event.color
              )}>
                {event.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Titel und Zeit */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-white font-medium">{event.title}</span>
                  {event.isSystem && (
                    <span className="text-[10px] px-1 py-0.5 rounded bg-zinc-800 text-zinc-500">System</span>
                  )}
                  {event.severity === "ERROR" && (
                    <span className="text-[10px] px-1 py-0.5 rounded bg-red-500/10 text-red-400">Fehler</span>
                  )}
                  {event.severity === "WARNING" && (
                    <span className="text-[10px] px-1 py-0.5 rounded bg-amber-500/10 text-amber-400">Warnung</span>
                  )}
                  <span className="text-xs text-zinc-600 tabular-nums ml-auto">
                    {formatDateTime(event.timestamp)}
                  </span>
                </div>
                
                {/* Beschreibung */}
                {event.description && (
                  <p className="text-xs text-zinc-500 mt-0.5">{event.description}</p>
                )}
                
                {/* Metadaten (optional) */}
                {event.metadata && (event.metadata.score !== undefined || event.metadata.pageCount !== undefined) && (
                  <div className="flex gap-3 mt-1.5">
                    {event.metadata.score !== undefined && (
                      <span className="text-[10px] text-zinc-600">Score: {Math.round(Number(event.metadata.score))}/100</span>
                    )}
                    {event.metadata.pageCount !== undefined && (
                      <span className="text-[10px] text-zinc-600">{String(event.metadata.pageCount)} Seiten</span>
                    )}
                    {event.metadata.hasPlaceholders !== undefined && (
                      <span className={cn(
                        "text-[10px]",
                        event.metadata.hasPlaceholders ? "text-amber-400" : "text-emerald-400"
                      )}>
                        {event.metadata.hasPlaceholders ? "Mit Platzhaltern" : "Keine Platzhalter"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
