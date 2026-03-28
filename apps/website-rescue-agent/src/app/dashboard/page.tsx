"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LeadStatus } from "@/types";
import { INDUSTRIES, scoreToHex } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";
import {
  Users, TrendingUp, Globe, Send, CheckCircle, ArrowRight,
  Inbox, BarChart2, Building2, Plus, Play, Sparkles,
  LayoutTemplate, AlertTriangle, Zap,
} from "lucide-react";

interface DashboardData {
  totalLeads: number;
  statusCounts: { status: string; _count: { status: number } }[];
  avgScore: number | null;
  topIndustries: { industry: string; _count: { industry: number } }[];
  recentLeads: any[];
  pendingOutreach: any[];
  waitingCrawl: any[];
  waitingAnalysis: any[];
  readyForDemo: any[];
  readyForOutreach: any[];
  session: { user?: { name?: string } } | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (json.error === "Unauthorized") {
          router.push("/login");
          return;
        }
        setData(json);
        setLoading(false);
      });
  }, [router]);

  if (loading || !data) {
    return <div className="p-6 text-zinc-500">Lade Dashboard...</div>;
  }

  const { session, totalLeads, statusCounts, avgScore, topIndustries, recentLeads, pendingOutreach, waitingCrawl, waitingAnalysis, readyForDemo, readyForOutreach } = data;

  const statusMap = Object.fromEntries(statusCounts.map((s) => [s.status, s._count.status]));
  const qualified = statusMap[LeadStatus.QUALIFIED] ?? 0;
  const siteGenerated = statusMap[LeadStatus.SITE_GENERATED] ?? 0;
  const sent = statusMap[LeadStatus.SENT] ?? 0;
  const won = statusMap[LeadStatus.WON] ?? 0;

  const funnelStages = [
    { status: "NEW",            label: "Neu",          count: statusMap["NEW"] ?? 0,            color: "bg-zinc-500" },
    { status: "CRAWLED",        label: "Gecrawlt",     count: statusMap["CRAWLED"] ?? 0,        color: "bg-blue-500" },
    { status: "ANALYZED",       label: "Analysiert",   count: statusMap["ANALYZED"] ?? 0,       color: "bg-violet-500" },
    { status: "QUALIFIED",      label: "Qualifiziert", count: statusMap["QUALIFIED"] ?? 0,      color: "bg-emerald-500" },
    { status: "SITE_GENERATED", label: "Demo erstellt",count: statusMap["SITE_GENERATED"] ?? 0, color: "bg-teal-500" },
    { status: "SENT",           label: "Gesendet",     count: statusMap["SENT"] ?? 0,           color: "bg-sky-500" },
    { status: "WON",            label: "Gewonnen",     count: statusMap["WON"] ?? 0,            color: "bg-amber-500" },
  ];

  const maxFunnelCount = Math.max(...funnelStages.map((s) => s.count), 1);
  const conversionRate = totalLeads > 0 ? Math.round((won / totalLeads) * 100) : 0;
  const topIndustry = topIndustries[0] ? (INDUSTRIES[topIndustries[0].industry!] ?? topIndustries[0].industry) : null;

  // Action-Center: welche Bereiche haben offene Arbeit?
  const actionItemsRaw = [
    waitingCrawl.length > 0 && {
      id: "crawl", icon: <Play className="h-4 w-4 text-blue-400" />, bg: "bg-blue-500/10 border-blue-500/20",
      label: `${waitingCrawl.length} Lead${waitingCrawl.length > 1 ? "s" : ""} warten auf Crawl`,
      sub: "Website noch nicht geladen",
      cta: "Jetzt crawlen", href: "/leads?status=NEW",
      leads: waitingCrawl.map((l: any) => ({ id: l.id, name: l.name, meta: l.domain ?? "" })),
    },
    waitingAnalysis.length > 0 && {
      id: "analyze", icon: <Sparkles className="h-4 w-4 text-violet-400" />, bg: "bg-violet-500/10 border-violet-500/20",
      label: `${waitingAnalysis.length} Lead${waitingAnalysis.length > 1 ? "s" : ""} warten auf Analyse`,
      sub: "Gecrawlt aber noch nicht bewertet",
      cta: "Analysieren", href: "/leads?status=CRAWLED",
      leads: waitingAnalysis.map((l: any) => ({ id: l.id, name: l.name, meta: l.domain ?? "" })),
    },
    readyForDemo.length > 0 && {
      id: "demo", icon: <LayoutTemplate className="h-4 w-4 text-teal-400" />, bg: "bg-teal-500/10 border-teal-500/20",
      label: `${readyForDemo.length} Lead${readyForDemo.length > 1 ? "s" : ""} bereit für Demo`,
      sub: "Qualifiziert — Demo-Seite fehlt noch",
      cta: "Demo generieren", href: "/leads?status=QUALIFIED",
      leads: readyForDemo.map((l: any) => ({ id: l.id, name: l.name, meta: l.analyses[0]?.overallScore != null ? `Score ${Math.round(l.analyses[0].overallScore)}` : "" })),
    },
    pendingOutreach.length > 0 && {
      id: "outreach", icon: <AlertTriangle className="h-4 w-4 text-amber-400" />, bg: "bg-amber-500/10 border-amber-500/20",
      label: `${pendingOutreach.length} Outreach-Entwurf${pendingOutreach.length > 1 ? "e" : ""} warten auf Freigabe`,
      sub: "Bereit zum Review — Freigabe ausstehend",
      cta: "Freigeben", href: "/outreach",
      leads: pendingOutreach.map((d: any) => ({ id: d.companyId, name: d.company.name, meta: d.subject ?? "" })),
    },
    readyForOutreach.length > 0 && {
      id: "send", icon: <Send className="h-4 w-4 text-sky-400" />, bg: "bg-sky-500/10 border-sky-500/20",
      label: `${readyForOutreach.length} Lead${readyForOutreach.length > 1 ? "s" : ""} bereit zum Versand`,
      sub: "Demo erstellt — Outreach-Entwurf generieren",
      cta: "Outreach erstellen", href: "/leads?status=SITE_GENERATED",
      leads: readyForOutreach.map((l: any) => ({ id: l.id, name: l.name, meta: l.analyses[0]?.overallScore != null ? `Score ${Math.round(l.analyses[0].overallScore)}` : "" })),
    },
  ].filter(Boolean);

  const actionItems = actionItemsRaw as { id: string; icon: React.ReactNode; bg: string; label: string; sub: string; cta: string; href: string; leads: { id: string; name: string; meta: string }[] }[];

  return (
    <div className="space-y-5 p-6">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Willkommen zurück, {session?.user?.name}</p>
        </div>
        <Link
          href="/leads/new"
          className="flex items-center gap-1.5 rounded-lg bg-white text-zinc-900 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Neuer Lead
        </Link>
      </div>

      {/* ── KPI-Karten ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Leads gesamt" value={totalLeads}
          icon={<Users className="h-4 w-4" />}
          context={totalLeads === 0 ? "Noch keine Leads" : `${qualified} qualifiziert`}
          href="/leads" accent="zinc" />
        <KpiCard label="Qualifiziert" value={qualified}
          icon={<TrendingUp className="h-4 w-4" />}
          context={qualified === 0 ? "Noch keine" : `${totalLeads > 0 ? Math.round((qualified / totalLeads) * 100) : 0}% der Leads`}
          href="/leads?status=QUALIFIED" accent="emerald" />
        <KpiCard label="Demo erstellt" value={siteGenerated}
          icon={<Globe className="h-4 w-4" />}
          context={siteGenerated === 0 ? "Noch keine Demos" : `${siteGenerated} bereit`}
          href="/leads?status=SITE_GENERATED" accent="teal" />
        <KpiCard label="Gesendet" value={sent}
          icon={<Send className="h-4 w-4" />}
          context={sent === 0 ? "Noch nichts versendet" : won > 0 ? `${won} gewonnen` : "Warte auf Antworten"}
          href="/outreach" accent="sky" />
      </div>

      {/* ── ACTION CENTER ────────────────────────────────────────────────── */}
      {actionItems.length > 0 ? (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-zinc-800 bg-zinc-950/40">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/15">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Handlungsbedarf</h2>
            <span className="rounded-full bg-amber-500/15 border border-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 tabular-nums">
              {actionItems.length}
            </span>
            <span className="ml-auto text-xs text-zinc-600">Priorisiert nach Funnel-Stufe</span>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {actionItems.map((item) => (
              <div key={item.id} className="flex items-start gap-4 px-5 py-3.5">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${item.bg} mt-0.5`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <span className="text-xs text-zinc-600">{item.sub}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {item.leads.slice(0, 3).map((lead) => (
                      <Link
                        key={lead.id}
                        href={`/leads/${lead.id}`}
                        className="inline-flex items-center gap-1 rounded-md bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                      >
                        {lead.name}
                        {lead.meta && <span className="text-zinc-600">· {lead.meta}</span>}
                      </Link>
                    ))}
                  </div>
                </div>
                <Link
                  href={item.href}
                  className="shrink-0 flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white border border-zinc-700 rounded-lg px-2.5 py-1.5 hover:border-zinc-600 transition-colors mt-0.5"
                >
                  {item.cta} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : totalLeads > 0 ? (
        <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-5 py-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-300">Pipeline ist auf dem neuesten Stand</p>
            <p className="text-xs text-zinc-500 mt-0.5">Kein sofortiger Handlungsbedarf erkannt.</p>
          </div>
        </div>
      ) : null}

      {/* ── Pipeline + Outreach ──────────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Pipeline */}
        <div className="lg:col-span-2 rounded-xl bg-zinc-900 border border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Pipeline</h2>
              <p className="text-xs text-zinc-500 mt-0.5">{totalLeads} Leads im System</p>
            </div>
            <BarChart2 className="h-4 w-4 text-zinc-600" />
          </div>

          <div className="space-y-2.5">
            {funnelStages.map((stage) => {
              const pct = maxFunnelCount > 0 ? (stage.count / maxFunnelCount) * 100 : 0;
              const ofTotal = totalLeads > 0 ? Math.round((stage.count / totalLeads) * 100) : 0;
              return (
                <Link
                  key={stage.status}
                  href={`/leads?status=${stage.status}`}
                  className="flex items-center gap-3 group"
                >
                  <span className="w-24 shrink-0 text-xs text-zinc-500 text-right group-hover:text-zinc-300 transition-colors">
                    {stage.label}
                  </span>
                  <div className="flex-1 h-4 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${stage.color} opacity-70 group-hover:opacity-100`}
                      style={{ width: `${Math.max(pct, stage.count > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 w-16 justify-end shrink-0">
                    <span className="text-xs font-bold text-white tabular-nums">{stage.count}</span>
                    {stage.count > 0 && (
                      <span className="text-xs text-zinc-700 tabular-nums">{ofTotal}%</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
            {won > 0 ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs text-zinc-400">
                  <span className="font-semibold text-emerald-400">{won}</span> gewonnen ·{" "}
                  <span className="font-semibold text-white">{conversionRate}%</span>{" "}
                  <span className="text-zinc-600">Conversion</span>
                </span>
              </div>
            ) : (
              <p className="text-xs text-zinc-700">Noch kein Deal abgeschlossen</p>
            )}
            <Link href="/leads" className="text-xs text-zinc-600 hover:text-white transition-colors flex items-center gap-1">
              Alle Leads <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Outreach freigeben */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Outreach freigeben</h2>
            {pendingOutreach.length > 0 && (
              <span className="rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold px-2 py-0.5 border border-amber-500/20">
                {pendingOutreach.length}
              </span>
            )}
          </div>

          {pendingOutreach.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 mb-2.5">
                <Inbox className="h-4 w-4 text-zinc-600" />
              </div>
              <p className="text-sm font-medium text-zinc-400">Alles freigegeben</p>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed max-w-[160px]">
                Keine Entwürfe warten auf Review.
              </p>
              <Link href="/leads" className="mt-3 flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors">
                Leads prüfen <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              {pendingOutreach.map((draft: any) => (
                <Link
                  key={draft.id}
                  href={`/leads/${draft.companyId}`}
                  className="group flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/40 px-3 py-2.5 hover:bg-zinc-800 hover:border-zinc-700 transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{draft.company.name}</p>
                    <p className="text-xs text-zinc-600 truncate mt-0.5">{draft.subject}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-700 group-hover:text-zinc-400 shrink-0 ml-2 transition-colors" />
                </Link>
              ))}
              <Link href="/outreach" className="flex items-center justify-center gap-1 text-xs text-zinc-600 hover:text-white pt-1 transition-colors">
                Alle ansehen <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Leads + Branchen ─────────────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Neueste / Wichtigste Leads */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Neueste Leads</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Zuletzt hinzugefügt</p>
            </div>
            <Link href="/leads" className="flex items-center gap-1 text-xs text-zinc-600 hover:text-white transition-colors">
              Alle <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentLeads.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <Users className="h-5 w-5 text-zinc-700 mb-2" />
              <p className="text-xs text-zinc-600">Noch keine Leads — ersten hinzufügen.</p>
              <Link href="/leads/new" className="mt-2 text-xs text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors">
                Lead hinzufügen
              </Link>
            </div>
          ) : (
            <div className="space-y-0.5">
              {recentLeads.map((lead: any) => {
                const score = lead.analyses[0]?.overallScore;
                const initials = lead.name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
                return (
                  <Link key={lead.id} href={`/leads/${lead.id}`}
                    className="group grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-lg px-2 py-2 hover:bg-zinc-800/70 transition-colors">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-800 border border-zinc-700/50 text-xs font-bold text-zinc-400 group-hover:border-zinc-600 transition-colors">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate leading-none">{lead.name}</p>
                      <p className="text-xs text-zinc-600 mt-0.5 truncate">{lead.domain}</p>
                    </div>
                    <div className="shrink-0">
                      {score != null ? <ScorePill score={Math.round(score)} /> : <span className="text-xs text-zinc-700">—</span>}
                    </div>
                    <div className="shrink-0"><StatusBadge status={lead.status as LeadStatus} /></div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Top-Branchen */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Top-Branchen</h2>
              {topIndustry && (
                <p className="text-xs text-zinc-500 mt-0.5">Häufigste: <span className="text-zinc-400">{topIndustry}</span></p>
              )}
            </div>
            <Building2 className="h-4 w-4 text-zinc-700" />
          </div>
          {topIndustries.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <Building2 className="h-5 w-5 text-zinc-700 mb-2" />
              <p className="text-xs text-zinc-600">Noch keine Daten.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topIndustries.map((ind) => (
                <div key={ind.industry} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-xs text-zinc-400 truncate">{INDUSTRIES[ind.industry!] ?? ind.industry}</span>
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-600 rounded-full"
                      style={{ width: `${(ind._count.industry / (topIndustries[0]._count.industry || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs text-zinc-600 tabular-nums">{ind._count.industry}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// ─── Sub-Komponenten ───────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon,
  context,
  href,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  context: string;
  href: string;
  accent: "zinc" | "emerald" | "teal" | "sky";
}) {
  const accentBorder = {
    zinc: "group-hover:border-zinc-600",
    emerald: "group-hover:border-emerald-500/50",
    teal: "group-hover:border-teal-500/50",
    sky: "group-hover:border-sky-500/50",
  };
  return (
    <Link
      href={href}
      className={`group rounded-xl bg-zinc-900 border border-zinc-800 p-4 transition-all hover:bg-zinc-900/80 ${accentBorder[accent]}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">{label}</span>
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800 text-zinc-400">
          {icon}
        </div>
      </div>
      <div className="mt-2">
        <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
        <p className="text-xs text-zinc-600 mt-0.5 truncate">{context}</p>
      </div>
    </Link>
  );
}

function ScorePill({ score }: { score: number }) {
  const color = scoreToHex(score);
  return (
    <span
      className="inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums min-w-[2rem]"
      style={{ color, backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
    >
      {score}
    </span>
  );
}
