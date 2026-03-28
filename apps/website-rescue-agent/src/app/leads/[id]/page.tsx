import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
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
      pipelineStates: { orderBy: { createdAt: "desc" }, take: 8 },
      auditLogs: { orderBy: { createdAt: "desc" }, take: 10 },
      followUpTasks: { where: { completedAt: null }, orderBy: { dueAt: "asc" } },
    },
  });

  if (!company) notFound();

  const analysis = company.analyses[0];
  const crawl = company.crawls[0];
  const latestSite = company.generatedSites[0];
  const latestDraft = company.outreachDrafts[0];

  const strengths = (analysis?.strengths as string[] | null) ?? [];
  const weaknesses = (analysis?.weaknesses as string[] | null) ?? [];
  const quickWins = (analysis?.quickWins as string[] | null) ?? [];
  const score = analysis?.overallScore ?? null;

  const canCrawl = !crawl;
  const canAnalyze = !!crawl && !analysis;
  const canGenerateSite = !!analysis && !latestSite;
  const canGenerateOutreach = !!analysis && !latestDraft;

  const nextStep = canCrawl
    ? "Website crawlen"
    : canAnalyze
    ? "Website analysieren"
    : canGenerateSite
    ? "Demo erstellen"
    : canGenerateOutreach
    ? "Outreach erstellen"
    : null;

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

  return (
    <div className="p-6 max-w-7xl space-y-5">

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
              <StatusBadge status={company.status} />
              {analysis?.isQualified && (
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  <CheckCircle className="h-3 w-3" /> Qualifiziert
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

        {/* ── Action-Leiste ── */}
        <div className="border-t border-zinc-800 px-5 py-3 flex items-center gap-2 flex-wrap bg-zinc-950/30">
          <ActionBtn
            href={`/api/leads/${id}/crawl`}
            icon={<Play className="h-3.5 w-3.5" />}
            label="Crawlen"
            hint={crawl ? `Zuletzt ${formatDate(crawl.createdAt)}` : "Website laden & analysieren"}
            primary={canCrawl}
            done={!!crawl}
          />
          <ActionBtn
            href={`/api/leads/${id}/analyze`}
            icon={<Sparkles className="h-3.5 w-3.5" />}
            label="Analysieren"
            hint={!crawl ? "Erst crawlen" : analysis ? `Score: ${Math.round(analysis.overallScore ?? 0)}` : "KI-Analyse starten"}
            primary={canAnalyze}
            disabled={!crawl}
            done={!!analysis}
          />
          <ActionBtn
            href={`/api/leads/${id}/generate-site`}
            icon={<LayoutTemplate className="h-3.5 w-3.5" />}
            label="Demo erstellen"
            hint={!analysis ? "Erst analysieren" : latestSite ? "Demo vorhanden" : "Demo-Website generieren"}
            primary={canGenerateSite}
            disabled={!analysis}
            done={!!latestSite}
          />
          <ActionBtn
            href={`/api/leads/${id}/generate-outreach`}
            icon={<Send className="h-3.5 w-3.5" />}
            label="Outreach"
            hint={!analysis ? "Erst analysieren" : latestDraft ? "Entwurf vorhanden" : "Outreach-Mail generieren"}
            primary={canGenerateOutreach}
            disabled={!analysis}
            done={!!latestDraft}
          />

          {nextStep && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-zinc-600">
              <ArrowRight className="h-3 w-3" />
              Nächster Schritt: <span className="text-zinc-400">{nextStep}</span>
            </span>
          )}
        </div>
      </div>

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
        </div>

        {/* ─ RECHTE SPALTE (2/3) ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Analyse-Scorecard */}
          {analysis ? (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-zinc-500" />
                  <h3 className="text-sm font-semibold text-white">Analyse-Scorecard</h3>
                </div>
                <div className="flex items-center gap-2">
                  {analysis.isQualified ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                      <CheckCircle className="h-3 w-3" /> Qualifiziert
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-500">
                      <XCircle className="h-3 w-3" /> Nicht qualifiziert
                    </span>
                  )}
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
                          {strengths.slice(0, 4).map((s, i) => (
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
                          {weaknesses.slice(0, 5).map((w, i) => (
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
                      {quickWins.map((qw, i) => (
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
              {crawl && (
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
                  <span className="text-xs text-zinc-600">v{latestSite.version}</span>
                </div>
                <div className="flex items-center gap-2">
                  {latestSite.hasPlaceholders && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                      <AlertTriangle className="h-3 w-3" /> Platzhalter
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
              <div className="px-5 py-3 flex items-center gap-4 text-xs text-zinc-500">
                <span>Stil: <span className="text-zinc-400">{latestSite.style.replace(/_/g, " ")}</span></span>
                <span>Erstellt: <span className="text-zinc-400">{formatDate(latestSite.createdAt)}</span></span>
                {company.generatedSites.length > 1 && (
                  <span className="text-zinc-600">{company.generatedSites.length} Versionen</span>
                )}
              </div>
            </div>
          ) : analysis ? (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 border-dashed p-6 flex flex-col items-center text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 mb-2.5">
                <LayoutTemplate className="h-5 w-5 text-zinc-600" />
              </div>
              <p className="text-sm font-medium text-zinc-300">Noch keine Demo erstellt</p>
              <p className="text-xs text-zinc-600 mt-1">
                Demo-Website aus den Analyse-Daten generieren lassen.
              </p>
              <form action={`/api/leads/${id}/generate-site`} method="POST" className="mt-3">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 text-sm text-white border border-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <LayoutTemplate className="h-3.5 w-3.5" />
                  Demo generieren
                </button>
              </form>
            </div>
          ) : null}

          {/* Outreach-Entwurf */}
          {latestDraft ? (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-sky-500" />
                  <h3 className="text-sm font-semibold text-white">Outreach-Entwurf</h3>
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

              <div className="p-5 space-y-3">
                {latestDraft.redFlags && (latestDraft.redFlags as unknown[]).length > 0 && (
                  <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3 space-y-1.5">
                    {(latestDraft.redFlags as Array<{ severity: string; description: string }>).map((flag, i) => (
                      <p key={i} className="flex items-start gap-1.5 text-xs text-red-300">
                        <AlertTriangle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
                        {flag.description}
                      </p>
                    ))}
                  </div>
                )}

                {latestDraft.subject && (
                  <div>
                    <p className="text-xs text-zinc-600 mb-0.5">Betreff</p>
                    <p className="text-sm font-medium text-white">{latestDraft.subject}</p>
                  </div>
                )}
                {latestDraft.body && (
                  <div className="rounded-lg bg-zinc-800/50 border border-zinc-800 p-3">
                    <p className="text-xs text-zinc-400 whitespace-pre-line leading-relaxed">
                      {truncate(latestDraft.body, 500)}
                    </p>
                  </div>
                )}

                {latestDraft.status === "DRAFT" && (
                  <form action={`/api/outreach/${latestDraft.id}/approve`} method="POST">
                    <button
                      type="submit"
                      disabled={latestDraft.isBlockedForSend || latestDraft.hasUnreviewedPlaceholders}
                      className="flex items-center gap-1.5 text-sm font-medium bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Freigeben
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : analysis ? (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 border-dashed p-6 flex flex-col items-center text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 mb-2.5">
                <Send className="h-5 w-5 text-zinc-600" />
              </div>
              <p className="text-sm font-medium text-zinc-300">Noch kein Outreach-Entwurf</p>
              <p className="text-xs text-zinc-600 mt-1">
                KI generiert eine personalisierte Kontaktmail auf Basis der Analyse.
              </p>
              <form action={`/api/leads/${id}/generate-outreach`} method="POST" className="mt-3">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 text-sm text-white border border-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  Outreach generieren
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── VERLAUF ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-800">
          <Activity className="h-4 w-4 text-zinc-600" />
          <h3 className="text-sm font-semibold text-white">Pipeline-Verlauf</h3>
        </div>

        {company.pipelineStates.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Clock className="h-5 w-5 text-zinc-700 mb-2" />
            <p className="text-xs text-zinc-600">Noch keine Statuswechsel — Pipeline startet nach dem ersten Crawl.</p>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-2">
            {company.pipelineStates.map((state, i) => (
              <div key={state.id} className="flex items-center gap-3">
                <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${i === 0 ? "bg-white" : "bg-zinc-700"}`} />
                <span className="text-xs text-zinc-600 tabular-nums w-36 shrink-0">
                  {formatDateTime(state.createdAt)}
                </span>
                <StatusBadge status={state.toStatus} />
                {state.reason && (
                  <span className="text-xs text-zinc-600 truncate">{state.reason}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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

function ActionBtn({
  href,
  icon,
  label,
  hint,
  primary,
  disabled,
  done,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  hint: string;
  primary?: boolean;
  disabled?: boolean;
  done?: boolean;
}) {
  return (
    <form action={href} method="POST">
      <button
        type="submit"
        disabled={disabled || done}
        title={hint}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed ${
          done
            ? "bg-zinc-800/50 text-zinc-600 border border-zinc-800"
            : primary
            ? "bg-white text-zinc-900 hover:bg-zinc-100 shadow-sm"
            : disabled
            ? "bg-zinc-800/50 text-zinc-700 border border-zinc-800"
            : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-white"
        }`}
      >
        {done ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : icon}
        {label}
        {done && <span className="text-xs text-zinc-700">✓</span>}
      </button>
    </form>
  );
}
