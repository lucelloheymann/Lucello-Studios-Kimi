import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
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
} from "lucide-react";

export default async function OutreachPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const drafts = await db.outreachDraft.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      company: { select: { name: true, id: true, status: true, domain: true } },
    },
  });

  const byStatus = {
    draft: drafts.filter((d) => d.status === "DRAFT"),
    approved: drafts.filter((d) => d.status === "APPROVED"),
    sent: drafts.filter((d) => d.status === "SENT"),
    replied: drafts.filter((d) => d.status === "REPLIED"),
  };

  const totalDrafts = drafts.length;

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Outreach</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Entwürfe, Freigaben und versendete Mails — kein Versand ohne Freigabe
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">Guardrails aktiv</span>
        </div>
      </div>

      {/* KPI-Leiste */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniKpi label="Warten auf Freigabe" value={byStatus.draft.length} icon={<Clock className="h-4 w-4 text-amber-400" />} accent="amber" />
        <MiniKpi label="Freigegeben" value={byStatus.approved.length} icon={<CheckCircle className="h-4 w-4 text-emerald-400" />} accent="emerald" />
        <MiniKpi label="Gesendet" value={byStatus.sent.length} icon={<Send className="h-4 w-4 text-sky-400" />} accent="sky" />
        <MiniKpi label="Antworten" value={byStatus.replied.length} icon={<MessageSquare className="h-4 w-4 text-violet-400" />} accent="violet" />
      </div>

      {/* Freigabeprozess-Workflow */}
      {totalDrafts > 0 && (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-5 py-4">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Freigabeprozess</p>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { step: "1", label: "Entwurf generiert", desc: "KI erstellt personalisierten Text", icon: <Clock className="h-3.5 w-3.5" />, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
              { step: "2", label: "Platzhalter prüfen", desc: "Keine [?]-Marker im Text", icon: <Eye className="h-3.5 w-3.5" />, color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
              { step: "3", label: "Manuell freigeben", desc: "Explizite Bestätigung erforderlich", icon: <ShieldCheck className="h-3.5 w-3.5" />, color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
              { step: "4", label: "Versand", desc: "Erst nach Freigabe möglich", icon: <Send className="h-3.5 w-3.5" />, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
            ].map((item, i, arr) => (
              <div key={item.step} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${item.color}`}>
                  {item.icon}
                  <div>
                    <p className="text-xs font-medium leading-none">{item.label}</p>
                    <p className="text-[10px] opacity-70 mt-0.5 leading-none">{item.desc}</p>
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-700 shrink-0" />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-600 mt-3">
            <Lock className="inline h-3 w-3 mr-1" />
            <code className="text-zinc-500">isBlockedForSend</code> kann nicht via API umgangen werden — Guardrail ist hart kodiert.
          </p>
        </div>
      )}

      {totalDrafts === 0 ? (
        /* Vollständiger Empty State */
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-12 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 mb-4">
            <Inbox className="h-6 w-6 text-zinc-500" />
          </div>
          <h2 className="text-base font-semibold text-white">Noch keine Outreach-Entwürfe</h2>
          <p className="text-sm text-zinc-500 mt-2 leading-relaxed max-w-sm">
            Sobald ein qualifizierter Lead einen KI-generierten Outreach-Entwurf hat, erscheint er hier zur Prüfung und Freigabe.
          </p>
          <div className="mt-5 pt-5 border-t border-zinc-800 w-full text-left space-y-2">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Wie entstehen Entwürfe?</p>
            {[
              "Lead crawlen und analysieren",
              "Score ≥ 50 → qualifiziert",
              "Outreach generieren lassen",
              "Hier freigeben und senden",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-500">
                  {i + 1}
                </span>
                <span className="text-sm text-zinc-400">{step}</span>
              </div>
            ))}
          </div>
          <Link
            href="/leads"
            className="mt-5 flex items-center gap-1.5 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors"
          >
            Leads ansehen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Freigabe ausstehend */}
          {byStatus.draft.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-white">Freigabe ausstehend</h2>
                <span className="rounded-full bg-amber-500/15 border border-amber-500/20 text-amber-400 text-xs font-semibold px-2 py-0.5">
                  {byStatus.draft.length}
                </span>
              </div>
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 divide-y divide-zinc-800">
                {byStatus.draft.map((draft) => (
                  <Link
                    key={draft.id}
                    href={`/leads/${draft.company.id}`}
                    className="group flex items-center justify-between px-4 py-3.5 hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{draft.company.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">{draft.subject}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {draft.isBlockedForSend ? (
                          <span className="flex items-center gap-1 text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                            <XCircle className="h-2.5 w-2.5" />
                            Versand blockiert
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                            <CheckCircle className="h-2.5 w-2.5" />
                            Nicht blockiert
                          </span>
                        )}
                        {draft.hasUnreviewedPlaceholders ? (
                          <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Platzhalter offen
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] bg-zinc-800 border border-zinc-700 text-zinc-500 px-1.5 py-0.5 rounded">
                            <CheckCircle className="h-2.5 w-2.5" />
                            Kein Platzhalter
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className="text-xs text-zinc-600">{formatDate(draft.createdAt)}</span>
                      <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Freigegeben */}
          {byStatus.approved.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">Freigegeben — bereit zum Senden</h2>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-2 py-0.5">
                  {byStatus.approved.length}
                </span>
              </div>
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 divide-y divide-zinc-800">
                {byStatus.approved.map((draft) => (
                  <div key={draft.id} className="flex items-center justify-between px-4 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{draft.company.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">{draft.subject}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <Link
                        href={`/leads/${draft.company.id}`}
                        className="text-xs text-zinc-500 hover:text-white border border-zinc-700 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        Ansehen
                      </Link>
                      <form action={`/api/outreach/${draft.id}/send`} method="POST">
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white text-zinc-900 rounded-lg hover:bg-zinc-100 font-medium transition-colors"
                        >
                          <Send className="h-3 w-3" />
                          Senden
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Gesendet */}
          {byStatus.sent.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Send className="h-4 w-4 text-sky-400" />
                <h2 className="text-sm font-semibold text-white">Gesendet</h2>
                <span className="text-xs text-zinc-600">{byStatus.sent.length}</span>
              </div>
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
                <div className="grid grid-cols-[1fr_1fr_100px_120px] items-center gap-4 px-4 py-2.5 border-b border-zinc-800 bg-zinc-950/50">
                  <span className="text-xs font-medium text-zinc-600 uppercase tracking-wider">Firma</span>
                  <span className="text-xs font-medium text-zinc-600 uppercase tracking-wider">Betreff</span>
                  <span className="text-xs font-medium text-zinc-600 uppercase tracking-wider">Gesendet</span>
                  <span className="text-xs font-medium text-zinc-600 uppercase tracking-wider">Status</span>
                </div>
                <div className="divide-y divide-zinc-800/60">
                  {byStatus.sent.map((draft) => (
                    <Link
                      key={draft.id}
                      href={`/leads/${draft.company.id}`}
                      className="group grid grid-cols-[1fr_1fr_100px_120px] items-center gap-4 px-4 py-3 hover:bg-zinc-800/50 transition-colors"
                    >
                      <span className="text-sm font-medium text-white truncate group-hover:text-zinc-100">
                        {draft.company.name}
                      </span>
                      <span className="text-xs text-zinc-500 truncate">{draft.subject}</span>
                      <span className="text-xs text-zinc-600 tabular-nums">
                        {draft.sentAt ? formatDate(draft.sentAt) : "—"}
                      </span>
                      <div>
                        <StatusBadge status={draft.company.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Antworten */}
          {byStatus.replied.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-violet-400" />
                <h2 className="text-sm font-semibold text-white">Antworten erhalten</h2>
                <span className="text-xs text-zinc-600">{byStatus.replied.length}</span>
              </div>
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 divide-y divide-zinc-800">
                {byStatus.replied.map((draft) => (
                  <Link
                    key={draft.id}
                    href={`/leads/${draft.company.id}`}
                    className="group flex items-center justify-between px-4 py-3.5 hover:bg-zinc-800/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{draft.company.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{draft.subject}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function MiniKpi({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: "amber" | "emerald" | "sky" | "violet";
}) {
  const bg = {
    amber: "bg-amber-500/10",
    emerald: "bg-emerald-500/10",
    sky: "bg-sky-500/10",
    violet: "bg-violet-500/10",
  }[accent];

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-500">{label}</span>
        <div className={`flex h-6 w-6 items-center justify-center rounded-md ${bg}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
    </div>
  );
}
