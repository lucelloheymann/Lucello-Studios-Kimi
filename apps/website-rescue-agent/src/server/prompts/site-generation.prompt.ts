// LLM-Prompt für Demo-Website-Generierung
// Erstellt hochwertige HTML-Landingpages basierend auf echten Firmendaten

import { z } from "zod";
import type { Company, Analysis, Page } from "@prisma/client";
import type { SiteStyle } from "@prisma/client";

// ─── Zod-Schema ───────────────────────────────────────────────────────────────

const sectionSchema = z.object({
  id: z.string(),
  type: z.enum(["hero", "value_proposition", "services", "differentiators", "trust", "about", "process", "faq", "cta", "footer"]),
  title: z.string().optional(),
  content: z.record(z.unknown()),
  hasPlaceholders: z.boolean(),
  placeholderFields: z.array(z.string()).optional(),
});

export const siteGenerationSchema = z.object({
  meta: z.object({
    title: z.string().max(70),
    description: z.string().max(160),
    headline: z.string().max(80),
    subheadline: z.string().max(150),
  }),
  sections: z.array(sectionSchema),
  colorPalette: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    text: z.string(),
  }),
  fonts: z.object({
    heading: z.string(),
    body: z.string(),
  }),
  hasPlaceholders: z.boolean(),
  placeholderSummary: z.string().optional(),
  unverifiedClaims: z.array(z.string()).optional(),
});

export type SiteGenerationResult = z.infer<typeof siteGenerationSchema>;

// ─── Style-Definitionen ───────────────────────────────────────────────────────

const STYLE_DESCRIPTIONS: Record<SiteStyle, string> = {
  SERIOUS_CONSERVATIVE: `
Stil: Seriös / Konservativ
- Professionelle, zurückhaltende Farbpalette (Dunkelblau, Grau, Weiß)
- Klare Typografie (serifenlos, klar lesbar)
- Formelle Sprache, sachliche Formulierungen
- Vertrauen durch Struktur und Professionalität
- Geeignet für: Kanzleien, Berater, Finanzdienstleister`,

  MODERN_PREMIUM: `
Stil: Modern / Hochwertig
- Moderne Farbpalette (kräftige Akzente auf hellem Hintergrund)
- Elegante Typografie, großzügige Abstände
- Kurze, impactreiche Texte
- Qualitätssignale durch Design
- Geeignet für: Premium-Dienstleister, Agenturen, moderne Unternehmen`,

  LOCAL_APPROACHABLE: `
Stil: Lokal / Nahbar
- Warme, freundliche Farbpalette (Erdtöne, warme Akzente)
- Persönliche, direkte Ansprache
- Regionaler Bezug sichtbar machen
- Teamfotos und lokale Referenzen betonen
- Geeignet für: Handwerker, Ärzte, lokale Dienstleister`,

  PERFORMANCE_CONVERSION: `
Stil: Performance / Conversion-fokussiert
- Klare visuelle Hierarchie, starke CTAs
- Kontrastreiche Farbgebung (klare CTA-Farben)
- Social Proof prominent platziert
- Minimaler Ablenkungsgrad
- Geeignet für: Leads generieren, Anfragen maximieren`,
};

// ─── System-Prompt ────────────────────────────────────────────────────────────

export function buildSiteGenerationSystemPrompt(style: SiteStyle): string {
  return `Du bist ein erfahrener Webdesign-Experte und Texter für eine moderne deutsche Webagentur.

Deine Aufgabe:
Erstelle die Struktur und alle Inhalte für eine hochwertige Demo-Landingpage für ein deutsches Unternehmen.

${STYLE_DESCRIPTIONS[style]}

ABSOLUT VERBOTEN (Guardrails):
- Keine erfundenen Bewertungen oder Sternebewertungen (z.B. "4.8/5 von 200 Kunden")
- Keine erfundenen Referenzen oder Kundennamen
- Keine erfundenen Auszeichnungen oder Zertifikate
- Keine erfundenen Teammitglieder
- Keine erfundenen Umsatzzahlen oder Wachstumsdaten
- Keine erfundenen Partnerlogos
- Keine konkreten Preise (außer wenn aus echten Daten bekannt)

WENN DATEN FEHLEN:
- Nutze hochwertige generische Platzhalter: [FOTO_TEAM], [ANZAHL_PROJEKTE], [REFERENZ_NAME]
- Markiere hasPlaceholders: true und liste placeholderFields auf
- Formuliere neutral: "Jahrelange Erfahrung" statt "15 Jahre Erfahrung" (wenn unbekannt)
- Nutze echte Stärken der Branche, keine spezifischen Erfindungen

QUALITÄTSSTANDARD:
- Headline: klar, nutzenorientiert, nicht generisch
- Value Proposition: konkret, differenzierend
- CTAs: aktiv und klar ("Jetzt anfragen", nicht "Hier klicken")
- Texte: kurz, präzise, auf den Punkt
- Die Seite soll deutlich besser wirken als das Original

STRUKTUR (Pflicht):
1. hero — Headline, Subheadline, Primär-CTA
2. value_proposition — 3 Kernnutzen
3. services — Leistungsübersicht (aus echten Daten)
4. differentiators — Warum dieses Unternehmen
5. trust — Vertrauenselemente (nur echte oder generische Platzhalter)
6. about — Über uns (kompakt)
7. process — Ablauf (3–4 Schritte)
8. faq — 3–4 häufige Fragen
9. cta — Finale Handlungsaufforderung
10. footer — Kontakt, Adresse, Links

Antworte nur mit dem JSON-Objekt.`;
}

// ─── User-Prompt ──────────────────────────────────────────────────────────────

interface SiteGenPromptData {
  company: Company;
  analysis: Analysis;
  homePage: Page | null;
  servicesPage: Page | null;
  style: SiteStyle;
}

export function buildSiteGenerationUserPrompt(data: SiteGenPromptData): string {
  const { company, analysis, homePage, servicesPage, style } = data;

  const weaknesses = (analysis.weaknesses as string[] | null) ?? [];
  const strengths = (analysis.strengths as string[] | null) ?? [];

  return `## Firmendaten

**Name:** ${company.name}
**Domain:** ${company.domain}
**Branche:** ${company.industry || "unbekannt"}
**Ort:** ${company.city || ""}${company.state ? `, ${company.state}` : ""}, Deutschland
**Telefon:** ${company.phone || "[TELEFON]"}
**E-Mail:** ${company.email || "[EMAIL]"}

---

## Bestehende Website (Basis für Verbesserung)

**Titel:** ${homePage?.title || "fehlt"}
**H1:** ${homePage?.h1 || "fehlt"}
**Beschreibung:** ${homePage?.metaDescription || "fehlt"}

**Gefundene Inhalte (Startseite):**
${(homePage?.bodyText || "Keine Inhalte extrahiert").slice(0, 2000)}

${
  servicesPage
    ? `**Leistungsseite:**
${(servicesPage.bodyText || "").slice(0, 1000)}`
    : "Keine separate Leistungsseite gefunden."
}

---

## Analyse-Ergebnisse

**Gesamt-Score:** ${analysis.overallScore?.toFixed(0) ?? "?"}/100
**Stärken:**
${strengths.map((s) => `- ${s}`).join("\n") || "- Keine identifiziert"}

**Schwächen (zu verbessern):**
${weaknesses.map((w) => `- ${w}`).join("\n") || "- Keine identifiziert"}

**Executive Summary:**
${analysis.executiveSummary || "Keine Zusammenfassung verfügbar"}

---

**Gewünschter Stil:** ${style}

Erstelle jetzt die vollständige Demo-Website-Struktur als JSON.
Nutze die echten Firmendaten und verbessere die schwachen Punkte deutlich sichtbar.`;
}
