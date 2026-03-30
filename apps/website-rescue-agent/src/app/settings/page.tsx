import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { GERMAN_STATES, INDUSTRIES } from "@/lib/utils";
import { getAllQueueStats } from "@/lib/queue";
import { getCurrentModelInfo } from "@/lib/llm";
import { Cpu, Radio, MapPin, Settings2, AlertTriangle, CheckCircle, Activity } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [searchConfigs, queueStats, modelInfo] = await Promise.all([
    db.searchConfiguration.findMany({ orderBy: { createdAt: "desc" } }),
    getAllQueueStats().catch(() => []),
    Promise.resolve(getCurrentModelInfo()),
  ]);

  const workerOnline = queueStats.length > 0;
  const totalFailed = queueStats.reduce((s, q) => s + q.failed, 0);
  const totalActive = queueStats.reduce((s, q) => s + q.active, 0);

  return (
    <div className="space-y-5 p-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white tracking-tight">Einstellungen</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Systemkonfiguration, Modelle und Suchgebiete
        </p>
      </div>

      {/* LLM-Modelle */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
            <Cpu className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">LLM-Modelle</h2>
            <p className="text-xs text-zinc-500">Konfigurierbar via <code className="text-zinc-400">.env → LLM_PROVIDER</code></p>
          </div>
        </div>
        <div className="p-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Object.entries(modelInfo).map(([purpose, model]) => (
            <div key={purpose} className="flex items-center justify-between rounded-lg bg-zinc-800/50 border border-zinc-800 px-3 py-2.5">
              <span className="text-xs font-medium text-zinc-400 capitalize">{purpose}</span>
              <span className="text-xs font-mono text-white bg-zinc-800 px-2 py-0.5 rounded">{model}</span>
            </div>
          ))}
        </div>
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 rounded-lg bg-zinc-800/50 border border-zinc-800 px-3 py-2">
            <span className="text-xs text-zinc-500">Provider:</span>
            <span className="text-xs font-semibold text-white">gemini</span>
            <span className="text-xs text-zinc-600 ml-auto">Modell: {process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite"}</span>
          </div>
        </div>
      </section>

      {/* Queue / Worker */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${workerOnline ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
              <Radio className={`h-4 w-4 ${workerOnline ? "text-emerald-400" : "text-red-400"}`} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Queue & Worker</h2>
              <p className="text-xs text-zinc-500">BullMQ via Redis</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 border text-xs font-medium ${
            workerOnline
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            {workerOnline ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
            {workerOnline ? "Worker online" : "Worker offline"}
          </div>
        </div>

        {!workerOnline ? (
          <div className="p-5">
            <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-300">Worker nicht erreichbar</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Redis-Verbindung fehlgeschlagen oder Worker-Prozess nicht gestartet.
                    Crawl-, Analyse- und Generierungs-Jobs werden nicht verarbeitet.
                  </p>
                  <div className="mt-3 rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2">
                    <code className="text-xs text-zinc-300">npm run worker:dev</code>
                    <span className="text-xs text-zinc-600 ml-3">→ separates Terminal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5">
            <div className="grid grid-cols-[1fr_80px_80px_100px_120px] items-center gap-3 pb-2 mb-2 border-b border-zinc-800">
              <span className="text-xs font-medium text-zinc-600 uppercase tracking-wider">Queue</span>
              <span className="text-xs font-medium text-zinc-600 uppercase tracking-wider text-right">Wartend</span>
              <span className="text-xs font-medium text-zinc-600 uppercase tracking-wider text-right">Aktiv</span>
              <span className="text-xs font-medium text-zinc-600 uppercase tracking-wider text-right">Fertig</span>
              <span className="text-xs font-medium text-zinc-600 uppercase tracking-wider text-right">Fehlgeschlagen</span>
            </div>
            <div className="space-y-1.5">
              {queueStats.map((q) => (
                <div key={q.name} className="grid grid-cols-[1fr_80px_80px_100px_120px] items-center gap-3 rounded-lg bg-zinc-800/40 px-3 py-2">
                  <span className="font-mono text-xs text-zinc-400">{q.name}</span>
                  <span className="text-xs text-zinc-400 text-right tabular-nums">{q.waiting}</span>
                  <span className={`text-xs text-right tabular-nums ${q.active > 0 ? "text-blue-400 font-semibold" : "text-zinc-600"}`}>
                    {q.active}
                  </span>
                  <span className="text-xs text-emerald-400 text-right tabular-nums">{q.completed}</span>
                  <span className={`text-xs text-right tabular-nums ${q.failed > 0 ? "text-red-400 font-semibold" : "text-zinc-600"}`}>
                    {q.failed}
                  </span>
                </div>
              ))}
            </div>
            {(totalFailed > 0 || totalActive > 0) && (
              <div className="mt-3 flex items-center gap-3 text-xs">
                {totalActive > 0 && <span className="text-blue-400">{totalActive} aktiv</span>}
                {totalFailed > 0 && <span className="text-red-400">{totalFailed} fehlgeschlagen</span>}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Suchgebiete */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10">
              <MapPin className="h-4 w-4 text-teal-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Suchgebiete</h2>
              <p className="text-xs text-zinc-500">Definieren wo und in welchen Branchen neue Leads gesucht werden</p>
            </div>
          </div>
          <span className="rounded-md bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs px-2 py-0.5 tabular-nums">
            {searchConfigs.length} Konfigurationen
          </span>
        </div>

        {searchConfigs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 mb-3">
              <MapPin className="h-5 w-5 text-zinc-600" />
            </div>
            <p className="text-sm font-medium text-zinc-300">Keine Suchgebiete konfiguriert</p>
            <p className="text-xs text-zinc-600 mt-1 max-w-xs">
              Suchgebiete steuern die automatische Lead-Discovery. Der UI-Editor ist für Phase 7 geplant.
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            {searchConfigs.map((config) => (
              <div
                key={config.id}
                className={`rounded-xl border p-4 ${config.isActive ? "bg-teal-500/5 border-teal-500/20" : "bg-zinc-800/40 border-zinc-800"}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{config.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Scope: {config.scope}</p>
                  </div>
                  {config.isActive && (
                    <span className="flex items-center gap-1 rounded-full bg-teal-500/15 border border-teal-500/25 text-teal-400 text-xs font-medium px-2.5 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                      Aktiv
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(() => {
                    const industries = config.industries ? JSON.parse(config.industries) as string[] : [];
                    const cities = config.cities ? JSON.parse(config.cities) as string[] : [];
                    const states = config.states ? JSON.parse(config.states) as string[] : [];
                    return (
                      <>
                        {industries.length > 0 && (
                          <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2">
                            <p className="text-xs text-zinc-600 mb-1">Branchen</p>
                            <p className="text-xs text-zinc-300">
                              {industries.map((i) => INDUSTRIES[i] ?? i).join(", ")}
                            </p>
                          </div>
                        )}
                        {cities.length > 0 && (
                          <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2">
                            <p className="text-xs text-zinc-600 mb-1">Städte</p>
                            <p className="text-xs text-zinc-300">{cities.join(", ")}</p>
                          </div>
                        )}
                        {states.length > 0 && (
                          <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2">
                            <p className="text-xs text-zinc-600 mb-1">Bundesländer</p>
                            <p className="text-xs text-zinc-300">
                              {states.map((s) => GERMAN_STATES[s] ?? s).join(", ")}
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                  {config.radiusKm && config.centerCity && (
                    <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2">
                      <p className="text-xs text-zinc-600 mb-1">Radius</p>
                      <p className="text-xs text-zinc-300">{config.radiusKm} km um {config.centerCity}</p>
                    </div>
                  )}
                  {config.maxLeadsPerRun && (
                    <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2">
                      <p className="text-xs text-zinc-600 mb-1">Max. pro Lauf</p>
                      <p className="text-xs text-zinc-300">{config.maxLeadsPerRun} Leads</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-5 pb-4">
          <p className="text-xs text-zinc-600">
            Neue Suchgebiete können per API angelegt werden — UI-Editor kommt in Phase 7.
          </p>
        </div>
      </section>

      {/* System-Parameter */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800">
            <Settings2 className="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">System-Parameter</h2>
            <p className="text-xs text-zinc-500">Laufzeitkonfiguration via .env</p>
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { label: "Umgebung", value: process.env.APP_ENV ?? "development" },
            { label: "Storage", value: process.env.STORAGE_TYPE ?? "local" },
            { label: "Crawl-Timeout", value: `${process.env.CRAWL_TIMEOUT_MS ?? "30000"} ms` },
            { label: "Max. Seiten/Crawl", value: process.env.CRAWL_MAX_PAGES ?? "10" },
            { label: "Crawl-Parallelität", value: process.env.CRAWL_CONCURRENCY ?? "3" },
            { label: "LLM-Parallelität", value: process.env.LLM_CONCURRENCY ?? "2" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-zinc-800/50 border border-zinc-800 px-3 py-2.5">
              <p className="text-xs text-zinc-600">{item.label}</p>
              <p className="text-sm font-medium text-white mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
