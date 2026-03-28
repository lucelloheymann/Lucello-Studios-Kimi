// LLM-Prompt für Website-Analyse
// Gibt strukturiertes JSON zurück — validiert via Zod

import { z } from "zod";
import type { Company, Crawl, Page } from "@prisma/client";
import type { HeuristicCheck } from "@/types";

// ─── Zod-Schema für LLM-Output ────────────────────────────────────────────────

const scoreDimensionSchema = z.object({
  score: z.number().min(0).max(100),
  reason: z.string(),
  observations: z.array(z.string()).max(5),
  confidence: z.number().min(0).max(1),
});

export const analysisSchema = z.object({
  scoreCard: z.object({
    overall: z.number().min(0).max(100),
    dimensions: z.object({
      design: scoreDimensionSchema,
      clarity: scoreDimensionSchema,
      conversion: scoreDimensionSchema,
      trust: scoreDimensionSchema,
      ux: scoreDimensionSchema,
      mobile: scoreDimensionSchema,
      seo: scoreDimensionSchema,
      performance: scoreDimensionSchema,
      modernity: scoreDimensionSchema,
    }),
    confidence: z.number().min(0).max(1),
  }),
  executiveSummary: z.string().max(500),
  strengths: z.array(z.string()).max(5),
  weaknesses: z.array(z.string()).max(8),
  quickWins: z.array(z.string()).max(5),
  opportunities: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      impact: z.enum(["high", "medium", "low"]),
      effort: z.enum(["low", "medium", "high"]),
    })
  ).max(5),
  findings: z.array(
    z.object({
      category: z.string(),
      severity: z.enum(["critical", "high", "medium", "low", "info"]),
      title: z.string(),
      description: z.string(),
      recommendation: z.string().optional(),
    })
  ).max(10),
  isQualified: z.boolean(),
  qualificationReason: z.string(),
  opportunityScore: z.number().min(0).max(100),
  buyingProbability: z.number().min(0).max(1),
});

export type AnalysisSchemaType = z.infer<typeof analysisSchema>;

// ─── System-Prompt ────────────────────────────────────────────────────────────

export const ANALYSIS_SYSTEM_PROMPT = `Du bist ein erfahrener Webdesign- und Conversion-Experte, der Websites für eine moderne Webagentur analysiert.

Deine Aufgabe:
Bewerte die Website eines deutschen KMU präzise, ehrlich und konstruktiv.
Gib ein strukturiertes JSON-Objekt zurück.

Bewertungsprinzipien:
- Bewerte NUR was du tatsächlich aus den Daten ableiten kannst
- Keine Spekulation oder Annahmen ohne Datenbasis
- Confidence unter 0.7 wenn wichtige Daten fehlen
- Sei konkret — vermeide vage Formulierungen
- Denke aus Sicht eines potenziellen Kunden: Ist das Angebot klar? Vertraue ich der Firma?
- Für Deutschland spezifisch: Impressum, lokale Verankerung, deutschsprachige Inhalte

Score-Skala:
0–20: Kritisch — schwere Mängel, kaum funktional
21–40: Schwach — wichtige Elemente fehlen
41–60: Mittel — Basis vorhanden, deutlicher Ausbaubedarf
61–80: Gut — solide Basis, Optimierungspotenzial
81–100: Sehr gut — professionell, kaum Verbesserungsbedarf

Qualifikationskriterien (isQualified = true wenn):
- overallScore < 55 UND
- conversion.score < 65 ODER trust.score < 50 ODER clarity.score < 55
- Die Firma wirkt aktiv und hat ein erkennbares Angebot
- Kontaktmöglichkeit vorhanden oder ableitbar

WICHTIG: Antworte ausschließlich mit dem JSON-Objekt. Kein erklärender Text darum herum.`;

// ─── User-Prompt (dynamisch) ──────────────────────────────────────────────────

interface PromptData {
  company: Company;
  crawl: Crawl;
  pages: Page[];
  homePage: Page | null;
  heuristicScores: Record<string, number>;
  heuristicChecks: HeuristicCheck[];
}

export function buildAnalysisUserPrompt(data: PromptData): string {
  const { company, crawl, pages, homePage, heuristicScores, heuristicChecks } = data;

  const servicesPage = pages.find((p) => p.pageType === "SERVICES");
  const aboutPage = pages.find((p) => p.pageType === "ABOUT");

  const failedChecks = heuristicChecks
    .filter((c) => !c.passed)
    .map((c) => `- ${c.name}: ${c.reason}`)
    .join("\n");

  const passedChecks = heuristicChecks
    .filter((c) => c.passed)
    .map((c) => `- ${c.name}`)
    .join("\n");

  return `## Website-Analyse: ${company.name}

**Domain:** ${company.domain}
**Branche:** ${company.industry || "unbekannt"}
**Ort:** ${company.city || "unbekannt"}, ${company.state || "Deutschland"}

---

## Startseite

**Titel:** ${homePage?.title || "fehlt"}
**H1:** ${homePage?.h1 || "fehlt"}
**Meta-Description:** ${homePage?.metaDescription || "fehlt"}
**Ladezeit:** ${crawl.loadTimeMs ? `${crawl.loadTimeMs}ms` : "unbekannt"}
**HTTP-Status:** ${crawl.httpStatus || "unbekannt"}
**Wörter:** ${homePage?.wordCount || 0}
**Viewport-Meta:** ${homePage?.hasViewportMeta ? "vorhanden" : "fehlt"}
**CTAs gefunden:** ${(homePage?.ctaTexts as string[] | null)?.join(", ") || "keine"}
**Kontakt-E-Mails:** ${(homePage?.contactEmails as string[] | null)?.join(", ") || "keine"}
**Formular:** ${homePage?.hasForm ? "vorhanden" : "fehlt"}

**Inhalt (Auszug):**
${(homePage?.bodyText || "").slice(0, 1500)}

---

## Gecrawlte Seiten (${pages.length})

${pages.map((p) => `- **${p.pageType}**: ${p.url} (${p.wordCount || 0} Wörter)`).join("\n")}

${
  servicesPage
    ? `## Leistungsseite (Auszug)
${(servicesPage.bodyText || "").slice(0, 800)}`
    : "**Leistungsseite:** nicht gefunden"
}

${
  aboutPage
    ? `## Über-uns-Seite (Auszug)
${(aboutPage.bodyText || "").slice(0, 600)}`
    : "**Über-uns-Seite:** nicht gefunden"
}

---

## Heuristische Vorbewertung

**Scores (0–100):**
${Object.entries(heuristicScores)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

**Bestandene Checks:**
${passedChecks || "keine"}

**Nicht bestandene Checks:**
${failedChecks || "alle bestanden"}

---

Erstelle jetzt die vollständige Analyse als JSON-Objekt.`;
}
