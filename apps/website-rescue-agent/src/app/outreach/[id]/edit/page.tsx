"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconWrapper } from "@/components/ui/icon-wrapper";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/utils";
import { LeadStatus } from "@/types";
import {
  ChevronLeft,
  Save,
  Send,
  ShieldCheck,
  AlertTriangle,
  Clock,
  User,
  Mail,
  Tag,
  Calendar,
  Eye,
  Edit3,
  X,
  CheckCircle,
  Ban,
  ArrowRight,
} from "lucide-react";

interface OutreachData {
  id: string;
  companyId: string;
  company: {
    name: string;
    domain: string;
    status: string;
  };
  recipientName: string | null;
  recipientEmail: string | null;
  recipientRole: string | null;
  subject: string | null;
  body: string | null;
  offerPriceRange: string | null;
  offerValidUntil: string | null;
  status: string;
  hasUnreviewedPlaceholders: boolean;
  isBlockedForSend: boolean;
  blockReason: string | null;
  redFlags: string | null;
  editCount: number;
  lastEditedAt: string | null;
  lastEditedBy: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  sentAt: string | null;
  createdAt: string;
}

export default function OutreachEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [outreach, setOutreach] = useState<OutreachData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [edited, setEdited] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    recipientName: "",
    recipientEmail: "",
    recipientRole: "",
    subject: "",
    body: "",
    offerPriceRange: "",
    offerValidUntil: "",
  });

  useEffect(() => {
    async function loadOutreach() {
      const { id } = await params;
      try {
        const res = await fetch(`/api/outreach/${id}`);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setOutreach(data);
        setFormData({
          recipientName: data.recipientName || data.company.name || "",
          recipientEmail: data.recipientEmail || "",
          recipientRole: data.recipientRole || "",
          subject: data.subject || "",
          body: data.body || "",
          offerPriceRange: data.offerPriceRange || "",
          offerValidUntil: data.offerValidUntil ? data.offerValidUntil.split("T")[0] : "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOutreach();
  }, [params]);

  const handleSave = async () => {
    if (!outreach) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/outreach/${outreach.id}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setEdited(false);
        // Reload to get updated timestamps
        const updated = await fetch(`/api/outreach/${outreach.id}`);
        const data = await updated.json();
        setOutreach(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!outreach || outreach.isBlockedForSend) return;
    try {
      const res = await fetch(`/api/outreach/${outreach.id}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        router.push(`/leads/${outreach.companyId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-zinc-500">Lade Outreach...</div>
      </div>
    );
  }

  if (!outreach) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-red-400">Outreach nicht gefunden</div>
      </div>
    );
  }

  const redFlags = outreach.redFlags ? JSON.parse(outreach.redFlags) : [];
  const canEdit = outreach.status === "DRAFT";
  const canApprove = outreach.status === "DRAFT" && !outreach.isBlockedForSend && !outreach.hasUnreviewedPlaceholders;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link
            href={`/leads/${outreach.companyId}`}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
          >
            <IconWrapper icon={ChevronLeft} className="h-4 w-4" />
            Zurück zum Lead
          </Link>
          <h1 className="text-xl font-semibold text-white">
            {outreach.company.name}
          </h1>
          <p className="text-sm text-zinc-500">{outreach.company.domain}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <StatusBadge status={outreach.company.status as LeadStatus} />
          <span className={`text-xs px-2 py-1 rounded border ${
            outreach.status === "DRAFT" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
            outreach.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
            outreach.status === "SENT" ? "bg-sky-500/10 text-sky-400 border-sky-500/20" :
            "bg-zinc-800 text-zinc-400 border-zinc-700"
          }`}>
            {outreach.status}
          </span>
        </div>
      </div>

      {/* Guardrails / Status Banner */}
      {outreach.isBlockedForSend && (
        <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4 flex items-start gap-3">
          <IconWrapper icon={Ban} className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-400">Versand blockiert</h3>
            <p className="text-xs text-zinc-500 mt-1">{outreach.blockReason}</p>
          </div>
        </div>
      )}

      {outreach.hasUnreviewedPlaceholders && (
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 flex items-start gap-3">
          <IconWrapper icon={AlertTriangle} className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-400">Platzhalter vorhanden</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Dieser Entwurf enthält ungeprüfte Platzhalter. Bitte ersetze sie vor der Freigabe.
            </p>
          </div>
        </div>
      )}

      {redFlags.length > 0 && (
        <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4 space-y-2">
          <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
            <IconWrapper icon={AlertTriangle} className="h-4 w-4" />
            Hinweise zur Prüfung
          </h3>
          <ul className="space-y-1">
            {redFlags.map((flag: { severity: string; description: string }, i: number) => (
              <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                <span className={flag.severity === "blocking" ? "text-red-400" : "text-amber-400"}>•</span>
                {flag.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Meta-Info Bar */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 bg-zinc-900/50 rounded-lg px-4 py-3 border border-zinc-800">
        <span className="flex items-center gap-1.5">
          <IconWrapper icon={Clock} className="h-3.5 w-3.5" />
          Erstellt: {formatDateTime(new Date(outreach.createdAt))}
        </span>
        {outreach.editCount > 0 && (
          <span className="flex items-center gap-1.5">
            <IconWrapper icon={Edit3} className="h-3.5 w-3.5" />
            {outreach.editCount}x bearbeitet
            {outreach.lastEditedAt && ` • ${formatDateTime(new Date(outreach.lastEditedAt))}`}
          </span>
        )}
        {outreach.approvedAt && (
          <span className="flex items-center gap-1.5 text-emerald-400">
            <IconWrapper icon={ShieldCheck} className="h-3.5 w-3.5" />
            Freigegeben: {formatDateTime(new Date(outreach.approvedAt))}
            {outreach.approvedBy && ` von ${outreach.approvedBy}`}
          </span>
        )}
        {outreach.sentAt && (
          <span className="flex items-center gap-1.5 text-sky-400">
            <IconWrapper icon={Send} className="h-3.5 w-3.5" />
            Versendet: {formatDateTime(new Date(outreach.sentAt))}
          </span>
        )}
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
        <button
          onClick={() => setPreviewMode(false)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            !previewMode
              ? "bg-zinc-800 text-white"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <IconWrapper icon={Edit3} className="h-4 w-4" />
          Bearbeiten
        </button>
        <button
          onClick={() => setPreviewMode(true)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            previewMode
              ? "bg-zinc-800 text-white"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <IconWrapper icon={Eye} className="h-4 w-4" />
          Vorschau
        </button>
        
        {edited && (
          <span className="ml-auto text-xs text-amber-400 flex items-center gap-1.5">
            <IconWrapper icon={AlertTriangle} className="h-3.5 w-3.5" />
            Ungespeicherte Änderungen
          </span>
        )}
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Edit Form */}
        {!previewMode && (
          <div className="space-y-5">
            {/* Empfänger */}
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <IconWrapper icon={User} className="h-4 w-4 text-zinc-500" />
                Empfänger
              </h3>
              
              <div className="grid gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Name</label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) => { setFormData({ ...formData, recipientName: e.target.value }); setEdited(true); }}
                    disabled={!canEdit}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                    placeholder="Max Mustermann"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">E-Mail</label>
                  <input
                    type="email"
                    value={formData.recipientEmail}
                    onChange={(e) => { setFormData({ ...formData, recipientEmail: e.target.value }); setEdited(true); }}
                    disabled={!canEdit}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                    placeholder="max@beispiel.de"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Position / Rolle</label>
                  <input
                    type="text"
                    value={formData.recipientRole}
                    onChange={(e) => { setFormData({ ...formData, recipientRole: e.target.value }); setEdited(true); }}
                    disabled={!canEdit}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                    placeholder="Geschäftsführer"
                  />
                </div>
              </div>
            </div>

            {/* Nachricht */}
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <IconWrapper icon={Mail} className="h-4 w-4 text-zinc-500" />
                Nachricht
              </h3>
              
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Betreff</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => { setFormData({ ...formData, subject: e.target.value }); setEdited(true); }}
                  disabled={!canEdit}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                  placeholder="Ihre Website-Analyse"
                />
              </div>
              
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Nachricht</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => { setFormData({ ...formData, body: e.target.value }); setEdited(true); }}
                  disabled={!canEdit}
                  rows={12}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 disabled:opacity-50 resize-none font-mono leading-relaxed"
                  placeholder="Sehr geehrte Damen und Herren..."
                />
              </div>
            </div>

            {/* Angebot */}
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <IconWrapper icon={Tag} className="h-4 w-4 text-zinc-500" />
                Angebot
              </h3>
              
              <div className="grid gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Preisrahmen</label>
                  <input
                    type="text"
                    value={formData.offerPriceRange}
                    onChange={(e) => { setFormData({ ...formData, offerPriceRange: e.target.value }); setEdited(true); }}
                    disabled={!canEdit}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                    placeholder="z.B. 2.500 - 5.000 €"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Gültig bis</label>
                  <input
                    type="date"
                    value={formData.offerValidUntil}
                    onChange={(e) => { setFormData({ ...formData, offerValidUntil: e.target.value }); setEdited(true); }}
                    disabled={!canEdit}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            {canEdit && (
              <button
                onClick={handleSave}
                disabled={!edited || saving}
                className="w-full flex items-center justify-center gap-2 bg-white text-zinc-900 font-medium px-4 py-3 rounded-lg hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <IconWrapper icon={Save} className="h-4 w-4" />
                {saving ? "Speichern..." : edited ? "Änderungen speichern" : "Gespeichert"}
              </button>
            )}
          </div>
        )}

        {/* Preview */}
        {previewMode && (
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <IconWrapper icon={Eye} className="h-4 w-4 text-zinc-500" />
              Vorschau
            </h3>
            
            <div className="bg-white rounded-lg p-6 text-zinc-900">
              {/* Email Header */}
              <div className="border-b border-zinc-200 pb-4 mb-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-zinc-500 w-16">An:</span>
                  <span className="font-medium">{formData.recipientName}</span>
                  {formData.recipientEmail && (
                    <span className="text-zinc-500">&lt;{formData.recipientEmail}&gt;</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-zinc-500 w-16">Betreff:</span>
                  <span className="font-medium">{formData.subject || "(kein Betreff)"}</span>
                </div>
              </div>
              
              {/* Email Body */}
              <div className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                {formData.body || "(keine Nachricht)"}
              </div>
              
              {/* Offer Footer */}
              {(formData.offerPriceRange || formData.offerValidUntil) && (
                <div className="mt-6 pt-4 border-t border-zinc-200">
                  {formData.offerPriceRange && (
                    <p className="text-sm">
                      <span className="text-zinc-500">Investition: </span>
                      <span className="font-semibold">{formData.offerPriceRange}</span>
                    </p>
                  )}
                  {formData.offerValidUntil && (
                    <p className="text-sm mt-1">
                      <span className="text-zinc-500">Gültig bis: </span>
                      <span>{new Date(formData.offerValidUntil).toLocaleDateString("de-DE")}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions Sidebar */}
        <div className="space-y-4">
          {/* Workflow Actions */}
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Aktionen</h3>
            
            {outreach.status === "DRAFT" && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={!canApprove}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-medium px-4 py-3 rounded-lg hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <IconWrapper icon={ShieldCheck} className="h-4 w-4" />
                  Zur Freigabe
                </button>
                
                {!canApprove && (
                  <div className="text-xs text-zinc-500 space-y-1">
                    {outreach.hasUnreviewedPlaceholders && (
                      <p className="flex items-center gap-1 text-amber-400">
                        <IconWrapper icon={AlertTriangle} className="h-3 w-3" />
                        Platzhalter müssen geprüft werden
                      </p>
                    )}
                    {outreach.isBlockedForSend && (
                      <p className="flex items-center gap-1 text-red-400">
                        <IconWrapper icon={Ban} className="h-3 w-3" />
                        {outreach.blockReason}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
            
            {outreach.status === "APPROVED" && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
                <p className="text-sm text-emerald-400 flex items-center gap-2">
                  <IconWrapper icon={CheckCircle} className="h-4 w-4" />
                  Freigegeben und bereit zum Versand
                </p>
                <Link
                  href={`/leads/${outreach.companyId}`}
                  className="mt-3 flex items-center justify-center gap-1 text-xs text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-lg transition-colors"
                >
                  Zum Lead <IconWrapper icon={ArrowRight} className="h-3 w-3" />
                </Link>
              </div>
            )}
            
            {outreach.status === "SENT" && (
              <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 p-4">
                <p className="text-sm text-sky-400 flex items-center gap-2">
                  <IconWrapper icon={Send} className="h-4 w-4" />
                  Bereits versendet
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {outreach.sentAt && formatDateTime(new Date(outreach.sentAt))}
                </p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Tipps</h3>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li className="flex items-start gap-2">
                <span className="text-zinc-600">•</span>
                Persönliche Anrede erhöht die Öffnungsrate
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-600">•</span>
                Konkreter Preisrahmen zeigt Professionalität
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-600">•</span>
                Gültigkeitsdatum erzeugt Handlungsdruck
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-600">•</span>
                Platzhalter immer vor Freigabe prüfen
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
