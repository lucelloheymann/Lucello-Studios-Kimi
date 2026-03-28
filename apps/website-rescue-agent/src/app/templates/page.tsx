import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  Mail,
  Globe,
  FileText,
  Cpu,
  Plus,
  ArrowRight,
  Sparkles,
  Package,
} from "lucide-react";

export default async function TemplatesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [outreachTemplates, industryTemplates, offerTemplates] =
    await Promise.all([
      db.outreachTemplate.findMany({ orderBy: { createdAt: "desc" } }),
      db.industryTemplate.findMany({ orderBy: { displayName: "asc" } }),
      db.offerTemplate.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Templates</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Vorlagen für Outreach, Demos und Angebote
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-white text-zinc-900 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 transition-colors cursor-not-allowed opacity-60">
          <Plus className="h-3.5 w-3.5" />
          Neues Template
        </button>
      </div>

      {/* Info-Banner */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 flex items-center gap-3">
        <Sparkles className="h-4 w-4 text-zinc-500 shrink-0" />
        <p className="text-sm text-zinc-400">
          Templates steuern, was die KI für Outreach, Demo-Sites und Angebote generiert.
          Der Template-Editor ist für Phase 7 geplant — aktuell werden Vorlagen aus der Datenbank geladen.
        </p>
      </div>

      {/* Grid: 2 Spalten oben */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Outreach-Templates */}
        <TemplateSection
          icon={<Mail className="h-4 w-4 text-sky-400" />}
          title="Outreach-Templates"
          description="E-Mail-Vorlagen für die erste Kontaktaufnahme und Follow-ups"
          accentColor="sky"
          count={outreachTemplates.length}
          items={outreachTemplates.map((t) => ({
            id: t.id,
            title: t.name,
            meta: t.type,
            sub: t.isDefault ? "Standard-Vorlage" : "Benutzerdefiniert",
            isDefault: t.isDefault,
          }))}
          emptyTitle="Keine Outreach-Templates"
          emptyText="Outreach-Templates werden beim ersten Seed automatisch angelegt und können über die API angepasst werden."
        />

        {/* Angebots-Templates */}
        <TemplateSection
          icon={<Package className="h-4 w-4 text-violet-400" />}
          title="Angebots-Pakete"
          description="Definierte Leistungspakete als Grundlage für Outreach und Angebote"
          accentColor="violet"
          count={offerTemplates.length}
          items={offerTemplates.map((t) => ({
            id: t.id,
            title: t.name,
            meta: t.tier,
            sub: t.basePrice ? `ab ${t.basePrice.toLocaleString("de-DE")} €` : "Preis auf Anfrage",
            isDefault: false,
          }))}
          emptyTitle="Keine Angebots-Pakete"
          emptyText="Angebots-Pakete definieren Leistungsumfang und Preisrahmen für generierte Outreach-Mails."
        />
      </div>

      {/* Grid: 2 Spalten unten */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Branchen-Templates */}
        <TemplateSection
          icon={<Globe className="h-4 w-4 text-teal-400" />}
          title="Branchen-Templates"
          description="Branchenspezifische Hinweise und Tonalität für Demo-Generierung"
          accentColor="teal"
          count={industryTemplates.length}
          items={industryTemplates.map((t) => ({
            id: t.id,
            title: t.displayName,
            meta: t.industry,
            sub: t.description ?? "Branchenspezifisches Template",
            isDefault: false,
          }))}
          emptyTitle="Keine Branchen-Templates"
          emptyText="Branchen-Templates passen die KI-Analyse und Demo-Generierung an die jeweilige Branche an."
        />

        {/* System-Prompts */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                <Cpu className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">System-Prompts</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Versionierte LLM-Prompts</p>
              </div>
            </div>
            <span className="rounded-md bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs px-2 py-0.5">
              3 aktiv
            </span>
          </div>

          <div className="space-y-2">
            {[
              { name: "Analyse-Prompt", file: "analysis.prompt.ts", desc: "9-dimensionale Website-Bewertung" },
              { name: "Demo-Generator-Prompt", file: "site-generation.prompt.ts", desc: "HTML/CSS Demo-Website erstellen" },
              { name: "Outreach-Prompt", file: "outreach.prompt.ts", desc: "Personalisierte Kontaktmails" },
            ].map((prompt) => (
              <div
                key={prompt.file}
                className="flex items-center justify-between rounded-lg bg-zinc-800/50 border border-zinc-800 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-white">{prompt.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{prompt.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-600">{prompt.file}</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-zinc-600 mt-3 pt-3 border-t border-zinc-800">
            Prompts sind versioniert in{" "}
            <code className="text-zinc-500">src/server/prompts/</code> — Änderungen erfordern Deployment.
          </p>
        </div>
      </div>
    </div>
  );
}

function TemplateSection({
  icon,
  title,
  description,
  accentColor,
  count,
  items,
  emptyTitle,
  emptyText,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: "sky" | "violet" | "teal";
  count: number;
  items: { id: string; title: string; meta: string; sub: string; isDefault: boolean }[];
  emptyTitle: string;
  emptyText: string;
}) {
  const accentBg = {
    sky: "bg-sky-500/10",
    violet: "bg-violet-500/10",
    teal: "bg-teal-500/10",
  }[accentColor];

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentBg}`}>
            {icon}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
          </div>
        </div>
        <span className="rounded-md bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs px-2 py-0.5 tabular-nums">
          {count}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 mb-2.5">
            <FileText className="h-4 w-4 text-zinc-600" />
          </div>
          <p className="text-sm font-medium text-zinc-300">{emptyTitle}</p>
          <p className="text-xs text-zinc-600 mt-1 max-w-[220px] leading-relaxed">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg bg-zinc-800/50 border border-zinc-800 px-3 py-2.5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white truncate">{item.title}</p>
                  {item.isDefault && (
                    <span className="shrink-0 text-xs bg-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded">
                      Standard
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{item.sub}</p>
              </div>
              <span className="text-xs text-zinc-600 font-mono shrink-0 ml-2">{item.meta}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
