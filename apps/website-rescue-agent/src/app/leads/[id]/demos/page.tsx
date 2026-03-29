"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { IconWrapper } from "@/components/ui/icon-wrapper";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import { LeadStatus } from "@/types";
import {
  ChevronLeft,
  LayoutTemplate,
  ExternalLink,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  Star,
  MoreHorizontal,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface DemoVersion {
  id: string;
  version: number;
  variant: string;
  style: string;
  status: string;
  summary: string | null;
  headline: string | null;
  hasPlaceholders: boolean;
  placeholderCount: number;
  errorCode: string | null;
  errorDetails: string | null;
  isRegeneration: boolean;
  regenerationReason: string | null;
  generationTimeMs: number | null;
  reviewedAt: string | null;
  reviewRating: number | null;
  previewUrl: string | null;
  thumbnailUrl: string | null;
  screenshotUrl: string | null;
  createdAt: string;
}

interface CompanyInfo {
  id: string;
  name: string;
  domain: string;
  status: string;
}

export default function DemosPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [demos, setDemos] = useState<DemoVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Company laden (enthält auch generatedSites)
        const companyRes = await fetch(`/api/leads/${companyId}`);
        if (!companyRes.ok) throw new Error("Company not found");
        const companyData = await companyRes.json();
        setCompany(companyData.company);
        setDemos(companyData.company.generatedSites || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [companyId]);

  const handleRegenerate = async () => {
    setRegenerating("new");
    try {
      const res = await fetch(`/api/leads/${companyId}/generate-site`, {
        method: "POST",
      });
      if (res.ok) {
        // Reload nach kurzer Verzögerung
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (err) {
      console.error(err);
      setRegenerating(null);
    }
  };

  const handleSetActive = async (demoId: string) => {
    // API-Aufruf würde hier folgen
    console.log("Set active:", demoId);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-zinc-500">Lade Demo-Versionen...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-red-400">Lead nicht gefunden</div>
      </div>
    );
  }

  const activeDemo = demos.find((d) => d.status === "GENERATED" && !d.errorCode);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link
            href={`/leads/${companyId}`}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
          >
            <IconWrapper icon={ChevronLeft} className="h-4 w-4" />
            Zurück zum Lead
          </Link>
          <h1 className="text-xl font-semibold text-white">Demo-Versionen</h1>
          <p className="text-sm text-zinc-500">{company.name} — {demos.length} Versionen</p>
        </div>
        
        <div className="flex items-center gap-3">
          <StatusBadge status={company.status as LeadStatus} />
          <button
            onClick={handleRegenerate}
            disabled={!!regenerating}
            className="flex items-center gap-1.5 text-sm bg-white text-zinc-900 px-3 py-1.5 rounded-lg hover:bg-zinc-100 disabled:opacity-50 transition-colors"
          >
            <IconWrapper icon={regenerating ? RefreshCw : Sparkles} className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`} />
            {regenerating ? "Wird generiert..." : "Neue Version"}
          </button>
        </div>
      </div>

      {/* Aktive Version */}
      {activeDemo && (
        <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <IconWrapper icon={CheckCircle} className="h-5 w-5 text-emerald-400" />
            <h2 className="text-sm font-semibold text-emerald-400">Aktive Version</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-5">
            {/* Vorschau */}
            <div className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
              {activeDemo.thumbnailUrl || activeDemo.screenshotUrl ? (
                <img 
                  src={activeDemo.thumbnailUrl || activeDemo.screenshotUrl || ""} 
                  alt="Aktive Demo"
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="h-48 flex items-center justify-center text-zinc-600">
                  <IconWrapper icon={LayoutTemplate} className="h-12 w-12" />
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Version</span>
                <span className="text-sm font-medium text-white">v{activeDemo.version}</span>
                {activeDemo.variant !== "A" && (
                  <span className="text-xs text-zinc-500">/{activeDemo.variant}</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Stil</span>
                <span className="text-sm text-white">{activeDemo.style.replace(/_/g, " ")}</span>
              </div>
              
              {activeDemo.summary && (
                <p className="text-sm text-zinc-400">{activeDemo.summary}</p>
              )}
              
              <div className="flex flex-wrap gap-2 pt-2">
                {activeDemo.previewUrl && (
                  <Link
                    href={activeDemo.previewUrl}
                    target="_blank"
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white border border-zinc-700 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <IconWrapper icon={Eye} className="h-3 w-3" />
                    Vorschau
                  </Link>
                )}
                <Link
                  href={`/generated-sites/${activeDemo.id}`}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white border border-zinc-700 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <IconWrapper icon={ExternalLink} className="h-3 w-3" />
                  Öffnen
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Versionen Liste */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-white">Alle Versionen</h2>
          <span className="text-xs text-zinc-500">{demos.length} Einträge</span>
        </div>

        {demos.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <IconWrapper icon={LayoutTemplate} className="h-10 w-10 text-zinc-700 mb-3" />
            <p className="text-sm font-medium text-zinc-400">Noch keine Demos</p>
            <p className="text-xs text-zinc-600 mt-1">Erstelle die erste Demo-Version</p>
            <button
              onClick={handleRegenerate}
              className="mt-4 flex items-center gap-1.5 text-sm text-white border border-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <IconWrapper icon={Sparkles} className="h-3.5 w-3.5" />
              Demo generieren
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {demos.map((demo) => (
              <div
                key={demo.id}
                className={`px-5 py-4 hover:bg-zinc-800/30 transition-colors ${
                  demo.id === activeDemo?.id ? "bg-emerald-500/5" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="w-24 h-16 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 shrink-0">
                    {demo.thumbnailUrl || demo.screenshotUrl ? (
                      <img 
                        src={demo.thumbnailUrl || demo.screenshotUrl || ""} 
                        alt={`v${demo.version}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IconWrapper icon={LayoutTemplate} className="h-6 w-6 text-zinc-700" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        Version {demo.version}
                        {demo.variant !== "A" && `/${demo.variant}`}
                      </span>
                      {demo.id === activeDemo?.id && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Aktiv
                        </span>
                      )}
                      {demo.isRegeneration && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          Neu generiert
                        </span>
                      )}
                      {demo.errorCode && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                          Fehler
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                      <span>{demo.style.replace(/_/g, " ")}</span>
                      <span className="flex items-center gap-1">
                        <IconWrapper icon={Clock} className="h-3 w-3" />
                        {formatDate(new Date(demo.createdAt))}
                      </span>
                      {demo.generationTimeMs && (
                        <span>{(demo.generationTimeMs / 1000).toFixed(1)}s Generierung</span>
                      )}
                      {demo.hasPlaceholders && (
                        <span className="text-amber-400">
                          {demo.placeholderCount} Platzhalter
                        </span>
                      )}
                    </div>

                    {demo.errorCode && (
                      <div className="mt-2 text-xs text-red-400">
                        {demo.errorCode}: {demo.errorDetails}
                      </div>
                    )}

                    {demo.regenerationReason && (
                      <div className="mt-2 text-xs text-blue-400">
                        Grund: {demo.regenerationReason}
                      </div>
                    )}
                  </div>

                  {/* Aktionen */}
                  <div className="flex items-center gap-2 shrink-0">
                    {demo.previewUrl && (
                      <Link
                        href={demo.previewUrl}
                        target="_blank"
                        className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Vorschau"
                      >
                        <IconWrapper icon={Eye} className="h-4 w-4" />
                      </Link>
                    )}
                    
                    {demo.id !== activeDemo?.id && !demo.errorCode && (
                      <button
                        onClick={() => handleSetActive(demo.id)}
                        className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        title="Als aktiv markieren"
                      >
                        <IconWrapper icon={CheckCircle} className="h-4 w-4" />
                      </button>
                    )}
                    
                    {demo.errorCode && (
                      <button
                        onClick={handleRegenerate}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Erneut versuchen"
                      >
                        <IconWrapper icon={RefreshCw} className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <IconWrapper icon={MoreHorizontal} className="h-4 w-4 text-zinc-500" />
          Info
        </h3>
        <ul className="space-y-2 text-xs text-zinc-500">
          <li className="flex items-start gap-2">
            <span className="text-zinc-600">•</span>
            Die aktive Version wird in der Lead-Detailseite angezeigt und für Outreach verwendet.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-zinc-600">•</span>
            Fehlgeschlagene Generationen können erneut versucht werden.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-zinc-600">•</span>
            Alte Versionen bleiben zur Nachvollziehbarkeit erhalten.
          </li>
        </ul>
      </div>
    </div>
  );
}
