"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { IconWrapper } from "@/components/ui/icon-wrapper";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatDateTime, cn } from "@/lib/utils";
import { LeadStatus, ConversationStatus } from "@/types";
import Link from "next/link";
import {
  AlertTriangle, CheckCircle, Send, Inbox, ArrowRight,
  Clock, ShieldCheck, MessageSquare, Edit3, Ban,
  Filter, Search, ThumbsUp, ThumbsDown, Minus,
  Archive, XCircle, CheckCircle2, Plus
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// TYPEN
// ═══════════════════════════════════════════════════════════════════════════

interface OutreachItem {
  id: string;
  companyId: string;
  company: { name: string; id: string; status: string; domain: string };
  recipientName: string | null;
  recipientEmail: string | null;
  recipientRole: string | null;
  subject: string | null;
  status: string;
  hasUnreviewedPlaceholders: boolean;
  isBlockedForSend: boolean;
  blockReason: string | null;
  redFlags: string | null;
  editCount: number;
  lastEditedAt: string | null;
  approvedAt: string | null;
  sentAt: string | null;
  sentStatus: string | null;
  sentError: string | null;
  messageId: string | null;
  createdAt: string;
}

interface ConversationItem {
  id: string;
  companyId: string;
  company: { id: string; name: string; domain: string; opportunityScore: number | null; status: string };
  status: string;
  currentSentiment: string | null;
  followUpCount: number;
  nextFollowUpDueAt: string | null;
  lastContactAt: string;
  replyReceivedAt: string | null;
  firstSentAt: string;
  lastReply: { id: string; sentiment: string; content: string | null; receivedAt: string; createdBy: string } | null;
  followUps: { id: string; sequenceNumber: number; status: string; dueAt: string; sentAt: string | null }[];
  isOverdue: boolean;
  isDueToday: boolean;
}

const conversationFilters = [
  { key: "all", label: "Alle", color: "zinc" as const },
  { key: "active", label: "Aktiv", color: "emerald" as const },
  { key: "replied", label: "Antworten", color: "violet" as const },
  { key: "due-today", label: "Heute fällig", color: "amber" as const },
  { key: "overdue", label: "Überfällig", color: "red" as const },
  { key: "positive", label: "Positiv", color: "emerald" as const },
  { key: "negative", label: "Negativ", color: "orange" as const },
  { key: "closed", label: "Abgeschlossen", color: "zinc" as const },
];

// ═══════════════════════════════════════════════════════════════════════════
// HAUPTKOMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export default function OutreachClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"outreach" | "conversations">(
    searchParams.get("view") === "conversations" ? "conversations" : "outreach"
  );
  
  // State
  const [items, setItems] = useState<OutreachItem[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [outreachFilter, setOutreachFilter] = useState(searchParams.get("status") || "ALL");
  const [conversationFilter, setConversationFilter] = useState(searchParams.get("filter") || "all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Daten laden basierend auf URL-Parametern
  useEffect(() => {
    setLoading(true);
    
    // Filter immer aus URL lesen
    const filterFromUrl = searchParams.get("filter") || "all";
    setConversationFilter(filterFromUrl);
    
    if (activeTab === "outreach") {
      fetch("/api/outreach")
        .then((res) => res.json())
        .then((data) => { setItems(data); setLoading(false); });
    } else {
      const params = new URLSearchParams();
      if (filterFromUrl !== "all") params.set("filter", filterFromUrl);
      fetch(`/api/conversations?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => { setConversations(data); setLoading(false); });
    }
  }, [activeTab, searchParams]); // Nur bei Tab-Wechsel oder URL-Änderung laden

  // Filter-Button Handler - aktualisiert nur die URL
  const updateConversationFilter = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "conversations");
    if (filter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", filter);
    }
    router.push(`/outreach?${params.toString()}`, { scroll: false });
  };

  // Filter anwenden
  const filteredItems = items.filter((item) => {
    if (outreachFilter === "ALL") return true;
    if (outreachFilter === "BLOCKED") return item.isBlockedForSend && item.status === "DRAFT";
    if (outreachFilter === "NEEDS_REVIEW") return item.status === "DRAFT" && !item.isBlockedForSend && !item.hasUnreviewedPlaceholders;
    return item.status === outreachFilter;
  }).filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.company.name.toLowerCase().includes(q) || item.subject?.toLowerCase().includes(q);
  });

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.company.name.toLowerCase().includes(q) || c.company.domain?.toLowerCase().includes(q);
  });

  // Stats
  const outreachStats = {
    total: items.length,
    draft: items.filter((i) => i.status === "DRAFT").length,
    approved: items.filter((i) => i.status === "APPROVED").length,
    sent: items.filter((i) => i.status === "SENT").length,
    blocked: items.filter((i) => i.isBlockedForSend).length,
    needsReview: items.filter((i) => i.status === "DRAFT" && !i.isBlockedForSend && !i.hasUnreviewedPlaceholders).length,
  };

  const conversationStats = {
    total: conversations.length,
    active: conversations.filter((c) => ["PENDING", "REPLIED", "FOLLOW_UP_SENT"].includes(c.status)).length,
    replied: conversations.filter((c) => c.status === "REPLIED").length,
    dueToday: conversations.filter((c) => c.isDueToday).length,
    overdue: conversations.filter((c) => c.isOverdue).length,
    positive: conversations.filter((c) => c.currentSentiment === "POSITIVE").length,
    negative: conversations.filter((c) => ["NEGATIVE", "SPAM"].includes(c.currentSentiment || "")).length,
    closed: conversations.filter((c) => ["CLOSED_WON", "CLOSED_LOST", "NO_REPLY_CLOSED"].includes(c.status)).length,
  };

  if (loading) {
    return (
      <div className="p-6 space-y-5">
        <div className="h-8 w-32 bg-zinc-800 rounded animate-pulse" />
        <div className="h-20 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Outreach</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {activeTab === "outreach" ? "Entwürfe verwalten, freigeben und versenden" : "Conversations bearbeiten und Follow-ups managen"}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-zinc-900 border border-zinc-800 p-1" data-testid="outreach-tabs">
          <button 
            data-testid="tab-outreach" 
            data-active={activeTab === "outreach"}
            onClick={() => { setActiveTab("outreach"); router.push("/outreach"); }} 
            className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", activeTab === "outreach" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}
          >
            Entwürfe
          </button>
          <button 
            data-testid="tab-conversations" 
            data-active={activeTab === "conversations"}
            onClick={() => { setActiveTab("conversations"); router.push("/outreach?view=conversations"); }} 
            className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", activeTab === "conversations" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}
          >
            Conversations
          </button>
        </div>
      </div>

      {activeTab === "outreach" ? (
        <OutreachView items={filteredItems} stats={outreachStats} activeFilter={outreachFilter} setActiveFilter={setOutreachFilter} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      ) : (
        <ConversationsView conversations={filteredConversations} stats={conversationStats} activeFilter={conversationFilter} setActiveFilter={updateConversationFilter} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// OUTREACH VIEW
// ═══════════════════════════════════════════════════════════════════════════

function OutreachView({ items, stats, activeFilter, setActiveFilter, searchQuery, setSearchQuery }: any) {
  const handleApprove = async (id: string) => {
    const res = await fetch(`/api/outreach/${id}/approve`, { method: "POST" });
    if (res.ok) window.location.reload();
  };

  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const handleSend = async (id: string) => {
    setSendingId(id);
    setSendError(null);
    
    try {
      const res = await fetch(`/api/outreach/${id}/send`, { method: "POST" });
      const data = await res.json();
      
      if (res.ok) {
        window.location.reload();
      } else {
        setSendError(data.error || "Versand fehlgeschlagen");
        setSendingId(null);
      }
    } catch (err) {
      setSendError("Netzwerkfehler beim Versand");
      setSendingId(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        <StatCard label="Gesamt" value={stats.total} active={activeFilter === "ALL"} onClick={() => setActiveFilter("ALL")} />
        <StatCard label="Entwurf" value={stats.draft} active={activeFilter === "DRAFT"} onClick={() => setActiveFilter("DRAFT")} color="amber" />
        <StatCard label="Freigabe offen" value={stats.needsReview} active={activeFilter === "NEEDS_REVIEW"} onClick={() => setActiveFilter("NEEDS_REVIEW")} color="blue" />
        <StatCard label="Blockiert" value={stats.blocked} active={activeFilter === "BLOCKED"} onClick={() => setActiveFilter("BLOCKED")} color="red" />
        <StatCard label="Freigegeben" value={stats.approved} active={activeFilter === "APPROVED"} onClick={() => setActiveFilter("APPROVED")} color="emerald" />
        <StatCard label="Gesendet" value={stats.sent} active={activeFilter === "SENT"} onClick={() => setActiveFilter("SENT")} color="sky" />
      </div>

      <SearchBar query={searchQuery} setQuery={setSearchQuery} placeholder="Firma oder Betreff suchen..." count={items.length} total={stats.total} />

      {/* Send Error Display */}
      {sendError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 flex items-start gap-3">
          <IconWrapper icon={AlertTriangle} className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400">Versand fehlgeschlagen</p>
            <p className="text-sm text-red-300/80 mt-1">{sendError}</p>
            <p className="text-xs text-red-300/60 mt-2">Du kannst es erneut versuchen.</p>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState icon={Inbox} title="Keine Einträge" subtitle="Ändere den Filter oder die Suche" />
      ) : (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="grid grid-cols-[1fr_180px_140px_180px] gap-4 px-5 py-3 border-b border-zinc-800 bg-zinc-950/30 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <span>Lead / Nachricht</span><span>Empfänger</span><span>Status</span><span className="text-right">Aktionen</span>
          </div>
          <div className="divide-y divide-zinc-800/60">
            {items.map((item: OutreachItem) => {
              const redFlags = item.redFlags ? JSON.parse(item.redFlags) : [];
              const canEdit = item.status === "DRAFT";
              const canApprove = item.status === "DRAFT" && !item.isBlockedForSend && !item.hasUnreviewedPlaceholders;
              const canSend = item.status === "APPROVED";
              return (
                <div key={item.id} className={`grid grid-cols-[1fr_180px_140px_180px] gap-4 px-5 py-4 hover:bg-zinc-800/30 transition-colors ${item.isBlockedForSend ? "bg-red-500/5" : ""}`}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/leads/${item.companyId}`} className="text-sm font-medium text-white hover:text-zinc-200 truncate">{item.company.name}</Link>
                      <StatusBadge status={item.company.status as LeadStatus} />
                    </div>
                    <p className="text-xs text-zinc-500 truncate">{item.subject || "(kein Betreff)"}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-600">
                      {item.editCount > 0 && <span className="flex items-center gap-1"><IconWrapper icon={Edit3} className="h-3 w-3" />{item.editCount}x bearbeitet</span>}
                      {item.hasUnreviewedPlaceholders && <span className="flex items-center gap-1 text-amber-500"><IconWrapper icon={AlertTriangle} className="h-3 w-3" />Platzhalter</span>}
                      {redFlags.length > 0 && <span className="flex items-center gap-1 text-red-400"><IconWrapper icon={AlertTriangle} className="h-3 w-3" />{redFlags.length} Hinweis</span>}
                    </div>
                    {item.isBlockedForSend && item.blockReason && (
                      <div className="mt-2 text-xs text-red-400 flex items-start gap-1.5"><IconWrapper icon={Ban} className="h-3.5 w-3.5 shrink-0 mt-0.5" />{item.blockReason}</div>
                    )}
                  </div>
                  <div className="text-sm">
                    <p className="text-zinc-300">{item.recipientName || item.company.name}</p>
                    {item.recipientEmail && <p className="text-xs text-zinc-600">{item.recipientEmail}</p>}
                  </div>
                  <div>
                    <StatusPill status={item.status} isBlocked={item.isBlockedForSend} hasPlaceholders={item.hasUnreviewedPlaceholders} />
                    <p className="text-[10px] text-zinc-600 mt-1">{item.sentAt ? formatDateTime(new Date(item.sentAt)) : item.approvedAt ? `Freigegeben ${formatDate(new Date(item.approvedAt))}` : `Erstellt ${formatDate(new Date(item.createdAt))}`}</p>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {canEdit && <Link href={`/outreach/${item.id}/edit`} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white border border-zinc-700 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800"><IconWrapper icon={Edit3} className="h-3 w-3" />Bearbeiten</Link>}
                    {canApprove && <button onClick={() => handleApprove(item.id)} className="flex items-center gap-1 text-xs bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-emerald-500"><IconWrapper icon={ShieldCheck} className="h-3 w-3" />Freigeben</button>}
                    {canSend && (
                      <button 
                        onClick={() => handleSend(item.id)} 
                        disabled={sendingId === item.id}
                        className="flex items-center gap-1 text-xs bg-sky-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingId === item.id ? (
                          <><span className="animate-spin">⏳</span>Sende...</>
                        ) : (
                          <><IconWrapper icon={Send} className="h-3 w-3" />Senden</>
                        )}
                      </button>
                    )}
                    {item.status === "SENT" && (
                      <div className="flex flex-col items-end">
                        <span className="flex items-center gap-1 text-xs text-sky-400">
                          <IconWrapper icon={CheckCircle} className="h-3 w-3" />
                          {item.sentStatus === "SENT" ? "Versendet" : "Gesendet"}
                        </span>
                        {item.messageId && (
                          <span className="text-[9px] text-zinc-600 mt-0.5" title={item.messageId}>
                            ID: {item.messageId.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                    )}
                    {item.sentStatus === "FAILED" && (
                      <div className="flex flex-col items-end">
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <IconWrapper icon={AlertTriangle} className="h-3 w-3" />
                          Fehlgeschlagen
                        </span>
                        <span className="text-[9px] text-red-400/70 mt-0.5 max-w-[120px] truncate" title={item.sentError || ""}>
                          {item.sentError}
                        </span>
                      </div>
                    )}
                    {item.isBlockedForSend && <Link href={`/outreach/${item.id}/edit`} className="flex items-center gap-1 text-xs text-red-400 border border-red-500/30 px-2.5 py-1.5 rounded-lg hover:bg-red-500/10"><IconWrapper icon={AlertTriangle} className="h-3 w-3" />Prüfen</Link>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONVERSATIONS VIEW
// ═══════════════════════════════════════════════════════════════════════════

function ConversationsView({ conversations, stats, activeFilter, setActiveFilter, searchQuery, setSearchQuery }: any) {
  return (
    <>
      <div className="flex flex-wrap gap-2" data-testid="conversation-filters">
        {conversationFilters.map((f) => (
          <button
            key={f.key}
            data-testid={`filter-${f.key}`}
            data-active={activeFilter === f.key}
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
              activeFilter === f.key
                ? f.color === "emerald" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : f.color === "red" ? "bg-red-500/10 text-red-400 border-red-500/30"
                : f.color === "amber" ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : f.color === "violet" ? "bg-violet-500/10 text-violet-400 border-violet-500/30"
                : f.color === "orange" ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                : "bg-zinc-800 text-zinc-300 border-zinc-700"
                : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700"
            )}
          >
            {f.label}
            <span className="ml-1.5 text-zinc-600" data-testid={`count-${f.key}`}>
              {f.key === "all" ? stats.total : f.key === "active" ? stats.active : f.key === "replied" ? stats.replied : f.key === "due-today" ? stats.dueToday : f.key === "overdue" ? stats.overdue : f.key === "positive" ? stats.positive : f.key === "negative" ? stats.negative : f.key === "closed" ? stats.closed : 0}
            </span>
          </button>
        ))}
      </div>

      <SearchBar query={searchQuery} setQuery={setSearchQuery} placeholder="Firma oder Domain suchen..." count={conversations.length} total={stats.total} />

      {conversations.length === 0 ? (
        <EmptyState icon={MessageSquare} title="Keine Conversations" subtitle="Ändere den Filter oder die Suche" />
      ) : (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="grid grid-cols-[1fr_120px_140px_120px_200px] gap-4 px-5 py-3 border-b border-zinc-800 bg-zinc-950/30 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <span>Lead</span><span>Status</span><span>Sentiment</span><span>Follow-up</span><span className="text-right">Aktionen</span>
          </div>
          <div className="divide-y divide-zinc-800/60">
            {conversations.map((c: ConversationItem) => {
              const isClosed = ["CLOSED_WON", "CLOSED_LOST", "NO_REPLY_CLOSED"].includes(c.status);
              return (
                <div key={c.id} className={cn("grid grid-cols-[1fr_120px_140px_120px_200px] gap-4 px-5 py-4 hover:bg-zinc-800/30 transition-colors", c.isOverdue && "bg-red-500/5")}>
                  {/* Lead */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/leads/${c.companyId}`} className="text-sm font-medium text-white hover:text-zinc-200 truncate">{c.company.name}</Link>
                      {c.company.opportunityScore && <span className="text-[10px] text-emerald-400">{Math.round(c.company.opportunityScore)}</span>}
                    </div>
                    <p className="text-xs text-zinc-600">{c.company.domain}</p>
                    {c.lastReply?.content && (
                      <p className="text-[10px] text-zinc-500 mt-1 truncate italic">&ldquo;{c.lastReply.content}&rdquo;</p>
                    )}
                  </div>
                  
                  {/* Status */}
                  <div><ConversationStatusPill status={c.status} /></div>
                  
                  {/* Sentiment */}
                  <div>{c.currentSentiment ? <SentimentPill sentiment={c.currentSentiment} /> : <span className="text-xs text-zinc-600">—</span>}</div>
                  
                  {/* Follow-up */}
                  <div>
                    {c.nextFollowUpDueAt ? (
                      <div className="flex flex-col">
                        <span className={cn("text-xs", c.isOverdue ? "text-red-400" : c.isDueToday ? "text-amber-400" : "text-zinc-400")}>
                          {c.isOverdue ? `${Math.ceil((new Date().getTime() - new Date(c.nextFollowUpDueAt).getTime()) / (1000 * 60 * 60 * 24))}d überfällig` : c.isDueToday ? "Heute" : formatDate(new Date(c.nextFollowUpDueAt))}
                        </span>
                        <span className="text-[10px] text-zinc-600">#{c.followUpCount}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </div>
                  
                  {/* Aktionen */}
                  <div className="flex items-center justify-end gap-2">
                    {!isClosed ? (
                      <>
                        <Link href={`/leads/${c.companyId}`} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white border border-zinc-700 px-2 py-1 rounded-lg hover:bg-zinc-800">
                          <IconWrapper icon={MessageSquare} className="h-3 w-3" />
                          Antwort
                        </Link>
                        <Link href={`/leads/${c.companyId}`} className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-500 border border-sky-700/50 px-2 py-1 rounded-lg hover:bg-sky-950/30">
                          <IconWrapper icon={ArrowRight} className="h-3 w-3" />
                          Follow-up
                        </Link>
                      </>
                    ) : (
                      <span className="text-xs text-zinc-600 flex items-center gap-1">
                        <IconWrapper icon={CheckCircle} className="h-3 w-3" />
                        Abgeschlossen
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-KOMPONENTEN
// ═══════════════════════════════════════════════════════════════════════════

function SearchBar({ query, setQuery, placeholder, count, total }: { query: string; setQuery: (q: string) => void; placeholder: string; count: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-md">
        <IconWrapper icon={Search} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700" />
      </div>
      <div className="flex items-center gap-1 text-xs text-zinc-500">
        <IconWrapper icon={Filter} className="h-3.5 w-3.5" />
        {count} von {total}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 border-dashed p-12 flex flex-col items-center text-center">
      <IconWrapper icon={Icon} className="h-10 w-10 text-zinc-700 mb-3" />
      <p className="text-sm font-medium text-zinc-400">{title}</p>
      <p className="text-xs text-zinc-600 mt-1">{subtitle}</p>
    </div>
  );
}

function StatCard({ label, value, active, onClick, color = "zinc" }: { label: string; value: number; active?: boolean; onClick?: () => void; color?: "zinc" | "amber" | "blue" | "red" | "emerald" | "sky" }) {
  const colorClasses = {
    zinc: { bg: "bg-zinc-800", text: "text-zinc-400", border: "border-zinc-700" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
    red: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    sky: { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/20" },
  };
  const c = colorClasses[color];
  return (
    <button onClick={onClick} className={`rounded-lg border p-3 text-left transition-all ${active ? `${c.bg} ${c.border} ${c.text}` : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"}`}>
      <p className={`text-2xl font-bold ${active ? c.text : "text-white"}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider mt-0.5">{label}</p>
    </button>
  );
}

function StatusPill({ status, isBlocked, hasPlaceholders }: { status: string; isBlocked?: boolean; hasPlaceholders?: boolean }) {
  if (isBlocked) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><IconWrapper icon={Ban} className="h-3 w-3" />Blockiert</span>;
  if (status === "DRAFT" && hasPlaceholders) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"><IconWrapper icon={AlertTriangle} className="h-3 w-3" />Prüfung nötig</span>;
  const config: Record<string, { text: string; class: string }> = {
    DRAFT: { text: "Entwurf", class: "bg-zinc-800 text-zinc-400 border-zinc-700" },
    APPROVED: { text: "Freigegeben", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    SENT: { text: "Gesendet", class: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
    REPLIED: { text: "Antwort", class: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  };
  const c = config[status] || config.DRAFT;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${c.class}`}>{c.text}</span>;
}

function ConversationStatusPill({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    PENDING: { text: "Ausstehend", class: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    REPLIED: { text: "Antwort", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    FOLLOW_UP_SENT: { text: "Follow-up", class: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
    CLOSED_WON: { text: "Gewonnen", class: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    CLOSED_LOST: { text: "Verloren", class: "bg-zinc-800 text-zinc-500 border-zinc-700" },
    NO_REPLY_CLOSED: { text: "Keine Antwort", class: "bg-zinc-800 text-zinc-500 border-zinc-700" },
  };
  const c = config[status] || config.PENDING;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${c.class}`}>{c.text}</span>;
}

function SentimentPill({ sentiment }: { sentiment: string }) {
  const config: Record<string, { text: string; class: string; icon: any }> = {
    POSITIVE: { text: "Positiv", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: ThumbsUp },
    NEUTRAL: { text: "Neutral", class: "bg-zinc-800 text-zinc-400 border-zinc-700", icon: Minus },
    NEGATIVE: { text: "Negativ", class: "bg-red-500/10 text-red-400 border-red-500/20", icon: ThumbsDown },
    SPAM: { text: "Spam", class: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: AlertTriangle },
  };
  const c = config[sentiment] || config.NEUTRAL;
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${c.class}`}><IconWrapper icon={c.icon} className="h-3 w-3" />{c.text}</span>;
}
