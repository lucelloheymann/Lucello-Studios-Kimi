import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { LeadStatus } from "@/types";
import { STATUS_LABELS, INDUSTRIES, GERMAN_STATES, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";
import {
  Plus,
  Search,
  Users,
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  Globe,
  Send,
  AlertCircle,
  Zap,
} from "lucide-react";

interface SearchParams {
  status?: string;
  industry?: string;
  state?: string;
  q?: string;
  page?: string;
  view?: string; // "action" = Handlungsbedarf (NEW + CRAWLED)
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const pageSize = 25;

  const where: Record<string, unknown> = { isBlacklisted: false, isDuplicate: false };
  if (params.view === "action") {
    where.status = { in: [LeadStatus.NEW, LeadStatus.CRAWLED] };
  } else if (params.status) {
    where.status = params.status;
  }
  if (params.industry) where.industry = params.industry;
  if (params.state) where.state = params.state;
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { domain: { contains: params.q, mode: "insensitive" } },
      { city: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const hasFilters = !!(params.q || params.status || params.industry || params.state || params.view);

  const baseWhere = { isBlacklisted: false, isDuplicate: false };

  const [total, leads, summaryCounts, actionCount] = await Promise.all([
    db.company.count({ where }),
    db.company.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        analyses: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { overallScore: true, opportunityScore: true },
        },
      },
    }),
    db.company.groupBy({
      by: ["status"],
      _count: { status: true },
      where: baseWhere,
    }),
    db.company.count({
      where: { ...baseWhere, status: { in: [LeadStatus.NEW, LeadStatus.CRAWLED] } },
    }),
  ]);

  const statusMap = Object.fromEntries(summaryCounts.map((s) => [s.status, s._count.status]));
  const qualifiedCount = statusMap[LeadStatus.QUALIFIED] ?? 0;
  const siteGenCount = statusMap[LeadStatus.SITE_GENERATED] ?? 0;
  const draftCount = statusMap[LeadStatus.OUTREACH_DRAFT_READY] ?? 0;
  const totalAll = Object.values(statusMap).reduce((a, b) => a + b, 0);

  const totalPages = Math.ceil(total / pageSize);

  const chips = [
    { label: "Alle", value: totalAll, href: "/leads", active: !params.status && !params.view },
    {
      label: "Handlungsbedarf",
      value: actionCount,
      href: "/leads?view=action",
      active: params.view === "action",
      accent: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      accentActive: "text-amber-300 border-amber-400/50 bg-amber-500/20",
      dot: true,
    },
    {
      label: "Qualifiziert",
      value: qualifiedCount,
      href: "/leads?status=QUALIFIED",
      active: params.status === "QUALIFIED",
      accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      accentActive: "text-emerald-300 border-emerald-400/50 bg-emerald-500/20",
    },
    {
      label: "Demo erstellt",
      value: siteGenCount,
      href: "/leads?status=SITE_GENERATED",
      active: params.status === "SITE_GENERATED",
      accent: "text-teal-400 border-teal-500/30 bg-teal-500/10",
      accentActive: "text-teal-300 border-teal-400/50 bg-teal-500/20",
    },
    {
      label: "Entwurf bereit",
      value: draftCount,
      href: "/leads?status=OUTREACH_DRAFT_READY",
      active: params.status === "OUTREACH_DRAFT_READY",
      accent: "text-sky-400 border-sky-500/30 bg-sky-500/10",
      accentActive: "text-sky-300 border-sky-400/50 bg-sky-500/20",
    },
  ];

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Leads</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {total} {total === 1 ? "Eintrag" : "Einträge"}{hasFilters ? " gefunden" : " gesamt"}
          </p>
        </div>
        <Link
          href="/leads/new"
          className="flex items-center gap-1.5 rounded-lg bg-white text-zinc-900 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Lead hinzufügen
        </Link>
      </div>

      {/* Chip-Schnellfilter */}
      <div className="flex items-center gap-2 flex-wrap">
        {chips.map((chip) => {
          const isActive = chip.active;
          const defaultStyle = "text-zinc-400 border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:text-zinc-300";
          const activeDefault = "text-white border-zinc-600 bg-zinc-800";
          const accentStyle = chip.accent ?? defaultStyle;
          const accentActiveStyle = chip.accentActive ?? activeDefault;

          return (
            <Link
              key={chip.label}
              href={chip.href}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? (chip.accentActive ? accentActiveStyle : activeDefault)
                  : (chip.accent ? accentStyle : defaultStyle)
              }`}
            >
              {chip.dot && isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
              {chip.dot && !isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500/60" />
              )}
              {chip.label}
              <span className={`tabular-nums ${isActive ? "opacity-80" : "opacity-60"}`}>
                {chip.value}
              </span>
            </Link>
          );
        })}

        {/* Handlungsbedarf-Banner wenn aktiv */}
        {params.view === "action" && actionCount > 0 && (
          <div className="ml-auto flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs text-amber-300">
              {actionCount} {actionCount === 1 ? "Lead wartet" : "Leads warten"} auf nächsten Schritt
            </span>
          </div>
        )}
      </div>

      {/* Filterleiste */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3">
        <form className="flex gap-2 flex-wrap items-center" method="GET">
          {params.view && (
            <input type="hidden" name="view" value={params.view} />
          )}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Name, Domain oder Stadt..."
              className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
            />
          </div>

          {!params.view && (
            <select
              name="status"
              defaultValue={params.status ?? ""}
              className="bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
            >
              <option value="">Alle Status</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          )}

          <select
            name="industry"
            defaultValue={params.industry ?? ""}
            className="bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
          >
            <option value="">Alle Branchen</option>
            {Object.entries(INDUSTRIES).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <select
            name="state"
            defaultValue={params.state ?? ""}
            className="bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
          >
            <option value="">Alle Bundesländer</option>
            {Object.entries(GERMAN_STATES).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <button
            type="submit"
            className="flex items-center gap-1.5 bg-white text-zinc-900 px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtern
          </button>

          {hasFilters && (
            <Link
              href="/leads"
              className="px-3 py-2 text-sm text-zinc-500 hover:text-white border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors"
            >
              Zurücksetzen
            </Link>
          )}
        </form>
      </div>

      {/* Lead-Liste */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        {/* Tabellenkopf */}
        <div className="grid grid-cols-[1fr_150px_110px_110px_140px_90px] items-center gap-4 px-4 py-2.5 border-b border-zinc-800 bg-zinc-950/50">
          <span className="text-xs font-medium text-zinc-600 uppercase tracking-wider">Unternehmen</span>
          <span className="text-xs font-medium text-zinc-600 uppercase tracking-wider">Branche</span>
          <span className="text-xs font-medium text-zinc-600 uppercase tracking-wider">Standort</span>
          <span className="text-xs font-medium text-zinc-600 uppercase tracking-wider text-center">Score</span>
          <span className="text-xs font-medium text-zinc-600 uppercase tracking-wider">Status</span>
          <span className="text-xs font-medium text-zinc-600 uppercase tracking-wider">Erstellt</span>
        </div>

        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 mb-3">
              <Users className="h-5 w-5 text-zinc-600" />
            </div>
            <p className="text-sm font-medium text-zinc-300">
              {hasFilters ? "Keine Leads gefunden" : "Noch keine Leads"}
            </p>
            <p className="text-xs text-zinc-600 mt-1 max-w-xs">
              {hasFilters
                ? "Versuche andere Filter oder setze die Suche zurück."
                : "Füge deinen ersten Lead hinzu, um mit der Pipeline zu starten."}
            </p>
            {!hasFilters && (
              <Link
                href="/leads/new"
                className="mt-3 flex items-center gap-1 text-xs text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                Lead hinzufügen <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {leads.map((lead) => {
              const score = lead.analyses[0]?.overallScore ?? null;
              const oppScore = lead.analyses[0]?.opportunityScore ?? null;
              const isActionNeeded =
                lead.status === LeadStatus.NEW || lead.status === LeadStatus.CRAWLED;
              const initials = lead.name
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase();

              return (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="group grid grid-cols-[1fr_150px_110px_110px_140px_90px] items-center gap-4 px-4 py-3 hover:bg-zinc-800/50 transition-colors"
                >
                  {/* Firma */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-400 group-hover:border-zinc-600 transition-colors">
                      {initials}
                      {isActionNeeded && (
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-400 border border-zinc-900" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-zinc-100">
                        {lead.name}
                      </p>
                      <p className="text-xs text-zinc-600 truncate">{lead.domain ?? "—"}</p>
                    </div>
                  </div>

                  {/* Branche */}
                  <span className="text-xs text-zinc-500 truncate">
                    {INDUSTRIES[lead.industry ?? ""] ?? lead.industry ?? "—"}
                  </span>

                  {/* Standort */}
                  <span className="text-xs text-zinc-500 truncate">
                    {lead.city ?? "—"}
                    {lead.state && (
                      <span className="text-zinc-700 ml-1">
                        {lead.state.replace("DE-", "")}
                      </span>
                    )}
                  </span>

                  {/* Score */}
                  <div className="flex flex-col items-center gap-0.5">
                    {score !== null ? (
                      <>
                        <ScorePill score={Math.round(score)} />
                        {oppScore !== null && (
                          <span className="text-[10px] text-zinc-600 tabular-nums">
                            <Zap className="inline h-2.5 w-2.5 text-zinc-700 mr-0.5" />
                            {Math.round(oppScore)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-zinc-700">—</span>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <StatusBadge status={lead.status} />
                  </div>

                  {/* Datum */}
                  <span className="text-xs text-zinc-700 tabular-nums">
                    {formatDate(lead.createdAt)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-600 tabular-nums">
            Seite {page} von {totalPages} · {total} Einträge
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/leads?${new URLSearchParams({ ...params, page: String(page - 1) })}`}
                className="px-3 py-1.5 text-sm text-zinc-400 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors"
              >
                ← Zurück
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/leads?${new URLSearchParams({ ...params, page: String(page + 1) })}`}
                className="px-3 py-1.5 text-sm text-zinc-400 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Weiter →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ScorePill({ score }: { score: number }) {
  let cls = "text-red-400 bg-red-500/10 border-red-500/20";
  if (score >= 70) cls = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  else if (score >= 50) cls = "text-amber-400 bg-amber-500/10 border-amber-500/20";
  else if (score >= 35) cls = "text-orange-400 bg-orange-500/10 border-orange-500/20";

  return (
    <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-bold tabular-nums ${cls}`}>
      {score}
    </span>
  );
}
