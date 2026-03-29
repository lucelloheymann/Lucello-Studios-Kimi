"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ReplySentiment } from "@/types";
import { Loader2, MessageSquare, FileText, AlertCircle } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ReplyFormData {
  sentiment: ReplySentiment;
  content?: string;
  notes?: string;
}

interface ReplyFormProps {
  onSubmit: (data: ReplyFormData) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const SENTIMENT_OPTIONS: { value: ReplySentiment; label: string; description: string }[] = [
  {
    value: ReplySentiment.POSITIVE,
    label: "Positiv",
    description: "Interesse gezeigt, Termin vereinbart, weitere Infos gewünscht",
  },
  {
    value: ReplySentiment.NEUTRAL,
    label: "Neutral",
    description: "Rückfragen, allgemeines Interesse ohne klare Absicht",
  },
  {
    value: ReplySentiment.NEGATIVE,
    label: "Negativ",
    description: "Ablehnung, kein Interesse, nicht jetzt",
  },
  {
    value: ReplySentiment.SPAM,
    label: "Spam / irrelevant",
    description: "Automatisierte Antwort, Out-of-Office, keine Relevanz",
  },
];

export function ReplyForm({ onSubmit, disabled = false, className }: ReplyFormProps) {
  const [sentiment, setSentiment] = React.useState<ReplySentiment | null>(null);
  const [content, setContent] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // GUARD: Sentiment ist Pflicht
    if (!sentiment) {
      setError("Bitte wählen Sie ein Sentiment aus.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        sentiment,
        content: content.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      
      // Reset nach erfolgreichem Submit
      setSentiment(null);
      setContent("");
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Antwort konnte nicht gespeichert werden.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = sentiment !== null;

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      {/* Sentiment Selection - Pflichtfeld */}
      <div className="space-y-2">
        <label className="text-sm text-zinc-300">
          Sentiment <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SENTIMENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={disabled || isSubmitting}
              onClick={() => {
                setSentiment(option.value);
                setError(null);
              }}
              className={cn(
                "flex flex-col items-start p-3 rounded-lg border text-left transition-all",
                sentiment === option.value
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800/50",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <span className={cn(
                "text-sm font-medium",
                sentiment === option.value ? "text-emerald-400" : "text-zinc-300"
              )}>
                {option.label}
              </span>
              <span className="text-xs text-zinc-500 mt-0.5 leading-tight">
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Antworttext (optional) */}
      <div className="space-y-2">
        <label htmlFor="reply-content" className="text-sm text-zinc-300 flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-zinc-500" />
          Antworttext (optional)
        </label>
        <textarea
          id="reply-content"
          placeholder="Zusammenfassung oder relevante Aussagen aus der Antwort..."
          value={content}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
          disabled={disabled || isSubmitting}
          className="w-full min-h-[80px] px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 placeholder:text-zinc-600 resize-none text-sm focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700"
        />
      </div>

      {/* Interne Notiz (optional) */}
      <div className="space-y-2">
        <label htmlFor="reply-notes" className="text-sm text-zinc-300 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-zinc-500" />
          Interne Notiz (optional)
        </label>
        <textarea
          id="reply-notes"
          placeholder="Nur für interne Dokumentation sichtbar..."
          value={notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
          disabled={disabled || isSubmitting}
          className="w-full min-h-[60px] px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 placeholder:text-zinc-600 resize-none text-sm focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-zinc-500">
          {isValid ? "Bereit zum Speichern" : "Sentiment erforderlich"}
        </span>
        <button
          type="submit"
          disabled={disabled || isSubmitting || !isValid}
          className={cn(
            "inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-[120px]",
            disabled || isSubmitting || !isValid
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-500 text-white"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              Speichern...
            </>
          ) : (
            "Antwort erfassen"
          )}
        </button>
      </div>
    </form>
  );
}
