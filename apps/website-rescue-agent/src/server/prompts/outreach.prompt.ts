// LLM-Prompt für Outreach-Generierung
// Erstellt personalisierte, seriöse Kontaktaufnahmen

import { z } from "zod";
import type { Company, Analysis, GeneratedSite } from "@prisma/client";
import type { OutreachType } from "@prisma/client";

// ─── Schema ───────────────────────────────────────────────────────────────────

const redFlagSchema = z.object({
  type: z.enum(["unverified_claim", "placeholder", "sensitive_info", "duplicate_risk", "low_confidence"]),
  description: z.string(),
  severity: z.enum(["blocking", "warning"]),
});

export const outreachSchema = z.object({
  subject: z.string().max(100),
  body: z.string(),
  redFlags: z.array(redFlagSchema),
  hasUnreviewedPlaceholders: z.boolean(),
  isBlockedForSend: z.boolean(),
  blockReason: z.string().optional(),
  toneAssessment: z.string(),
});

export type OutreachResult = z.infer<typeof outreachSchema>;

// ─── System-Prompts nach Typ ──────────────────────────────────────────────────

const OUTREACH_SYSTEM_PROMPTS: Record<OutreachType, string> = {
  EMAIL_SHORT: `Du bist ein erfahrener Vertriebsprofi für eine Webagentur. Schreibe eine kurze, seriöse Erstkontakt-E-Mail (max. 150 Wörter).

Stil-Regeln:
- Höflich, konkret, respektvoll
- KEINE Phrasen wie "ich mache mir Sorgen um Ihren Web-Auftritt"
- KEINE aggressiven Formulierungen
- KEIN Spam-Tonfall
- 1–2 konkrete Beobachtungen, nicht mehr
- Ein klares, einfaches Angebot
- Ein einfacher nächster Schritt

VERBOTEN:
- Keine erfundenen Fakten
- Keine Drohungen oder Angst-Taktiken
- Keine falsche Dringlichkeit
- Keine generischen Formulierungen ohne Bezug zur Firma`,

  EMAIL_LONG: `Du bist ein erfahrener Vertriebsprofi für eine Webagentur. Schreibe eine ausführlichere Erstkontakt-E-Mail (max. 300 Wörter).

Inhalt:
1. Persönliche Ansprache mit konkretem Bezug
2. 2–3 spezifische Beobachtungen (nur aus echten Daten)
3. Den konkreten Mehrwert einer besseren Website für diese Firma
4. Das Angebot inkl. Preisrahmen
5. Einfacher nächster Schritt (Demo, kurzes Gespräch)

Ton: professionell, ehrlich, nutzenorientiert`,

  CONTACT_FORM: `Schreibe eine kurze, professionelle Nachricht für ein Website-Kontaktformular (max. 100 Wörter).
Kein Betreff nötig. Kurz und auf den Punkt. Respektvoll und nicht verkäuferisch.`,

  LINKEDIN: `Schreibe eine kurze LinkedIn-Nachricht (max. 300 Zeichen).
Persönlich, nicht werblich. Konkreter Anlass, echtes Interesse.`,

  FOLLOW_UP: `Schreibe eine freundliche Follow-up-Nachricht für jemanden, der nicht geantwortet hat (max. 100 Wörter).
Kein Druck. Neuen Winkel oder neuen Mehrwert nennen. Respektieren, wenn kein Interesse.`,

  OBJECTION_RESPONSE: `Schreibe eine professionelle Antwort auf eine Einwand-E-Mail.
Ruhig, verständnisvoll, lösungsorientiert. Kein Druck.`,
};

export function getOutreachSystemPrompt(type: OutreachType): string {
  const base = OUTREACH_SYSTEM_PROMPTS[type];
  return `${base}

GUARDRAILS (zwingend einhalten):
- Prüfe auf Platzhalter in der Nachricht: [NAME], [FIRMA], etc.
- Setze hasUnreviewedPlaceholders: true wenn Platzhalter im body
- Setze isBlockedForSend: true wenn kritische Red Flags vorhanden
- Erfinde KEINE Fakten über die Firma
- Antworte ausschließlich mit dem JSON-Objekt`;
}

// ─── User-Prompt ──────────────────────────────────────────────────────────────

interface OutreachPromptData {
  company: Company;
  analysis: Analysis;
  generatedSite: GeneratedSite | null;
  type: OutreachType;
  contactName?: string;
  offerName?: string;
  offerPrice?: string;
  demoUrl?: string;
  objectionText?: string; // für OBJECTION_RESPONSE
}

export function buildOutreachUserPrompt(data: OutreachPromptData): string {
  const { company, analysis, generatedSite, type, contactName, offerName, offerPrice, demoUrl, objectionText } = data;

  const weaknesses = ((analysis.weaknesses as string[] | null) ?? []).slice(0, 3);
  const quickWins = ((analysis.quickWins as string[] | null) ?? []).slice(0, 2);

  return `## Empfänger

**Firma:** ${company.name}
**Branche:** ${company.industry || "unbekannt"}
**Ort:** ${company.city || ""}${company.state ? `, ${company.state}` : ""}
**Domain:** ${company.domain}
**Ansprechpartner:** ${contactName || "[ANSPRECHPARTNER]"}

---

## Website-Analyse (Grundlage)

**Score:** ${analysis.overallScore?.toFixed(0) ?? "?"}/100
**Wichtigste Schwächen:**
${weaknesses.map((w) => `- ${w}`).join("\n") || "- Keine spezifischen Daten verfügbar"}

**Quick Wins:**
${quickWins.map((w) => `- ${w}`).join("\n") || "- Keine spezifischen Daten"}

---

## Angebot

**Paket:** ${offerName || "Website-Optimierung"}
**Preisrahmen:** ${offerPrice || "[PREIS]"}
${demoUrl ? `**Demo-Link:** ${demoUrl}` : "**Demo:** noch nicht erstellt"}
${generatedSite ? `**Demo vorhanden:** Ja (${generatedSite.style})` : ""}

---

${
  type === "OBJECTION_RESPONSE" && objectionText
    ? `## Einwand des Kunden\n\n"${objectionText}"\n\n---\n`
    : ""
}

**Nachrichtentyp:** ${type}

Erstelle jetzt die Outreach-Nachricht als JSON.
Beziehe dich auf max. 2 konkrete Beobachtungen aus den Daten.
Alle Platzhalter in eckigen Klammern müssen als solche markiert werden.`;
}
