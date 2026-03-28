// Heuristische Website-Analyse
// Läuft auch ohne LLM und liefert zuverlässigen Basisscore

import type { Crawl, Page } from "@prisma/client";
import type { HeuristicCheck, HeuristicResult } from "@/types";

interface CrawlData {
  crawl: Crawl;
  pages: Page[];
  homePage?: Page;
}

export function runHeuristicAnalysis(data: CrawlData): HeuristicResult {
  const checks: HeuristicCheck[] = [
    ...checkMobileFriendliness(data),
    ...checkSEOBasics(data),
    ...checkConversionElements(data),
    ...checkTrustSignals(data),
    ...checkContentClarity(data),
    ...checkTechnicalBasics(data),
    ...checkUXStructure(data),
  ];

  const dimensionScores = aggregateDimensionScores(checks);
  const overallScore = calculateOverallScore(dimensionScores);

  return { checks, dimensionScores, overallScore };
}

// ─── Mobile / UX ──────────────────────────────────────────────────────────────

function checkMobileFriendliness(data: CrawlData): HeuristicCheck[] {
  const home = data.homePage;
  return [
    {
      id: "mobile_viewport",
      name: "Viewport-Meta-Tag vorhanden",
      category: "mobile",
      weight: 3,
      passed: home?.hasViewportMeta ?? false,
      score: (home?.hasViewportMeta ?? false) ? 100 : 0,
      reason: (home?.hasViewportMeta ?? false)
        ? "Viewport-Meta-Tag gefunden — mobile Darstellung konfiguriert"
        : "Kein Viewport-Meta-Tag — Website wahrscheinlich nicht mobiloptimiert",
    },
    {
      id: "mobile_loadtime",
      name: "Ladezeit akzeptabel",
      category: "mobile",
      weight: 2,
      passed: (data.crawl.loadTimeMs ?? 9999) < 5000,
      score: data.crawl.loadTimeMs
        ? Math.max(0, 100 - Math.floor((data.crawl.loadTimeMs - 1000) / 100))
        : 50,
      reason: data.crawl.loadTimeMs
        ? `Ladezeit: ${data.crawl.loadTimeMs}ms`
        : "Ladezeit nicht messbar",
    },
  ];
}

// ─── SEO-Basics ───────────────────────────────────────────────────────────────

function checkSEOBasics(data: CrawlData): HeuristicCheck[] {
  const home = data.homePage;
  return [
    {
      id: "seo_title",
      name: "Seiten-Titel vorhanden",
      category: "seo",
      weight: 2,
      passed: !!(home?.title && home.title.length > 5),
      score: (home?.title && home.title.length > 5) ? 100 : 0,
      reason: home?.title
        ? `Titel: "${home.title}"`
        : "Kein Seiten-Titel gefunden",
    },
    {
      id: "seo_meta_description",
      name: "Meta-Description vorhanden",
      category: "seo",
      weight: 2,
      passed: !!(home?.metaDescription && home.metaDescription.length > 20),
      score: (home?.metaDescription && home.metaDescription.length > 20) ? 100 : 0,
      reason: home?.metaDescription
        ? `Meta-Description: ${home.metaDescription.length} Zeichen`
        : "Keine Meta-Description — schlechte SEO-Basis",
    },
    {
      id: "seo_h1",
      name: "H1-Überschrift vorhanden",
      category: "seo",
      weight: 3,
      passed: !!(home?.h1 && home.h1.length > 3),
      score: (home?.h1 && home.h1.length > 3) ? 100 : 0,
      reason: home?.h1 ? `H1: "${home.h1}"` : "Keine H1-Überschrift — Hauptthema unklar",
    },
    {
      id: "seo_canonical",
      name: "Canonical-Tag vorhanden",
      category: "seo",
      weight: 1,
      passed: home?.hasCanonical ?? false,
      score: (home?.hasCanonical ?? false) ? 100 : 40,
      reason: (home?.hasCanonical ?? false)
        ? "Canonical-Tag vorhanden"
        : "Kein Canonical-Tag (unkritisch, aber empfohlen)",
    },
  ];
}

// ─── Conversion ───────────────────────────────────────────────────────────────

function checkConversionElements(data: CrawlData): HeuristicCheck[] {
  const home = data.homePage;
  const allPages = data.pages;
  const hasAnyCTA = allPages.some((p) => p.hasCTA);
  const ctaCount = (home?.ctaTexts as string[] | null)?.length ?? 0;

  return [
    {
      id: "conversion_cta_exists",
      name: "Call-to-Action vorhanden",
      category: "conversion",
      weight: 4,
      passed: hasAnyCTA,
      score: hasAnyCTA ? Math.min(100, 50 + ctaCount * 15) : 0,
      reason: hasAnyCTA
        ? `${ctaCount} CTA(s) auf der Startseite gefunden`
        : "Kein erkennbarer Call-to-Action — Besucher werden nicht geführt",
    },
    {
      id: "conversion_contact_form",
      name: "Kontaktformular vorhanden",
      category: "conversion",
      weight: 3,
      passed: allPages.some((p) => p.hasForm),
      score: allPages.some((p) => p.hasForm) ? 100 : 20,
      reason: allPages.some((p) => p.hasForm)
        ? "Kontaktformular gefunden"
        : "Kein Kontaktformular — hohe Hürde für Anfragen",
    },
    {
      id: "conversion_phone_visible",
      name: "Telefonnummer sichtbar",
      category: "conversion",
      weight: 3,
      passed: allPages.some((p) => p.hasPhone),
      score: allPages.some((p) => p.hasPhone) ? 100 : 30,
      reason: allPages.some((p) => p.hasPhone)
        ? "Telefonnummer gefunden"
        : "Keine sichtbare Telefonnummer",
    },
  ];
}

// ─── Vertrauen / Trust ────────────────────────────────────────────────────────

function checkTrustSignals(data: CrawlData): HeuristicCheck[] {
  const allPages = data.pages;
  const hasImprint = allPages.some(
    (p) => p.pageType === "IMPRINT" || p.url.includes("impressum")
  );
  const hasContact = allPages.some(
    (p) => p.pageType === "CONTACT" || p.hasContactInfo
  );
  const hasAbout = allPages.some((p) => p.pageType === "ABOUT");
  const hasAddress = allPages.some((p) => p.hasAddress);

  return [
    {
      id: "trust_imprint",
      name: "Impressum vorhanden",
      category: "trust",
      weight: 3,
      passed: hasImprint,
      score: hasImprint ? 100 : 0,
      reason: hasImprint
        ? "Impressum gefunden"
        : "Kein Impressum erkennbar — rechtlich kritisch",
    },
    {
      id: "trust_contact_page",
      name: "Kontaktseite vorhanden",
      category: "trust",
      weight: 2,
      passed: hasContact,
      score: hasContact ? 100 : 20,
      reason: hasContact
        ? "Kontaktseite oder Kontaktinformationen gefunden"
        : "Keine Kontaktseite — wirkt unzugänglich",
    },
    {
      id: "trust_about_page",
      name: "Über-uns-Seite vorhanden",
      category: "trust",
      weight: 2,
      passed: hasAbout,
      score: hasAbout ? 100 : 40,
      reason: hasAbout
        ? "Über-uns-Seite gefunden"
        : "Keine Über-uns-Seite — fehlende Vertrauensbasis",
    },
    {
      id: "trust_address",
      name: "Adresse sichtbar",
      category: "trust",
      weight: 2,
      passed: hasAddress,
      score: hasAddress ? 100 : 30,
      reason: hasAddress
        ? "Adresse gefunden"
        : "Keine sichtbare Adresse — wirkt wenig lokal verankert",
    },
  ];
}

// ─── Content / Klarheit ───────────────────────────────────────────────────────

function checkContentClarity(data: CrawlData): HeuristicCheck[] {
  const home = data.homePage;
  const wordCount = home?.wordCount ?? 0;
  const hasServices = data.pages.some((p) => p.pageType === "SERVICES");

  return [
    {
      id: "clarity_word_count",
      name: "Ausreichend Inhalt vorhanden",
      category: "clarity",
      weight: 2,
      passed: wordCount > 200,
      score: wordCount > 500 ? 100 : wordCount > 200 ? 70 : wordCount > 50 ? 30 : 0,
      reason: `Startseite hat ca. ${wordCount} Wörter`,
    },
    {
      id: "clarity_services_page",
      name: "Leistungsseite vorhanden",
      category: "clarity",
      weight: 3,
      passed: hasServices,
      score: hasServices ? 100 : 20,
      reason: hasServices
        ? "Leistungsseite gefunden"
        : "Keine dedizierte Leistungsseite — Angebot unklar",
    },
  ];
}

// ─── Technische Basis ─────────────────────────────────────────────────────────

function checkTechnicalBasics(data: CrawlData): HeuristicCheck[] {
  const httpOk = (data.crawl.httpStatus ?? 0) >= 200 && (data.crawl.httpStatus ?? 0) < 400;
  const hasRedirect = !!data.crawl.redirectUrl;

  return [
    {
      id: "tech_http_ok",
      name: "Website erreichbar (HTTP 200)",
      category: "performance",
      weight: 5,
      passed: httpOk,
      score: httpOk ? 100 : 0,
      reason: `HTTP Status: ${data.crawl.httpStatus ?? "unbekannt"}`,
    },
    {
      id: "tech_images",
      name: "Bilder vorhanden",
      category: "design",
      weight: 1,
      passed: data.pages.some((p) => p.hasImages),
      score: data.pages.some((p) => p.hasImages) ? 80 : 10,
      reason: data.pages.some((p) => p.hasImages)
        ? "Bilder auf der Seite gefunden"
        : "Keine Bilder erkennbar — wirkt kahl",
    },
  ];
}

// ─── UX / Struktur ────────────────────────────────────────────────────────────

function checkUXStructure(data: CrawlData): HeuristicCheck[] {
  const pageCount = data.pages.length;
  return [
    {
      id: "ux_page_count",
      name: "Mehrere Unterseiten vorhanden",
      category: "ux",
      weight: 2,
      passed: pageCount > 2,
      score: pageCount > 5 ? 100 : pageCount > 2 ? 60 : 20,
      reason: `${pageCount} Seite(n) gecrawlt`,
    },
  ];
}

// ─── Aggregation ──────────────────────────────────────────────────────────────

const DIMENSION_WEIGHTS: Record<string, number> = {
  mobile: 15,
  seo: 15,
  conversion: 25,
  trust: 20,
  clarity: 15,
  performance: 5,
  design: 5,
  ux: 10,
  modernity: 5,
};

function aggregateDimensionScores(checks: HeuristicCheck[]): Record<string, number> {
  const dimensionData: Record<string, { totalWeight: number; weightedScore: number }> = {};

  for (const check of checks) {
    if (!dimensionData[check.category]) {
      dimensionData[check.category] = { totalWeight: 0, weightedScore: 0 };
    }
    dimensionData[check.category].totalWeight += check.weight;
    dimensionData[check.category].weightedScore += check.score * check.weight;
  }

  const scores: Record<string, number> = {};
  for (const [dim, data] of Object.entries(dimensionData)) {
    scores[dim] =
      data.totalWeight > 0
        ? Math.round(data.weightedScore / data.totalWeight)
        : 50;
  }
  return scores;
}

function calculateOverallScore(dimensionScores: Record<string, number>): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const [dim, score] of Object.entries(dimensionScores)) {
    const weight = DIMENSION_WEIGHTS[dim] ?? 5;
    totalWeight += weight;
    weightedSum += score * weight;
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}
