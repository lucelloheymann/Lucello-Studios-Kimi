import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { TimelineSection, TimelineEvent } from "@/components/timeline/timeline-section";
import { ConversationSection } from "./conversation-section";
import { IconWrapper } from "@/components/ui/icon-wrapper";
import {
  STATUS_LABELS,
  INDUSTRIES,
  GERMAN_STATES,
  formatDate,
  formatDateTime,
  scoreToLabel,
  truncate,
} from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { LeadStatus } from "@/types";
import Link from "next/link";
import {
  Globe,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ExternalLink,
  Play,
  Sparkles,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  TrendingUp,
  Clock,
  Eye,
  User,
  Building2,
  ArrowRight,
  Activity,
  LayoutTemplate,
  ShieldCheck,
  Ban,
  RotateCcw,
  FileText,
  History,
  Target,
} from "lucide-react";

type Params = { params: Promise<{ id: string }> };

// ── Score helpers ──────────────────────────────────────────────────────────────

function scoreColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return "text-zinc-600";
  if (score >= 70) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  if (score >= 30) return "text-orange-400";
  return "text-red-400";
}

function scoreBg(score: number | null | undefined): string {
  if (score === null || score === undefined) return "bg-zinc-800 border-zinc-700";
  if (score >= 70) return "bg-emerald-500/10 border-emerald-500/20";
  if (score >= 50) return "bg-amber-500/10 border-amber-500/20";
  if (score >= 30) return "bg-orange-500/10 border-orange-500/20";
  return "bg-red-500/10 border-red-500/20";
}

function scoreGrade(score: number | null | undefined): string {
  if (score === null || score === undefined) return "Nicht analysiert";
  if (score >= 70) return "Gut";
  if (score >= 50) return "Mittel";
  if (score >= 30) return "Schwach";
  return "Kritisch";
}

// ── Workflow Status Check ─────────────────────────────────────────────────────

interface WorkflowStatus {
  canCrawl: boolean;
  canAnalyze: boolean;
  canQualify: boolean;
  canDisqualify: boolean;
  canGenerateSite: boolean;
  canGenerateOutreach: boolean;
  canApprove: boolean;
  canSend: boolean;
  crawlPending: boolean;
  analysisPending: boolean;
  sitePending: boolean;
  outreachPending: boolean;
  blocks: string[];
}

function getWorkflowStatus(
  company: {
    status: string;
    isQualified: boolean | null;
    crawls: { status: string }[];
    analyses: { status: string }[];
    generatedSites: { status: string }[];
    outreachDrafts: { status: string; isBlockedForSend: boolean; hasUnreviewedPlaceholders: boolean }[];
  }
): WorkflowStatus {
  const crawl = company.crawls[0];
  const analysis = company.analyses[0];
  const site = company.generatedSites[0];
  const draft = company.outreachDrafts[0];

  const blocks: string[] = [];

  // Check für Crawl
  const canCrawl = !crawl || crawl.status === "FAILED";
  const crawlPending = !!crawl && crawl.status === "PENDING";

  // Check für Analyse
  const canAnalyze = !!crawl && crawl.status === "COMPLETED" && (!analysis || analysis.status === "FAILED");
  const analysisPending = !!analysis && analysis.status === "PENDING";
  if (!crawl) blocks.push("Analyse: Erst crawlen");
  else if (crawl.status !== "COMPLETED") blocks.push("Analyse: Crawl noch nicht abgeschlossen");

  // Check für Qualifizierung
  const canQualify = !!analysis && analysis.status === "COMPLETED" && company.isQualified !== true;
  const canDisqualify = !!analysis && analysis.status === "COMPLETED" && company.isQualified !== false;

  // Check für Demo
  const canGenerateSite = !!analysis && analysis.status === "COMPLETED" && (!site || site.status === "REJECTED");
  const sitePending = !!site && site.status === "PENDING";
  if (!analysis) blocks.push("Demo: Erst analysieren");

  // Check für Outreach
  const canGenerateOutreach = !!analysis && analysis.status === "COMPLETED" && (!draft || draft.status === "REJECTED");
  const outreachPending = !!draft && draft.status === "PENDING";

  // Check für Freigabe
  const canApprove = !!draft && draft.status === "DRAFT" && !draft.isBlockedForSend && !draft.hasUnreviewedPlaceholders;

  // Check für Versand
  const canSend = !!draft && draft.status === "APPROVED";

  return {
    canCrawl,
    canAnalyze,
    canQualify,
    canDisqualify,
    canGenerateSite,
    canGenerateOutreach,
    canApprove,
    canSend,
    crawlPending,
    analysisPending,
    sitePending,
    outreachPending,
    blocks,
  };
}

// ── Next Action Component ─────────────────────────────────────────────────────

interface DraftInfo {
  id: string;
  status: string;
  isBlockedForSend: boolean;
  hasUnreviewedPlaceholders: boolean;
}

function NextActionCard({
  status,
  wf,
  hasCrawl,
  hasAnalysis,
  hasSite,
  hasDraft,
  isQualified,
}: {
  status: string;
  wf: WorkflowStatus;
  hasCrawl: boolean;
  hasAnalysis: boolean;
  hasSite: boolean;
  hasDraft: DraftInfo | null;
  isQualified: boolean | null;
}) {
  let action: { title: string; desc: string; cta: string; href: string; icon: React.ReactNode; variant: "primary" | "warning" | "info" } | null = null;

  if (wf.crawlPending) {
    action = {
      title: "Crawl läuft...",
      desc: "Die Website wird gerade gecrawlt. Bitte warten.",
      cta: "Aktualisieren",
      href: "#",
      icon: <Clock className="h-5 w-5 text-blue-400" />,
      variant: "info",
    };
  } else if (wf.analysisPending) {
    action = {
      title: "Analyse läuft...",
      desc: "Die KI-Analyse wird durchgeführt. Bitte warten.",
      cta: "Aktualisieren",
      href: "#",
      icon: <Clock className="h-5 w-5 text-violet-400" />,
      variant: "info",
    };
  } else if (wf.sitePending) {
    action = {
      title: "Demo wird erstellt...",
      desc: "Die Demo-Website wird generiert. Bitte warten.",
      cta: "Aktualisieren",
      href: "#",
      icon: <Clock className="h-5 w-5 text-teal-400" />,
      variant: "info",
    };
  } else if (wf.outreachPending) {
    action = {
      title: "Outreach wird erstellt...",
      desc: "Der Outreach-Entwurf wird generiert. Bitte warten.",
      cta: "Aktualisieren",
      href: "#",
      icon: <Clock className="h-5 w-5 text-sky-400" />,
      variant: "info",
    };
  } else if (wf.canCrawl) {
    action = {
      title: "Website crawlen",
      desc: "Starte den Crawl, um die Website zu analysieren.",
      cta: "Crawl starten",
      href: "crawl",
      icon: <Play className="h-5 w-5 text-blue-400" />,
      variant: "primary",
    };
  } else if (wf.canAnalyze) {
    action = {
      title: "Analyse erstellen",
      desc: "Führe eine 9-dimensionale KI-Analyse der Website durch.",
      cta: "Analyse starten",
      href: "analyze",
      icon: <Sparkles className="h-5 w-5 text-violet-400" />,
      variant: "primary",
    };
  } else if (wf.canQualify && isQualified === null) {
    action = {
      title: "Lead qualifizieren",
      desc: "Der Lead hat ein Score < 55. Soll er qualifiziert werden?",
      cta: "Qualifizieren",
      href: "qualify",
      icon: <Target className="h-5 w-5 text-emerald-400" />,
      variant: "primary",
    };
  } else if (wf.canGenerateSite && isQualified) {
    action = {
      title: "Demo-Website erstellen",
      desc: "Generiere eine Demo-Website basierend auf der Analyse.",
      cta: "Demo erstellen",
      href: "generate-site",
      icon: <LayoutTemplate className="h-5 w-5 text-teal-400" />,
      variant: "primary",
    };
  } else if (wf.canGenerateOutreach && isQualified && hasSite) {
    action = {
      title: "Outreach erstellen",
      desc: "Generiere einen personalisierten Outreach-Entwurf.",
      cta: "Outreach generieren",
      href: "generate-outreach",
      icon: <Send className="h-5 w-5 text-sky-400" />,
      variant: "primary",
    };
  } else if (hasDraft && (hasDraft as DraftInfo).status === "DRAFT") {
    if ((hasDraft as DraftInfo).isBlockedForSend || (hasDraft as DraftInfo).hasUnreviewedPlaceholders) {
      action = {
        title: "Outreach prüfen",
        desc: "Der Entwurf enthält Platzhalter oder ist blockiert. Bitte prüfen.",
        cta: "Zum Outreach",
        href: "#outreach",
        icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
        variant: "warning",
      };
    } else {
      const draftId = (hasDraft as DraftInfo).id;
      action = {
        title: "Outreach freigeben",
        desc: "Der Entwurf ist bereit zur Freigabe.",
        cta: "Freigeben",
        href: `/api/outreach/${draftId}/approve`,
        icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
        variant: "primary",
      };
    }
  } else if (hasDraft && (hasDraft as DraftInfo).status === "APPROVED") {
    const draftId = (hasDraft as DraftInfo).id;
    action = {
      title: "Outreach versenden",
      desc: "Der Entwurf ist freigegeben und kann versendet werden.",
      cta: "Senden",
      href: `/api/outreach/${draftId}/send`,
      icon: <Send className="h-5 w-5 text-sky-400" />,
      variant: "primary",
    };
  }

  if (!action) return null;

  const variantClasses = {
    primary: "bg-blue-500/10 border-blue-500/20",
    warning: "bg-amber-500/10 border-amber-500/20",
    info: "bg-zinc-800 border-zinc-700",
  };

  return (
    <div className={`rounded-xl border p-4 ${variantClasses[action.variant]}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900/50 shrink-0">
          {action.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white">{action.title}</h3>
          <p className="text-xs text-zinc-400 mt-0.5">{action.desc}</p>
          {action.href !== "#" && action.href !== "#outreach" && (
            <form action={action.href.startsWith("/api/outreach") ? action.href : `/api/leads/${status}/${action.href}`} method="POST" className="mt-3">
              <button
                type="submit"
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  action.variant === "primary"
                    ? "bg-white text-zinc-900 hover:bg-zinc-100"
                    : action.variant === "warning"
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "bg-zinc-700 text-white hover:bg-zinc-600"
                }`}
              >
                {action.cta}
                <ArrowRight className="h-3 w-3" />
              </button>
            </form>
          )}
          {action.href === "#outreach" && (
            <Link
              href="#outreach"
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors"
            >
              {action.cta}
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function LeadDetailPage({ params }: Params) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const company = await db.company.findUnique({
    where: { id },
    include: {
      contacts: true,
      crawls: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { pages: { orderBy: { pageType: "asc" } } },
      },
      analyses: { orderBy: { createdAt: "desc" }, take: 1 },
      generatedSites: { orderBy: { createdAt: "desc" }, take: 3 },
      outreachDrafts: { orderBy: { createdAt: "desc" }, take: 3 },
      pipelineStates: { orderBy: { createdAt: "desc" }, take: 20 },
      auditLogs: { orderBy: { createdAt: "desc" }, take: 20 },
      followUpTasks: { where: { completedAt: null }, orderBy: { dueAt: "asc" } },
      conversations: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          replies: { orderBy: { createdAt: "desc" } },
          followUps: { orderBy: { sequenceNumber: "asc" } },
        },
      },
    },
  });

  if (!company) notFound();

  const analysis = company.analyses[0];
  const crawl = company.crawls[0];
  const latestSite = company.generatedSites[0];
  const latestDraft = company.outreachDrafts[0];

  const strengths = analysis?.strengths ? JSON.parse(analysis.strengths) as string[] : [];
  const weaknesses = analysis?.weaknesses ? JSON.parse(analysis.weaknesses) as string[] : [];
  const quickWins = analysis?.quickWins ? JSON.parse(analysis.quickWins) as string[] : [];
  const score = analysis?.overallScore ?? null;

  const wf = getWorkflowStatus({
    status: company.status,
    isQualified: company.isQualified,
    crawls: company.crawls,
    analyses: company.analyses,
    generatedSites: company.generatedSites,
    outreachDrafts: company.outreachDrafts,
  });

  const dimScores = [
    { label: "Design", score: analysis?.designScore },
    { label: "Klarheit", score: analysis?.clarityScore },
    { label: "Conversion", score: analysis?.conversionScore },
    { label: "Vertrauen", score: analysis?.trustScore },
    { label: "UX", score: analysis?.uxScore },
    { label: "Mobile", score: analysis?.mobileScore },
    { label: "SEO", score: analysis?.seoScore },
    { label: "Performance", score: analysis?.performanceScore },
    { label: "Modernität", score: analysis?.modernityScore },
  ];

  // Timeline Events aus neuen AuditLogs (mit Event-Typen) und PipelineStates
  const allTimelineEvents = [
    // Neue strukturierte AuditLogs
    ...company.auditLogs.map((log) => ({
      id: log.id,
      eventType: log.eventType || "WORKFLOW",
      timestamp: log.createdAt,
      title: log.title || getAuditTitle(log.action),
      description: log.description || log.entityType || "",
      icon: getAuditIcon(log.action),
      color: getAuditColor(log.action, log.severity),
      severity: log.severity,
      isSystem: log.isSystem,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
    })),
    // Legacy: PipelineStates als Workflow-Events
    ...company.pipelineStates
      .filter((s) => !company.auditLogs.some((l) => l.action === "workflow.status_changed" && l.metadata?.includes(s.toStatus)))
      .map((s) => ({
        id: s.id,
        eventType: "WORKFLOW",
        timestamp: s.createdAt,
        title: `Status: ${STATUS_LABELS[s.toStatus as LeadStatus] || s.toStatus}`,
        description: s.reason || "Status gewechselt",
        icon: <Activity className="h-3.5 w-3.5" />,
        color: "text-zinc-400",
        severity: null,
        isSystem: true,
        metadata: { fromStatus: s.fromStatus, toStatus: s.toStatus },
      })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="p-6 max-w-7xl space-y-5" suppressHydrationWarning>

      {/* ── Zurück-Link ──────────────────────────────────────────────────── */}
      <Link
        href="/leads"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Zurück zu Leads
      </Link>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="p-5 flex items-start justify-between gap-6">

          {/* Linke Seite: Firma */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <StatusBadge status={company.status as LeadStatus} />
              {company.isQualified === true && (
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  <CheckCircle className="h-3 w-3" /> Qualifiziert
                </span>
              )}
              {company.isQualified === false && (
                <span className="inline-flex items-center gap-1 rounded-md border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                  <Ban className="h-3 w-3" /> Disqualifiziert
                </span>
              )}
              {company.industry && (
                <span className="text-xs text-zinc-600">
                  {INDUSTRIES[company.industry] ?? company.industry}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-white leading-tight truncate">
              {company.name}
            </h1>

            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {company.domain && (
                <a
                  href={company.websiteUrl ?? `https://${company.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {company.domain}
                  <ExternalLink className="h-3 w-3 text-zinc-600" />
                </a>
              )}
              {company.city && (
                <span className="flex items-center gap-1.5 text-sm text-zinc-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {company.city}
                  {company.state && `, ${GERMAN_STATES[company.state] ?? company.state}`}
                </span>
              )}
              <span className="text-xs text-zinc-600">
                Hinzugefügt {formatDate(company.createdAt)}
              </span>
            </div>
          </div>

          {/* Rechte Seite: Score-Block */}
          <div className={`flex shrink-0 flex-col items-center justify-center rounded-xl border px-6 py-4 min-w-[120px] ${score !== null ? scoreBg(score) : "bg-zinc-800/50 border-zinc-700"}`}>
            {score !== null ? (
              <>
                <span className={`text-4xl font-black tabular-nums leading-none ${scoreColor(score)}`}>
                  {Math.round(score)}
                </span>
                <span className="text-xs text-zinc-500 mt-1">von 100</span>
                <span className={`mt-2 text-xs font-semibold ${scoreColor(score)}`}>
                  {scoreGrade(score)}
                </span>
              </>
            ) : (
              <>
                <span className="text-3xl font-black text-zinc-700">—</span>
                <span className="text-xs text-zinc-600 mt-1">Kein Score</span>
                <span className="text-xs text-zinc-700 mt-1">noch nicht analysiert</span>
              </>
            )}
          </div>
        </div>

        {/* ── Action-Leiste mit Gating ── */}
        <div className="border-t border-zinc-800 px-5 py-3 flex items-center gap-2 flex-wrap bg-zinc-950/30">
          <WorkflowActionBtn
            href={`/api/leads/${id}/crawl`}
            icon={<Play className="h-3.5 w-3.5" />}
            label="Crawlen"
            hint={!crawl ? "Website laden & analysieren" : crawl.status === "FAILED" ? "Crawl fehlgeschlagen - Neu versuchen" : `Zuletzt ${formatDate(crawl.createdAt)}`}
            primary={wf.canCrawl}
            disabled={!wf.canCrawl}
            done={!!crawl && crawl.status === "COMPLETED"}
            pending={wf.crawlPending}
          />
          <WorkflowActionBtn
            href={`/api/leads/${id}/analyze`}
            icon={<Sparkles className="h-3.5 w-3.5" />}
            label="Analysieren"
            hint={!crawl ? "Erst crawlen" : analysis ? `Score: ${Math.round(analysis.overallScore ?? 0)}` : "KI-Analyse starten"}
            primary={wf.canAnalyze}
            disabled={!wf.canAnalyze}
            done={!!analysis && analysis.status === "COMPLETED"}
            pending={wf.analysisPending}
          />
          <WorkflowActionBtn
            href={`/api/leads/${id}/generate-site`}
            icon={<LayoutTemplate className="h-3.5 w-3.5" />}
            label="Demo erstellen"
            hint={!analysis ? "Erst analysieren" : !company.isQualified ? "Lead nicht qualifiziert" : latestSite ? "Demo vorhanden" : "Demo-Website generieren"}
            primary={wf.canGenerateSite && company.isQualified === true}
            disabled={!wf.canGenerateSite || !company.isQualified}
            done={!!latestSite}
            pending={wf.sitePending}
          />
          <WorkflowActionBtn
            href={`/api/leads/${id}/generate-outreach`}
            icon={<Send className="h-3.5 w-3.5" />}
            label="Outreach"
            hint={!analysis ? "Erst analysieren" : !company.isQualified ? "Lead nicht qualifiziert" : !latestSite ? "Erst Demo erstellen" : latestDraft ? "Entwurf vorhanden" : "Outreach-Mail generieren"}
            primary={wf.canGenerateOutreach && company.isQualified === true && !!latestSite}
            disabled={!wf.canGenerateOutreach || !company.isQualified || !latestSite}
            done={!!latestDraft}
            pending={wf.outreachPending}
          />
        </div>
      </div>

      {/* ── NÄCHSTE EMPFOHLENE AKTION ─────────────────────────────────────── */}
      <NextActionCard
        status={id}
        wf={wf}
        hasCrawl={!!crawl}
        hasAnalysis={!!analysis}
        hasSite={!!latestSite}
        hasDraft={latestDraft ? { id: latestDraft.id, status: latestDraft.status, isBlockedForSend: latestDraft.isBlockedForSend, hasUnreviewedPlaceholders: latestDraft.hasUnreviewedPlaceholders } : null}
        isQualified={company.isQualified}
      />

      {/* ── HAUPTGRID ─────────────────────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* ─ LINKE SPALTE ─────────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Stammdaten */}
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-zinc-600" />
              <h3 className="text-sm font-semibold text-white">Firmendaten</h3>
            </div>
            <div className="space-y-2.5">
              <InfoRow label="Branche" value={INDUSTRIES[company.industry ?? ""] ?? company.industry ?? "—"} />
              <InfoRow label="Ort" value={company.city ?? "—"} />
              <InfoRow
                label="Bundesland"
                value={company.state ? (GERMAN_STATES[company.state] ?? company.state) : "—"}
              />
              <InfoRow label="Quelle" value={company.searchSource ?? "Manuell"} />
              <InfoRow label="Hinzugefügt" value={formatDate(company.createdAt)} />
              {analysis && (
                <InfoRow label="Analysiert" value={formatDate(analysis.createdAt)} />
              )}
              {analysis?.opportunityScore !== null && analysis?.opportunityScore !== undefined && (
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <span className="text-xs text-zinc-500">Opportunity</span>
                  <span className={`text-xs font-bold ${scoreColor(analysis.opportunityScore)}`}>
                    {Math.round(analysis.opportunityScore)}/100
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Kontakt */}
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-zinc-600" />
              <h3 className="text-sm font-semibold text-white">Kontakt</h3>
            </div>

            {company.phone || company.email || company.contacts.length > 0 ? (
              <div className="space-y-2">
                {company.phone && (
                  <a
                    href={`tel:${company.phone}`}
                    className="flex items-center gap-2.5 text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                    {company.phone}
                  </a>
                )}
                {company.email && (
                  <a
                    href={`mailto:${company.email}`}
                    className="flex items-center gap-2.5 text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                    {company.email}
                  </a>
                )}
                {company.contacts.map((c) => (
                  <div key={c.id} className="pt-2 border-t border-zinc-800">
                    <p className="text-sm font-medium text-white">{c.name ?? "Unbekannt"}</p>
                    {c.role && <p className="text-xs text-zinc-500 mt-0.5">{c.role}</p>}
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="text-xs text-zinc-400 hover:text-white transition-colors">
                        {c.email}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-5 text-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 mb-2">
                  <User className="h-4 w-4 text-zinc-600" />
                </div>
                <p className="text-xs text-zinc-500">Noch keine Kontaktdaten erkannt</p>
                <p className="text-xs text-zinc-700 mt-1">Erscheinen nach dem Crawl</p>
              </div>
            )}
          </div>

          {/* Screenshot */}
          {crawl?.screenshotUrl && (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4 text-zinc-600" />
                <h3 className="text-sm font-semibold text-white">Original-Website</h3>
                <a
                  href={company.websiteUrl ?? `https://${company.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs text-zinc-600 hover:text-white transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="rounded-lg overflow-hidden border border-zinc-800">
                <img
                  src={crawl.screenshotUrl}
                  alt={`Screenshot ${company.domain}`}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Crawl Status */}
          {crawl && (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-4 w-4 text-zinc-600" />
                <h3 className="text-sm font-semibold text-white">Crawl-Status</h3>
              </div>
              <div className="space-y-2">
                <InfoRow label="Status" value={crawl.status === "COMPLETED" ? "Abgeschlossen" : crawl.status === "FAILED" ? "Fehlgeschlagen" : "In Bearbeitung"} />
                <InfoRow label="Seiten" value={`${crawl.pageCount} Seiten`} />
                <InfoRow label="Ladezeit" value={`${crawl.loadTimeMs}ms`} />
                {crawl.errorMessage && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2 mt-2">
                    <p className="text-xs text-red-400">{crawl.errorMessage}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─ RECHTE SPALTE (2/3) ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Qualifizierungs-Status */}
          {analysis && (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-zinc-500" />
                  <h3 className="text-sm font-semibold text-white">Qualifizierung</h3>
                </div>
                {company.isQualified === true ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                    <CheckCircle className="h-3 w-3" /> Qualifiziert
                  </span>
                ) : company.isQualified === false ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                    <Ban className="h-3 w-3" /> Disqualifiziert
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-500">
                    <Clock className="h-3 w-3" /> Ausstehend
                  </span>
                )}
              </div>
              <div className="p-5">
                {company.isQualified === null ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-300">Soll dieser Lead qualifiziert werden?</p>
                      <p className="text-xs text-zinc-500 mt-1">Score: {Math.round(score ?? 0)}/100 - {score && score < 55 ? "Empfohlen" : "Nicht empfohlen"}</p>
                    </div>
                    <div className="flex gap-2">
                      <form action={`/api/leads/${id}/disqualify`} method="POST">
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 text-sm text-zinc-400 border border-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Ablehnen
                        </button>
                      </form>
                      <form action={`/api/leads/${id}/qualify`} method="POST">
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-500 transition-colors"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Qualifizieren
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">
                    {company.isQualified
                      ? "Dieser Lead wurde für den Relaunch-Pitch qualifiziert."
                      : "Dieser Lead wurde nicht qualifiziert."}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Analyse-Scorecard */}
          {analysis ? (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-zinc-500" />
                  <h3 className="text-sm font-semibold text-white">Analyse-Scorecard</h3>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Executive Summary */}
                {analysis.executiveSummary && (
                  <div className="rounded-lg bg-zinc-800/50 border border-zinc-800 px-4 py-3">
                    <p className="text-xs font-medium text-zinc-500 mb-1">Zusammenfassung</p>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {analysis.executiveSummary}
                    </p>
                  </div>
                )}

                {/* Dimensions-Grid */}
                <div>
                  <p className="text-xs font-medium text-zinc-600 uppercase tracking-wider mb-3">
                    Teil-Scores
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {dimScores.map(({ label, score: s }) => (
                      <div
                        key={label}
                        className={`rounded-lg border p-3 flex flex-col items-center ${scoreBg(s)}`}
                      >
                        <span className={`text-xl font-black tabular-nums leading-none ${scoreColor(s)}`}>
                          {s !== null && s !== undefined ? Math.round(s) : "—"}
                        </span>
                        <span className="text-xs text-zinc-500 mt-1">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stärken & Schwächen */}
                {(strengths.length > 0 || weaknesses.length > 0) && (
                  <div className="grid grid-cols-2 gap-3">
                    {strengths.length > 0 && (
                      <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 p-3">
                        <p className="text-xs font-semibold text-emerald-500 mb-2 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Stärken
                        </p>
                        <ul className="space-y-1.5">
                          {strengths.slice(0, 4).map((s: string, i: number) => (
                            <li key={i} className="text-xs text-zinc-300 leading-snug flex items-start gap-1.5">
                              <span className="text-emerald-600 mt-0.5 shrink-0">·</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {weaknesses.length > 0 && (
                      <div className="rounded-lg bg-red-500/5 border border-red-500/15 p-3">
                        <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Schwächen
                        </p>
                        <ul className="space-y-1.5">
                          {weaknesses.slice(0, 5).map((w: string, i: number) => (
                            <li key={i} className="text-xs text-zinc-300 leading-snug flex items-start gap-1.5">
                              <span className="text-red-600 mt-0.5 shrink-0">·</span>
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Wins */}
                {quickWins.length > 0 && (
                  <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
                    <p className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                      <Zap className="h-3 w-3" /> Quick Wins — Sofortmaßnahmen
                    </p>
                    <div className="space-y-2">
                      {quickWins.map((qw: string, i: number) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-amber-500/20 text-xs font-bold text-amber-400 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-xs text-zinc-300 leading-snug">{qw}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* No analysis yet */
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-8 flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 mb-3">
                <TrendingUp className="h-6 w-6 text-zinc-600" />
              </div>
              <p className="text-sm font-semibold text-white">Noch keine Analyse</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                {crawl
                  ? "Website wurde gecrawlt. KI-Analyse starten um Scores, Stärken und Schwächen zu sehen."
                  : "Erst die Website crawlen, dann analysieren — der Score und alle Insights erscheinen hier."}
              </p>
              {crawl && crawl.status === "COMPLETED" && (
                <form action={`/api/leads/${id}/analyze`} method="POST" className="mt-4">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 bg-white text-zinc-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
                  >
                    <Sparkles className="h-4 w-4" />
                    Analyse starten
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Demo-Website */}
          {latestSite ? (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4 text-teal-500" />
                  <h3 className="text-sm font-semibold text-white">Demo-Website</h3>
                  <span className="text-xs text-zinc-600">
                    v{latestSite.version}{latestSite.variant !== "A" ? `/${latestSite.variant}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {latestSite.errorCode && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                      <AlertTriangle className="h-3 w-3" /> Fehler
                    </span>
                  )}
                  {latestSite.hasPlaceholders && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                      <AlertTriangle className="h-3 w-3" /> 
                      {latestSite.placeholderCount || ""} Platzhalter
                    </span>
                  )}
                  <Link
                    href={`/generated-sites/${latestSite.id}`}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white border border-zinc-700 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    Vollansicht <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
              
              {/* Zusammenfassung */}
              {latestSite.summary && (
                <div className="px-5 py-3 border-b border-zinc-800/50">
                  <p className="text-xs text-zinc-400">{latestSite.summary}</p>
                </div>
              )}
              
              {/* Meta-Infos */}
              <div className="px-5 py-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-zinc-600">Stil:</span>{" "}
                  <span className="text-zinc-400">{latestSite.style.replace(/_/g, " ")}</span>
                </div>
                <div>
                  <span className="text-zinc-600">Status:</span>{" "}
                  <span className={latestSite.status === "GENERATED" ? "text-emerald-400" : "text-zinc-400"}>
                    {latestSite.status}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-600">Erstellt:</span>{" "}
                  <span className="text-zinc-400">{formatDate(latestSite.createdAt)}</span>
                </div>
                {latestSite.generationTimeMs && (
                  <div>
                    <span className="text-zinc-600">Dauer:</span>{" "}
                    <span className="text-zinc-400">{(latestSite.generationTimeMs / 1000).toFixed(1)}s</span>
                  </div>
                )}
                {company.generatedSites.length > 1 && (
                  <div className="col-span-2">
                    <span className="text-zinc-600">Versionen:</span>{" "}
                    <span className="text-zinc-400">{company.generatedSites.length} Varianten verfügbar</span>
                  </div>
                )}
              </div>
              
              {/* Fehler-Anzeige */}
              {latestSite.errorCode && (
                <div className="px-5 pb-3">
                  <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3">
                    <p className="text-xs text-red-400 font-medium">{latestSite.errorCode}</p>
                    {latestSite.errorDetails && (
                      <p className="text-xs text-zinc-500 mt-1">{latestSite.errorDetails}</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Platzhalter-Warnung */}
              {latestSite.hasPlaceholders && !latestSite.errorCode && (
                <div className="px-5 pb-3">
                  <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-2">
                    <p className="text-xs text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Diese Demo enthält Platzhalter, die vor dem Versand geprüft werden müssen.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Review-Info */}
              {latestSite.reviewedAt && (
                <div className="px-5 py-2 bg-emerald-500/5 border-t border-zinc-800">
                  <p className="text-xs text-emerald-400">
                    Geprüft am {formatDate(latestSite.reviewedAt)}
                    {latestSite.reviewRating && ` • ${latestSite.reviewRating}/5 Sterne`}
                  </p>
                </div>
              )}
              
              {/* Vorschau / Thumbnail */}
              <div className="px-5 py-3 border-t border-zinc-800">
                <p className="text-xs text-zinc-600 mb-2">Vorschau</p>
                {latestSite.screenshotUrl || latestSite.thumbnailUrl ? (
                  <div className="rounded-lg overflow-hidden border border-zinc-800">
                    <img 
                      src={latestSite.thumbnailUrl || latestSite.screenshotUrl || ""} 
                      alt="Demo Vorschau"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                ) : latestSite.previewUrl ? (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 h-32 flex items-center justify-center">
                    <Link 
                      href={latestSite.previewUrl}
                      target="_blank"
                      className="text-xs text-zinc-500 hover:text-white flex items-center gap-1.5"
                    >
                      <IconWrapper icon={Eye} className="h-4 w-4" />
                      Preview öffnen
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-lg border border-zinc-800 border-dashed bg-zinc-950 h-32 flex flex-col items-center justify-center text-zinc-600">
                    <IconWrapper icon={LayoutTemplate} className="h-8 w-8 mb-2" />
                    <span className="text-xs">Keine Vorschau verfügbar</span>
                  </div>
                )}
              </div>
              
              {/* Aktionen: Regeneration / Retry */}
              <div className="px-5 py-3 border-t border-zinc-800 flex gap-2">
                {latestSite.errorCode ? (
                  <form action={`/api/leads/${id}/generate-site`} method="POST" className="flex-1">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-1.5 text-sm bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-500 transition-colors"
                    >
                      <IconWrapper icon={RotateCcw} className="h-3.5 w-3.5" />
                      Erneut versuchen
                    </button>
                  </form>
                ) : (
                  <form action={`/api/leads/${id}/generate-site`} method="POST" className="flex-1">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-1.5 text-sm text-zinc-400 border border-zinc-700 px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      <IconWrapper icon={Sparkles} className="h-3.5 w-3.5" />
                      Neu generieren
                    </button>
                  </form>
                )}
                
                {company.generatedSites.length > 1 && (
                  <Link
                    href={`/leads/${id}/demos`}
                    className="flex items-center justify-center gap-1.5 text-sm text-zinc-400 border border-zinc-700 px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <IconWrapper icon={History} className="h-3.5 w-3.5" />
                    {company.generatedSites.length} Versionen
                  </Link>
                )}
              </div>
            </div>
          ) : analysis && company.isQualified ? (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 border-dashed p-6 flex flex-col items-center text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 mb-2.5">
                <LayoutTemplate className="h-5 w-5 text-zinc-600" />
              </div>
              <p className="text-sm font-medium text-zinc-300">Noch keine Demo erstellt</p>
              <p className="text-xs text-zinc-600 mt-1">
                Demo-Website aus den Analyse-Daten generieren lassen.
              </p>
              {wf.canGenerateSite && (
                <form action={`/api/leads/${id}/generate-site`} method="POST" className="mt-3">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 text-sm text-white border border-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <LayoutTemplate className="h-3.5 w-3.5" />
                    Demo generieren
                  </button>
                </form>
              )}
            </div>
          ) : analysis && !company.isQualified ? (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 border-dashed p-6 flex flex-col items-center text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 mb-2.5">
                <LayoutTemplate className="h-5 w-5 text-zinc-600" />
              </div>
              <p className="text-sm font-medium text-zinc-300">Demo nicht verfügbar</p>
              <p className="text-xs text-zinc-600 mt-1">
                Lead muss zuerst qualifiziert werden, bevor eine Demo erstellt werden kann.
              </p>
            </div>
          ) : null}

          {/* Outreach-Entwurf */}
          {latestDraft ? (
            <div id="outreach" className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-sky-500" />
                  <h3 className="text-sm font-semibold text-white">Outreach-Entwurf</h3>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    latestDraft.status === "DRAFT" ? "bg-amber-500/10 text-amber-400" :
                    latestDraft.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400" :
                    latestDraft.status === "SENT" ? "bg-sky-500/10 text-sky-400" :
                    "bg-zinc-800 text-zinc-400"
                  }`}>
                    {latestDraft.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {latestDraft.isBlockedForSend && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                      <AlertTriangle className="h-3 w-3" /> Blockiert
                    </span>
                  )}
                  {latestDraft.hasUnreviewedPlaceholders && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                      <AlertTriangle className="h-3 w-3" /> Platzhalter
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Red Flags */}
                {(() => {
                  const redFlags = latestDraft.redFlags ? JSON.parse(latestDraft.redFlags) : [];
                  return redFlags.length > 0 && (
                    <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3 space-y-1.5">
                      {redFlags.map((flag: { severity: string; description: string }, i: number) => (
                        <p key={i} className="flex items-start gap-1.5 text-xs text-red-300">
                          <AlertTriangle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
                          {flag.description}
                        </p>
                      ))}
                    </div>
                  );
                })()}

                {/* Empfänger */}
                <div className="rounded-lg bg-zinc-800/30 border border-zinc-800 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-zinc-600">Empfänger</p>
                    {latestDraft.status === "DRAFT" && (
                      <Link
                        href={`/outreach/${latestDraft.id}/edit`}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Bearbeiten
                      </Link>
                    )}
                  </div>
                  <p className="text-sm font-medium text-white">
                    {latestDraft.recipientName || company.name}
                  </p>
                  {latestDraft.recipientEmail && (
                    <a href={`mailto:${latestDraft.recipientEmail}`} className="text-xs text-zinc-400 hover:text-white">
                      {latestDraft.recipientEmail}
                    </a>
                  )}
                  {latestDraft.recipientRole && (
                    <p className="text-xs text-zinc-600 mt-0.5">{latestDraft.recipientRole}</p>
                  )}
                </div>

                {/* Nachricht */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-zinc-600">Betreff</p>
                  </div>
                  <p className="text-sm font-medium text-white">{latestDraft.subject}</p>
                </div>
                
                <div className="rounded-lg bg-zinc-800/50 border border-zinc-800 p-3">
                  <p className="text-xs text-zinc-600 mb-2">Nachricht</p>
                  <p className="text-xs text-zinc-400 whitespace-pre-line leading-relaxed">
                    {truncate(latestDraft.body || "", 500)}
                  </p>
                  {latestDraft.body && latestDraft.body.length > 500 && (
                    <Link
                      href={`/outreach/${latestDraft.id}`}
                      className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block"
                    >
                      Vollständig anzeigen →
                    </Link>
                  )}
                </div>

                {/* Angebot */}
                {(latestDraft.offerPriceRange || latestDraft.offerValidUntil) && (
                  <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
                    <p className="text-xs text-emerald-600 mb-1">Angebot</p>
                    {latestDraft.offerPriceRange && (
                      <p className="text-sm font-medium text-emerald-400">{latestDraft.offerPriceRange}</p>
                    )}
                    {latestDraft.offerValidUntil && (
                      <p className="text-xs text-zinc-500">
                        Gültig bis {formatDate(latestDraft.offerValidUntil)}
                      </p>
                    )}
                  </div>
                )}

                {/* Edit-History (nur wenn bearbeitet) */}
                {latestDraft.editCount > 0 && (
                  <div className="rounded-lg bg-zinc-800/30 p-2">
                    <p className="text-xs text-zinc-600">
                      {latestDraft.editCount}x bearbeitet
                      {latestDraft.lastEditedAt && ` • Letzte Änderung ${formatDateTime(latestDraft.lastEditedAt)}`}
                    </p>
                  </div>
                )}

                {/* Action Buttons je nach Status */}
                {latestDraft.status === "DRAFT" && (
                  <div className="flex gap-2">
                    <form action={`/api/outreach/${latestDraft.id}/approve`} method="POST" className="flex-1">
                      <button
                        type="submit"
                        disabled={latestDraft.isBlockedForSend || latestDraft.hasUnreviewedPlaceholders}
                        className="w-full flex items-center justify-center gap-1.5 text-sm font-medium bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Freigeben
                      </button>
                    </form>
                  </div>
                )}

                {latestDraft.status === "APPROVED" && (
                  <div className="flex gap-2">
                    <form action={`/api/outreach/${latestDraft.id}/send`} method="POST" className="flex-1">
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-1.5 text-sm font-medium bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-500 transition-colors"
                      >
                        <Send className="h-4 w-4" />
                        Versenden
                      </button>
                    </form>
                  </div>
                )}

                {/* Freigabe-Historie */}
                {latestDraft.approvedAt && (
                  <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Freigegeben am {formatDateTime(latestDraft.approvedAt)}
                      {latestDraft.approvedBy && ` von ${latestDraft.approvedBy}`}
                    </p>
                    {latestDraft.approvalNotes && (
                      <p className="text-xs text-zinc-500 mt-1 ml-4">{latestDraft.approvalNotes}</p>
                    )}
                  </div>
                )}

                {latestDraft.rejectedAt && (
                  <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3">
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Abgelehnt am {formatDateTime(latestDraft.rejectedAt)}
                    </p>
                    {latestDraft.rejectionReason && (
                      <p className="text-xs text-zinc-500 mt-1 ml-4">{latestDraft.rejectionReason}</p>
                    )}
                  </div>
                )}

                {latestDraft.status === "SENT" && latestDraft.sentAt && (
                  <div className="rounded-lg bg-sky-500/5 border border-sky-500/20 p-3">
                    <p className="text-xs text-sky-400 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Versendet am {formatDateTime(latestDraft.sentAt)}
                      {latestDraft.sentBy && ` von ${latestDraft.sentBy}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : analysis && company.isQualified && latestSite ? (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 border-dashed p-6 flex flex-col items-center text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 mb-2.5">
                <Send className="h-5 w-5 text-zinc-600" />
              </div>
              <p className="text-sm font-medium text-zinc-300">Noch kein Outreach-Entwurf</p>
              <p className="text-xs text-zinc-600 mt-1">
                KI generiert eine personalisierte Kontaktmail auf Basis der Analyse.
              </p>
              {wf.canGenerateOutreach && (
                <form action={`/api/leads/${id}/generate-outreach`} method="POST" className="mt-3">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 text-sm text-white border border-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Outreach generieren
                  </button>
                </form>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* ── CONVERSATION ─────────────────────────────────────────────────── */}
      <ConversationSection 
        companyId={company.id} 
        conversation={(company.conversations[0] as any) || null} 
      />

      {/* ── TIMELINE / VERLAUF ───────────────────────────────────────────── */}
      <TimelineSection events={allTimelineEvents as TimelineEvent[]} />

    </div>
  );
}

// ── Sub-Komponenten ────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-zinc-600 shrink-0">{label}</span>
      <span className="text-xs font-medium text-zinc-300 text-right truncate">{value}</span>
    </div>
  );
}

function WorkflowActionBtn({
  href,
  icon,
  label,
  hint,
  primary,
  disabled,
  done,
  pending,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  hint: string;
  primary?: boolean;
  disabled?: boolean;
  done?: boolean;
  pending?: boolean;
}) {
  return (
    <form action={href} method="POST">
      <button
        type="submit"
        disabled={disabled || done || pending}
        title={hint}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed ${
          done
            ? "bg-zinc-800/50 text-zinc-600 border border-zinc-800"
            : pending
            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse"
            : primary
            ? "bg-white text-zinc-900 hover:bg-zinc-100 shadow-sm"
            : disabled
            ? "bg-zinc-800/50 text-zinc-700 border border-zinc-800"
            : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-white"
        }`}
      >
        {done ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : pending ? <Clock className="h-3.5 w-3.5" /> : icon}
        {label}
        {done && <span className="text-xs text-zinc-700">✓</span>}
        {pending && <span className="text-xs">...</span>}
      </button>
    </form>
  );
}

// ── Helper für Timeline ───────────────────────────────────────────────────────

function getAuditTitle(action: string): string {
  const titles: Record<string, string> = {
    "outreach.approved": "Outreach freigegeben",
    "outreach.sent": "Outreach versendet",
    "outreach.rejected": "Outreach abgelehnt",
    "site.generated": "Demo-Website erstellt",
    "analysis.completed": "Analyse abgeschlossen",
    "crawl.completed": "Crawl abgeschlossen",
    "lead.status_changed": "Status geändert",
  };
  return titles[action] || action;
}

function getAuditIcon(action: string): React.ReactNode {
  if (action.includes("outreach")) return <Send className="h-3.5 w-3.5" />;
  if (action.includes("site")) return <LayoutTemplate className="h-3.5 w-3.5" />;
  if (action.includes("analysis")) return <TrendingUp className="h-3.5 w-3.5" />;
  if (action.includes("crawl")) return <Globe className="h-3.5 w-3.5" />;
  return <FileText className="h-3.5 w-3.5" />;
}

function getAuditColor(action: string, severity?: string | null): string {
  // Severity hat Priorität
  if (severity === "CRITICAL") return "text-red-500";
  if (severity === "ERROR") return "text-red-400";
  if (severity === "WARNING") return "text-amber-400";
  
  // Dann Action-basiert
  if (action.includes("approved")) return "text-emerald-400";
  if (action.includes("sent")) return "text-sky-400";
  if (action.includes("rejected")) return "text-red-400";
  if (action.includes("failed")) return "text-red-400";
  if (action.includes("completed")) return "text-blue-400";
  if (action.includes("started")) return "text-violet-400";
  return "text-zinc-400";
}


