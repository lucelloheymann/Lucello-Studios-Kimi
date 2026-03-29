"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LeadStatus } from "@/types";
import { INDUSTRIES, scoreToHex, formatDateTime, formatDate, cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { IconWrapper } from "@/components/ui/icon-wrapper";
import Link from "next/link";
import {
  Users, TrendingUp, Globe, Send, CheckCircle, ArrowRight,
  Inbox, BarChart2, Building2, Plus, Play, Sparkles,
  LayoutTemplate, AlertTriangle, Zap, Ban, XCircle,
  Activity, Clock, User, AlertOctagon, AlertCircle,
  Mail, MousePointer, Target, Flame, ChevronRight,
  RefreshCw, Eye, FileText, MessageSquare,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// TYPEN
// ═══════════════════════════════════════════════════════════════════════════

interface ActionItem {
  id: string;
  priority: number;
  severity: "info" | "warning" | "error";
  icon: string;
  label: string;
  sub: string;
  cta: string;
  href: string;
  count: number;
  leads: { id: string; name: string; meta: string }[];
}

interface TodoItem {
  id: string;
  severity: "info" | "warning" | "error";
  label: string;
  count: number;
  href: string;
  cta: string;
}

interface DashboardData {
  session: { user?: { name?: string } } | null;
  
  // Basis
  totalLeads: number;
  statusCounts: { status: string; _count: { status: number } }[];
  avgScore: number | null;
  avgOpportunityScore: number | null;
  topIndustries: { industry: string; _count: { industry: number } }[];
  recentLeads: any[];
  
  // Operational
  actionItems: ActionItem[];
  todayTodos: TodoItem[];
  
  // Counts
  workflowCounts: {
    crawl: number;
    analysis: number;
    demo: number;
    outreach: number;
  };
  
  outreachStats: {
    draft: number;
    approved: number;
    sent: number;
    replied: number;
    blocked: number;
    needsReview: number;
    readyToApprove: number;
  };
  
  errors: {
    failedCrawls: number;
    failedDemos: number;
    failedAnalyses: number;
    missingContacts: number;
    qualifiedMissingContacts: number;
  };
  
  stuckLeads: {
    qualifiedNoDemo: number;
    demoNoOutreach: number;
    stuckQualifiedNoDemo: number;
    stuckDemoNoOutreach: number;
  };
  
  highValueLeads: {
    id: string;
    name: string;
    domain: string;
    status: string;
    score: number | null;
    opportunityScore: number | null;
  }[];
  
  recentActivity: {
    id: string;
    eventType: string;
    action: string;
    title: string;
    companyName: string;
    companyId: string;
    createdAt: string;
    severity: string;
  }[];
  
  activityMeta: {
    newLeads24h: number;
    newApprovals24h: number;
    newBlocks24h: number;
  };
}

const iconMap: Record<string, React.ElementType> = {
  Play, Sparkles, LayoutTemplate, Send, AlertTriangle, Ban, XCircle, 
  User, CheckCircle, Clock, Activity, AlertOctagon, AlertCircle,
  RefreshCw, Eye, FileText, MessageSquare, Target, Flame,
};

const severityColors = {
  info: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", badge: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  warning: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", badge: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  error: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", badge: "bg-red-500/15 text-red-400 border-red-500/20" },
};

// ═══════════════════════════════════════════════════════════════════════════
// HAUPTKOMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

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
    return (
      <div className="p-6 space-y-5" suppressHydrationWarning>
        <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" suppressHydrationWarning />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" suppressHydrationWarning>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" suppressHydrationWarning />
          ))}
        </div>
      </div>
    );
  }

  const { 
    session, totalLeads, statusCounts, avgScore, avgOpportunityScore,
    topIndustries, recentLeads, actionItems, todayTodos, workflowCounts,
    outreachStats, errors, stuckLeads, highValueLeads, recentActivity, activityMeta
  } = data;

  const statusMap = Object.fromEntries(statusCounts.map((s) => [s.status, s._count.status]));
  const qualified = statusMap[LeadStatus.QUALIFIED] ?? 0;
  const siteGenerated = statusMap[LeadStatus.SITE_GENERATED] ?? 0;
  const sent = statusMap[LeadStatus.SENT] ?? 0;
  const won = statusMap[LeadStatus.WON] ?? 0;

  // Kritische vs normale Action Items
  const criticalItems = actionItems.filter(i => i.severity === "error");
  const hasCritical = criticalItems.length > 0;

  return (
    <div className="space-y-6 p-6">
      
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Willkommen zurück{session?.user?.name ? `, ${session.user.name}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activityMeta.newLeads24h > 0 && (
            <span className="text-xs text-zinc-500">
              +{activityMeta.newLeads24h} heute
            </span>
          )}
          <Link
            href="/leads/new"
            className="flex items-center gap-1.5 rounded-lg bg-white text-zinc-900 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 transition-colors"
          >
            <IconWrapper icon={Plus} className="h-3.5 w-3.5" />
            Neuer Lead
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          HEUTE ZU TUN (Top Prioritäten)
          ═══════════════════════════════════════════════════════════════════ */}
      {todayTodos.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <IconWrapper icon={Flame} className="h-4 w-4 text-orange-400" />
            <h2 className="text-sm font-semibold text-white">Heute zu tun</h2>
            <span className="text-xs text-zinc-500">— nach Priorität sortiert</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {todayTodos.map((todo) => (
              <Link
                key={todo.id}
                href={todo.href}
                className={cn(
                  "group relative rounded-xl border p-4 transition-all hover:scale-[1.02]",
                  todo.severity === "error" && "bg-red-500/5 border-red-500/20 hover:border-red-500/40",
                  todo.severity === "warning" && "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40",
                  todo.severity === "info" && "bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40",
                )}
              >
                <div className="flex items-start justify-between">
                  <span className={cn(
                    "text-2xl font-bold tabular-nums",
                    todo.severity === "error" && "text-red-400",
                    todo.severity === "warning" && "text-amber-400",
                    todo.severity === "info" && "text-blue-400",
                  )}>
                    {todo.count}
                  </span>
                  {todo.severity === "error" && (
                    <IconWrapper icon={AlertOctagon} className="h-4 w-4 text-red-400" />
                  )}
                  {todo.severity === "warning" && (
                    <IconWrapper icon={AlertTriangle} className="h-4 w-4 text-amber-400" />
                  )}
                  {todo.severity === "info" && (
                    <IconWrapper icon={CheckCircle} className="h-4 w-4 text-blue-400" />
                  )}
                </div>
                <p className="text-sm font-medium text-white mt-2 line-clamp-2">{todo.label}</p>
                <div className="flex items-center gap-1 mt-3 text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                  {todo.cta}
                  <IconWrapper icon={ArrowRight} className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          KRITISCHE ALERTS (Errors)
          ═══════════════════════════════════════════════════════════════════ */}
      {hasCritical && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <IconWrapper icon={AlertOctagon} className="h-4 w-4 text-red-400" />
            <h2 className="text-sm font-semibold text-red-400">Kritisch — sofortige Aktion nötig</h2>
          </div>
          
          <div className="space-y-2">
            {criticalItems.map((item) => (
              <div 
                key={item.id} 
                className="rounded-xl bg-red-500/5 border border-red-500/20 p-4 flex items-start gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                  <IconWrapper icon={iconMap[item.icon] || XCircle} className="h-5 w-5 text-red-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-white">{item.label}</h3>
                    <span className="text-xs text-zinc-500">{item.sub}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {item.leads.slice(0, 4).map((lead) => (
                      <Link
                        key={lead.id}
                        href={`/leads/${lead.id}`}
                        className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded-md transition-colors border border-zinc-700"
                      >
                        {lead.name}
                      </Link>
                    ))}
                    {item.count > 4 && (
                      <span className="text-xs text-zinc-600">+{item.count - 4} weitere</span>
                    )}
                  </div>
                </div>
                
                <Link
                  href={item.href}
                  className="shrink-0 text-xs font-medium text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg px-4 py-2 hover:bg-red-500/10 transition-colors"
                >
                  {item.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          OPERATIVE KPI-KARTEN
          ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Leads gesamt */}
          <KpiCard 
            label="Leads gesamt" 
            value={totalLeads}
            icon={<IconWrapper icon={Users} className="h-4 w-4" />}
            context={`${qualified} qualifiziert`}
            href="/leads"
            accent="zinc"
          />
          
          {/* Freigabe offen */}
          <KpiCard 
            label="Freigabe offen" 
            value={outreachStats.readyToApprove}
            icon={<IconWrapper icon={CheckCircle} className="h-4 w-4" />}
            context={outreachStats.blocked > 0 ? `${outreachStats.blocked} blockiert` : "Bereit zum Review"}
            href="/outreach?status=APPROVED"
            accent={outreachStats.blocked > 0 ? "red" : "emerald"}
          />
          
          {/* Demo erstellt / wartend */}
          <KpiCard 
            label="Demo-Status" 
            value={siteGenerated}
            icon={<IconWrapper icon={LayoutTemplate} className="h-4 w-4" />}
            context={`${workflowCounts.demo} warten · ${stuckLeads.stuckQualifiedNoDemo} verzögert`}
            href="/leads?status=QUALIFIED"
            accent={stuckLeads.stuckQualifiedNoDemo > 0 ? "amber" : "teal"}
          />
          
          {/* Gesendet */}
          <KpiCard 
            label="Gesendet" 
            value={sent}
            icon={<IconWrapper icon={Send} className="h-4 w-4" />}
            context={`${outreachStats.replied} Antworten · ${workflowCounts.outreach} bereit`}
            href="/outreach?status=SENT"
            accent="sky"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ZWEI-SPALTEN: PIPELINE + OPERATIVE BLÖCKE
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid gap-5 lg:grid-cols-3">
        
        {/* Pipeline (2/3) */}
        <div className="lg:col-span-2 rounded-xl bg-zinc-900 border border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-white">Pipeline</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {totalLeads} Leads · Ø Score {avgScore ? Math.round(avgScore) : "—"}
                {avgOpportunityScore && ` · Ø Opp ${Math.round(avgOpportunityScore)}`}
              </p>
            </div>
            <IconWrapper icon={BarChart2} className="h-4 w-4 text-zinc-600" />
          </div>

          <PipelineFunnel statusCounts={statusCounts} totalLeads={totalLeads} />

          {/* Pipeline Footer */}
          <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {won > 0 && (
                <span className="text-xs text-zinc-400">
                  <span className="font-semibold text-emerald-400">{won}</span> gewonnen
                </span>
              )}
              {errors.failedCrawls > 0 && (
                <Link href="/logs?filter=failed-crawls" className="text-xs text-red-400 hover:text-red-300">
                  {errors.failedCrawls} Crawl-Fehler
                </Link>
              )}
              {errors.failedDemos > 0 && (
                <Link href="/logs?filter=failed-demos" className="text-xs text-red-400 hover:text-red-300">
                  {errors.failedDemos} Demo-Fehler
                </Link>
              )}
            </div>
            <Link href="/leads" className="text-xs text-zinc-600 hover:text-white transition-colors flex items-center gap-1">
              Alle Leads <IconWrapper icon={ArrowRight} className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Operative Quick-Actions (1/3) */}
        <div className="space-y-4">
          {/* Workflow-Status */}
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Workflow</h2>
              <IconWrapper icon={Zap} className="h-4 w-4 text-zinc-600" />
            </div>
            
            <div className="space-y-2">
              <QuickStat 
                label="Crawl ausstehend" 
                value={workflowCounts.crawl} 
                href="/leads?status=NEW"
                color="zinc"
              />
              <QuickStat 
                label="Analyse ausstehend" 
                value={workflowCounts.analysis} 
                href="/leads?status=CRAWLED"
                color="zinc"
              />
              <QuickStat 
                label="Demo bereit" 
                value={workflowCounts.demo} 
                href="/leads?status=QUALIFIED"
                color="teal"
              />
              <QuickStat 
                label="Outreach bereit" 
                value={workflowCounts.outreach} 
                href="/leads?status=SITE_GENERATED"
                color="sky"
              />
            </div>
          </div>

          {/* Outreach-Status */}
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Outreach</h2>
              <IconWrapper icon={Send} className="h-4 w-4 text-zinc-600" />
            </div>
            
            <div className="space-y-2">
              <QuickStat 
                label="Mit Platzhaltern" 
                value={outreachStats.needsReview} 
                href="/outreach?status=NEEDS_REVIEW"
                color="amber"
              />
              <QuickStat 
                label="Freigabe offen" 
                value={outreachStats.readyToApprove} 
                href="/outreach?status=APPROVED"
                color="emerald"
              />
              <QuickStat 
                label="Blockiert" 
                value={outreachStats.blocked} 
                href="/outreach?status=BLOCKED"
                color="red"
              />
              <QuickStat 
                label="Entwürfe" 
                value={outreachStats.draft} 
                href="/outreach?status=DRAFT"
                color="zinc"
              />
            </div>
            
            <Link 
              href="/outreach" 
              className="mt-4 flex items-center justify-center gap-1 text-xs text-zinc-600 hover:text-white pt-3 border-t border-zinc-800 transition-colors"
            >
              Alle ansehen <IconWrapper icon={ArrowRight} className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          HANDLUNGSBEDARF (Detaillierte Liste)
          ═══════════════════════════════════════════════════════════════════ */}
      {actionItems.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/15">
                <IconWrapper icon={Target} className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <h2 className="text-sm font-semibold text-white">Handlungsbedarf</h2>
              <span className="rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold px-2 py-0.5 tabular-nums">
                {actionItems.length}
              </span>
            </div>
            <span className="text-xs text-zinc-600">Nach Dringlichkeit sortiert</span>
          </div>

          <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div className="divide-y divide-zinc-800/60">
              {actionItems.slice(0, 8).map((item) => {
                const colors = severityColors[item.severity];
                const Icon = iconMap[item.icon] || Play;
                
                return (
                  <div key={item.id} className="flex items-start gap-4 px-5 py-4 hover:bg-zinc-800/30 transition-colors">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${colors.bg} ${colors.border}`}>
                      <IconWrapper icon={Icon} className={`h-4 w-4 ${colors.text}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-sm font-medium text-white">{item.label}</p>
                        {item.count > 0 && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${colors.badge}`}>
                            {item.count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 mt-0.5">{item.sub}</p>
                      
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {item.leads.slice(0, 4).map((lead) => (
                          <Link
                            key={lead.id}
                            href={`/leads/${lead.id}`}
                            className="inline-flex items-center gap-1 rounded-md bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                          >
                            {lead.name}
                            {lead.meta && <span className="text-zinc-600">· {lead.meta}</span>}
                          </Link>
                        ))}
                        {item.count > 4 && (
                          <span className="text-xs text-zinc-600">+{item.count - 4} weitere</span>
                        )}
                      </div>
                    </div>
                    
                    <Link
                      href={item.href}
                      className="shrink-0 flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white border border-zinc-700 rounded-lg px-3 py-1.5 hover:border-zinc-600 transition-colors"
                    >
                      {item.cta} <IconWrapper icon={ChevronRight} className="h-3 w-3" />
                    </Link>
                  </div>
                );
              })}
            </div>
            
            {actionItems.length > 8 && (
              <div className="px-5 py-3 border-t border-zinc-800 text-center">
                <Link href="/leads" className="text-xs text-zinc-500 hover:text-white transition-colors">
                  +{actionItems.length - 8} weitere anzeigen
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          HIGH-VALUE LEADS (Opportunity Score)
          ═══════════════════════════════════════════════════════════════════ */}
      {highValueLeads.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <IconWrapper icon={TrendingUp} className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">High-Value Leads</h2>
              <span className="text-xs text-zinc-500">— nach Opportunity Score</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {highValueLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/leads/${lead.id}`}
                className="group rounded-xl bg-zinc-900 border border-zinc-800 p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-800 text-xs font-bold text-zinc-400 group-hover:bg-zinc-700 transition-colors">
                    {lead.name.slice(0, 2).toUpperCase()}
                  </div>
                  {lead.score && <ScorePill score={Math.round(lead.score)} />}
                </div>
                <p className="text-sm font-medium text-white mt-3 truncate">{lead.name}</p>
                <p className="text-xs text-zinc-600 truncate">{lead.domain}</p>
                <div className="flex items-center gap-2 mt-3">
                  <StatusBadge status={lead.status as LeadStatus} />
                  {lead.opportunityScore && (
                    <span className="text-xs text-emerald-400">
                      Opp {Math.round(lead.opportunityScore)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          ZWEI-SPALTEN: NEUESTE LEADS + AKTIVITÄT
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid gap-5 lg:grid-cols-2">
        
        {/* Neueste Leads */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Neueste Leads</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {activityMeta.newLeads24h > 0 && `+${activityMeta.newLeads24h} in den letzten 24h`}
              </p>
            </div>
            <Link href="/leads" className="flex items-center gap-1 text-xs text-zinc-600 hover:text-white transition-colors">
              Alle <IconWrapper icon={ArrowRight} className="h-3 w-3" />
            </Link>
          </div>
          
          {recentLeads.length === 0 ? (
            <EmptyState icon={Users} text="Noch keine Leads" />
          ) : (
            <div className="space-y-1">
              {recentLeads.map((lead: any) => {
                const score = lead.analyses[0]?.overallScore;
                const initials = lead.name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
                return (
                  <Link 
                    key={lead.id} 
                    href={`/leads/${lead.id}`}
                    className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-zinc-800/70 transition-colors"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-800 border border-zinc-700/50 text-xs font-bold text-zinc-400 group-hover:border-zinc-600 transition-colors">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{lead.name}</p>
                      <p className="text-xs text-zinc-600 truncate">{lead.domain}</p>
                    </div>
                    {score != null ? <ScorePill score={Math.round(score)} /> : <span className="text-xs text-zinc-700">—</span>}
                    <StatusBadge status={lead.status as LeadStatus} />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Aktivitäts-Feed */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Aktivität</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Letzte 7 Tage</p>
            </div>
            <Link href="/logs" className="flex items-center gap-1 text-xs text-zinc-600 hover:text-white transition-colors">
              Logs <IconWrapper icon={ArrowRight} className="h-3 w-3" />
            </Link>
          </div>
          
          {recentActivity.length === 0 ? (
            <EmptyState icon={Activity} text="Keine Aktivität" />
          ) : (
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {recentActivity.slice(0, 8).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 text-sm">
                  <ActivityIcon type={activity.eventType} severity={activity.severity} />
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-300 text-sm truncate">
                      {activity.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-zinc-600 mt-0.5">
                      {activity.companyName && (
                        <Link href={`/leads/${activity.companyId}`} className="hover:text-zinc-400 transition-colors">
                          {activity.companyName}
                        </Link>
                      )}
                      <span>·</span>
                      <span>{formatDateTime(new Date(activity.createdAt))}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          TOP-BRANCHEN
          ═══════════════════════════════════════════════════════════════════ */}
      {topIndustries.length > 0 && (
        <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <IconWrapper icon={Building2} className="h-4 w-4 text-zinc-600" />
              <h2 className="text-sm font-semibold text-white">Top-Branchen</h2>
            </div>
          </div>
          
          <div className="space-y-3">
            {topIndustries.map((ind) => (
              <div key={ind.industry} className="flex items-center gap-4">
                <span className="w-40 shrink-0 text-sm text-zinc-400 truncate">
                  {INDUSTRIES[ind.industry!] ?? ind.industry}
                </span>
                <div className="flex-1 h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-600 rounded-full transition-all duration-500"
                    style={{ width: `${(ind._count.industry / (topIndustries[0]._count.industry || 1)) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm text-zinc-500 tabular-nums">{ind._count.industry}</span>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-KOMPONENTEN
// ═══════════════════════════════════════════════════════════════════════════

function PipelineFunnel({ statusCounts, totalLeads }: { statusCounts: { status: string; _count: { status: number } }[], totalLeads: number }) {
  const statusMap = Object.fromEntries(statusCounts.map((s) => [s.status, s._count.status]));
  
  const funnelStages = [
    { status: "NEW",            label: "Neu",          count: statusMap["NEW"] ?? 0,            color: "bg-zinc-500", href: "/leads?status=NEW" },
    { status: "CRAWLED",        label: "Gecrawlt",     count: statusMap["CRAWLED"] ?? 0,        color: "bg-blue-500", href: "/leads?status=CRAWLED" },
    { status: "ANALYZED",       label: "Analysiert",   count: statusMap["ANALYZED"] ?? 0,       color: "bg-violet-500", href: "/leads?status=ANALYZED" },
    { status: "QUALIFIED",      label: "Qualifiziert", count: statusMap["QUALIFIED"] ?? 0,      color: "bg-emerald-500", href: "/leads?status=QUALIFIED" },
    { status: "SITE_GENERATED", label: "Demo erstellt",count: statusMap["SITE_GENERATED"] ?? 0, color: "bg-teal-500", href: "/leads?status=SITE_GENERATED" },
    { status: "SENT",           label: "Gesendet",     count: statusMap["SENT"] ?? 0,           color: "bg-sky-500", href: "/outreach?status=SENT" },
    { status: "WON",            label: "Gewonnen",     count: statusMap["WON"] ?? 0,            color: "bg-amber-500", href: "/leads?status=WON" },
  ];

  const maxFunnelCount = Math.max(...funnelStages.map((s) => s.count), 1);

  return (
    <div className="space-y-2.5">
      {funnelStages.map((stage) => {
        const pct = maxFunnelCount > 0 ? (stage.count / maxFunnelCount) * 100 : 0;
        const ofTotal = totalLeads > 0 ? Math.round((stage.count / totalLeads) * 100) : 0;
        
        return (
          <Link
            key={stage.status}
            href={stage.href}
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
              {stage.count > 0 && ofTotal > 0 && (
                <span className="text-xs text-zinc-700 tabular-nums">{ofTotal}%</span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function KpiCard({
  label, value, icon, context, href, accent,
}: {
  label: string; value: number; icon: React.ReactNode; context: string; href: string;
  accent: "zinc" | "emerald" | "teal" | "sky" | "amber" | "red";
}) {
  const accentBorder = {
    zinc: "group-hover:border-zinc-600",
    emerald: "group-hover:border-emerald-500/50",
    teal: "group-hover:border-teal-500/50",
    sky: "group-hover:border-sky-500/50",
    amber: "group-hover:border-amber-500/50",
    red: "group-hover:border-red-500/50",
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

function QuickStat({ label, value, href, color }: { label: string; value: number; href: string; color: string }) {
  if (value === 0) return null;
  
  const colorClasses: Record<string, { text: string; bg: string; border: string }> = {
    zinc: { text: "text-zinc-400", bg: "bg-zinc-800", border: "border-zinc-700" },
    amber: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    sky: { text: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
    teal: { text: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
    red: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  };
  
  const c = colorClasses[color] || colorClasses.zinc;
  
  return (
    <Link href={href} className="flex items-center justify-between group py-1">
      <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">{label}</span>
      <span className={`text-xs font-bold ${c.text} px-2 py-0.5 rounded ${c.bg} border ${c.border} tabular-nums`}>
        {value}
      </span>
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

function ActivityIcon({ type, severity }: { type: string; severity: string }) {
  const isError = severity === "ERROR" || severity === "HIGH";
  const isWarning = severity === "WARNING" || severity === "MEDIUM";
  
  if (type.includes("FAIL") || type.includes("ERROR") || isError) {
    return (
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-500/10">
        <IconWrapper icon={XCircle} className="h-3.5 w-3.5 text-red-400" />
      </div>
    );
  }
  
  if (type.includes("APPROV") || type.includes("SUCCESS")) {
    return (
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/10">
        <IconWrapper icon={CheckCircle} className="h-3.5 w-3.5 text-emerald-400" />
      </div>
    );
  }
  
  if (type.includes("SEND") || type.includes("OUTREACH")) {
    return (
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sky-500/10">
        <IconWrapper icon={Send} className="h-3.5 w-3.5 text-sky-400" />
      </div>
    );
  }
  
  if (type.includes("GENERAT") || type.includes("DEMO")) {
    return (
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-500/10">
        <IconWrapper icon={LayoutTemplate} className="h-3.5 w-3.5 text-teal-400" />
      </div>
    );
  }
  
  if (isWarning) {
    return (
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
        <IconWrapper icon={AlertTriangle} className="h-3.5 w-3.5 text-amber-400" />
      </div>
    );
  }
  
  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-zinc-800">
      <IconWrapper icon={Activity} className="h-3.5 w-3.5 text-zinc-500" />
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <IconWrapper icon={Icon} className="h-6 w-6 text-zinc-700 mb-2" />
      <p className="text-xs text-zinc-600">{text}</p>
    </div>
  );
}
