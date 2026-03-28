import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft, AlertTriangle, CheckCircle } from "lucide-react";

type Params = { params: Promise<{ id: string }> };

export default async function GeneratedSitePage({ params }: Params) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const site = await db.generatedSite.findUnique({
    where: { id },
    include: { company: { select: { name: true, id: true, domain: true } } },
  });

  if (!site) notFound();

  const unverifiedClaims = (site.unverifiedClaims as string[] | null) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href={`/leads/${site.company.id}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Zurück zu {site.company.name}
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Demo-Website</h1>
          <p className="text-sm text-muted-foreground">
            {site.company.name} · Stil: {site.style.replace(/_/g, " ")} · Version {site.version} · {formatDateTime(site.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {site.hasPlaceholders && (
            <span className="flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <AlertTriangle className="h-4 w-4" />
              Platzhalter vorhanden — vor Verwendung ersetzen
            </span>
          )}
        </div>
      </div>

      {/* Warnungen */}
      {unverifiedClaims.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800 mb-2">Nicht verifizierte Aussagen (intern markiert):</p>
          <ul className="space-y-1">
            {unverifiedClaims.map((claim, i) => (
              <li key={i} className="text-sm text-red-700">⚠ {claim}</li>
            ))}
          </ul>
        </div>
      )}

      {site.placeholderNotes && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800 mb-1">Platzhalter-Hinweise:</p>
          <p className="text-sm text-amber-700">{site.placeholderNotes}</p>
        </div>
      )}

      {/* Preview */}
      {site.htmlContent ? (
        <div className="rounded-xl border overflow-hidden" style={{ height: "800px" }}>
          <iframe
            srcDoc={site.htmlContent}
            className="w-full h-full"
            title="Demo-Website Vorschau"
            sandbox="allow-same-origin"
          />
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
          Vorschau nicht verfügbar — HTML-Inhalt fehlt
        </div>
      )}

      {/* Meta */}
      <div className="text-xs text-muted-foreground">
        Generiert mit: {site.generatedBy ?? "unbekannt"} · Prompt-Version: {site.promptVersion ?? "—"}
      </div>
    </div>
  );
}
