"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconWrapper } from "@/components/ui/icon-wrapper";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import { LeadStatus } from "@/types";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle,
  Send,
  Inbox,
  ArrowRight,
  Clock,
  ShieldCheck,
  MessageSquare,
  Lock,
  Eye,
  XCircle,
  ChevronRight,
  Edit3,
  Ban,
  User,
  Mail,
  Tag,
  Filter,
  Search,
  SlidersHorizontal,
  AlertOctagon,
  RefreshCw,
} from "lucide-react";

interface OutreachItem {
  id: string;
  companyId: string;
  company: {
    name: string;
    id: string;
    status: string;
    domain: string;
  };
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
  createdAt: string;
}

const filters = [
  { key: "ALL", label: "Alle", color: "zinc" },
  { key: "DRAFT", label: "Entwurf", color: "amber" },
  { key: "NEEDS_REVIEW", label: "Freigabe offen", color: "blue" },
  { key: "BLOCKED", label: "Blockiert", color: "red" },
  { key: "APPROVED", label: "Freigegeben", color: "emerald" },
  { key: "SENT", label: "Gesendet", color: "sky" },
];

export default function OutreachClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<OutreachItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(searchParams.get("status") || "ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/outreach")
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      });
  }, []);

  // Filter anwenden
  const filteredItems = items.filter((item) => {
    // Status-Filter
    if (activeFilter === "ALL") return true;
    if (activeFilter === "BLOCKED") return item.isBlockedForSend && item.status === "DRAFT";
    if (activeFilter === "NEEDS_REVIEW") return item.status === "DRAFT" && !item.isBlockedForSend && !item.hasUnreviewedPlaceholders;
    return item.status === activeFilter;
  }).filter((item) => {
    // Such-Filter
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.company.name.toLowerCase().includes(query) ||
      item.subject?.toLowerCase().includes(query) ||
      item.recipientName?.toLowerCase().includes(query) ||
      item.recipientEmail?.toLowerCase().includes(query)
    );
  });

  // Stats
  const stats = {
    total: items.length,
    draft: items.filter((i) => i.status === "DRAFT").length,
    approved: items.filter((i) => i.status === "APPROVED").length,
    sent: items.filter((i) => i.status === "SENT").length,
    blocked: items.filter((i) => i.isBlockedForSend).length,
    needsReview: items.filter((i) => i.status === "DRAFT" && !i.isBlockedForSend && !i.hasUnreviewedPlaceholders).length,
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/outreach/${id}/approve`, { method: "POST" });
      if (res.ok) {
        // Refresh
        const data = await fetch("/api/outreach").then((r) => r.json());
        setItems(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (id: string) => {
    try {
      const res = await fetch(`/api/outreach/${id}/send`, { method: "POST" });
      if (res.ok) {
        const data = await fetch("/api/outreach").then((r) => r.json());
        setItems(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-6 text-zinc-500">Lade Outreach...</div>;
  }

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Outreach</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Entwürfe verwalten, freigeben und versenden
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5">
            <IconWrapper icon={ShieldCheck} className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Guardrails aktiv</span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        <StatCard label="Gesamt" value={stats.total} active={activeFilter === "ALL"} onClick={() => setActiveFilter("ALL")} />
        <StatCard label="Entwurf" value={stats.draft} active={activeFilter === "DRAFT"} onClick={() => setActiveFilter("DRAFT")} color="amber" />
        <StatCard label="Freigabe offen" value={stats.needsReview} active={activeFilter === "NEEDS_REVIEW"} onClick={() => setActiveFilter("NEEDS_REVIEW")} color="blue" />
        <StatCard label="Blockiert" value={stats.blocked} active={activeFilter === "BLOCKED"} onClick={() => setActiveFilter("BLOCKED")} color="red" />
        <StatCard label="Freigegeben" value={stats.approved} active={activeFilter === "APPROVED"} onClick={() => setActiveFilter("APPROVED")} color="emerald" />
        <StatCard label="Gesendet" value={stats.sent} active={activeFilter === "SENT"} onClick={() => setActiveFilter("SENT")} color="sky" />
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <IconWrapper icon={Search} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Firma, Betreff oder Empfänger suchen..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
          />
        </div>
        <div className="flex items-center gap-1 text-xs text-zinc-500">
          <IconWrapper icon={Filter} className="h-3.5 w-3.5" />
          {filteredItems.length} von {items.length}
        </div>
      </div>

      {/* Liste */}
      {filteredItems.length === 0 ? (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 border-dashed p-12 flex flex-col items-center text-center">
          <IconWrapper icon={Inbox} className="h-10 w-10 text-zinc-700 mb-3" />
          <p className="text-sm font-medium text-zinc-400">Keine Einträge gefunden</p>
          <p className="text-xs text-zinc-600 mt-1">Ändere den Filter oder die Suche</p>
        </div>
      ) : (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_180px_140px_180px] gap-4 px-5 py-3 border-b border-zinc-800 bg-zinc-950/30 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <span>Lead / Nachricht</span>
            <span>Empfänger</span>
            <span>Status</span>
            <span className="text-right">Aktionen</span>
          </div>

          {/* Items */}
          <div className="divide-y divide-zinc-800/60">
            {filteredItems.map((item) => {
              const redFlags = item.redFlags ? JSON.parse(item.redFlags) : [];
              const canEdit = item.status === "DRAFT";
              const canApprove = item.status === "DRAFT" && !item.isBlockedForSend && !item.hasUnreviewedPlaceholders;
              const canSend = item.status === "APPROVED";

              return (
                <div
                  key={item.id}
                  className={`grid grid-cols-[1fr_180px_140px_180px] gap-4 px-5 py-4 hover:bg-zinc-800/30 transition-colors ${
                    item.isBlockedForSend ? "bg-red-500/5" : ""
                  }`}
                >
                  {/* Lead / Nachricht */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/leads/${item.companyId}`}
                        className="text-sm font-medium text-white hover:text-zinc-200 truncate"
                      >
                        {item.company.name}
                      </Link>
                      <StatusBadge status={item.company.status as LeadStatus} />
                    </div>
                    <p className="text-xs text-zinc-500 truncate">{item.subject || "(kein Betreff)"}</p>
                    
                    {/* Meta */}
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-600">
                      {item.editCount > 0 && (
                        <span className="flex items-center gap-1">
                          <IconWrapper icon={Edit3} className="h-3 w-3" />
                          {item.editCount}x bearbeitet
                        </span>
                      )}
                      {item.hasUnreviewedPlaceholders && (
                        <span className="flex items-center gap-1 text-amber-500">
                          <IconWrapper icon={AlertTriangle} className="h-3 w-3" />
                          Platzhalter
                        </span>
                      )}
                      {redFlags.length > 0 && (
                        <span className="flex items-center gap-1 text-red-400">
                          <IconWrapper icon={AlertOctagon} className="h-3 w-3" />
                          {redFlags.length} Hinweis{redFlags.length > 1 ? "e" : ""}
                        </span>
                      )}
                    </div>

                    {/* Blockierungs-Grund */}
                    {item.isBlockedForSend && item.blockReason && (
                      <div className="mt-2 text-xs text-red-400 flex items-start gap-1.5">
                        <IconWrapper icon={Ban} className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        {item.blockReason}
                      </div>
                    )}
                  </div>

                  {/* Empfänger */}
                  <div className="text-sm">
                    <p className="text-zinc-300">{item.recipientName || item.company.name}</p>
                    {item.recipientEmail && (
                      <p className="text-xs text-zinc-600">{item.recipientEmail}</p>
                    )}
                    {item.recipientRole && (
                      <p className="text-xs text-zinc-700">{item.recipientRole}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <StatusPill 
                      status={item.status} 
                      isBlocked={item.isBlockedForSend}
                      hasPlaceholders={item.hasUnreviewedPlaceholders}
                    />
                    <p className="text-[10px] text-zinc-600 mt-1">
                      {item.sentAt ? formatDateTime(new Date(item.sentAt)) :
                       item.approvedAt ? `Freigegeben ${formatDate(new Date(item.approvedAt))}` :
                       `Erstellt ${formatDate(new Date(item.createdAt))}`}
                    </p>
                  </div>

                  {/* Aktionen */}
                  <div className="flex items-center justify-end gap-2">
                    {canEdit && (
                      <Link
                        href={`/outreach/${item.id}/edit`}
                        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white border border-zinc-700 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <IconWrapper icon={Edit3} className="h-3 w-3" />
                        Bearbeiten
                      </Link>
                    )}
                    
                    {canApprove && (
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="flex items-center gap-1 text-xs bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-emerald-500 transition-colors"
                      >
                        <IconWrapper icon={ShieldCheck} className="h-3 w-3" />
                        Freigeben
                      </button>
                    )}
                    
                    {canSend && (
                      <button
                        onClick={() => handleSend(item.id)}
                        className="flex items-center gap-1 text-xs bg-sky-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-sky-500 transition-colors"
                      >
                        <IconWrapper icon={Send} className="h-3 w-3" />
                        Senden
                      </button>
                    )}
                    
                    {item.status === "SENT" && (
                      <span className="flex items-center gap-1 text-xs text-sky-400">
                        <IconWrapper icon={CheckCircle} className="h-3 w-3" />
                        Versendet
                      </span>
                    )}

                    {item.isBlockedForSend && (
                      <Link
                        href={`/outreach/${item.id}/edit`}
                        className="flex items-center gap-1 text-xs text-red-400 border border-red-500/30 px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <IconWrapper icon={AlertTriangle} className="h-3 w-3" />
                        Prüfen
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-Komponenten ───────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  active,
  onClick,
  color = "zinc",
}: {
  label: string;
  value: number;
  active?: boolean;
  onClick?: () => void;
  color?: "zinc" | "amber" | "blue" | "red" | "emerald" | "sky";
}) {
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
    <button
      onClick={onClick}
      className={`rounded-lg border p-3 text-left transition-all ${
        active 
          ? `${c.bg} ${c.border} ${c.text}` 
          : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
      }`}
    >
      <p className={`text-2xl font-bold ${active ? c.text : "text-white"}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider mt-0.5">{label}</p>
    </button>
  );
}

function StatusPill({ 
  status, 
  isBlocked, 
  hasPlaceholders 
}: { 
  status: string; 
  isBlocked?: boolean;
  hasPlaceholders?: boolean;
}) {
  if (isBlocked) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
        <IconWrapper icon={Ban} className="h-3 w-3" />
        Blockiert
      </span>
    );
  }
  
  if (status === "DRAFT" && hasPlaceholders) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <IconWrapper icon={AlertTriangle} className="h-3 w-3" />
        Prüfung nötig
      </span>
    );
  }
  
  const config: Record<string, { text: string; class: string }> = {
    DRAFT: { text: "Entwurf", class: "bg-zinc-800 text-zinc-400 border-zinc-700" },
    APPROVED: { text: "Freigegeben", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    SENT: { text: "Gesendet", class: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
    REPLIED: { text: "Antwort", class: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  };
  
  const c = config[status] || config.DRAFT;
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${c.class}`}>
      {c.text}
    </span>
  );
}
