// Demo-Website-Generator Service

import { db } from "@/lib/db";
import { generateLLMObject } from "@/lib/llm";
import {
  buildSiteGenerationSystemPrompt,
  buildSiteGenerationUserPrompt,
  siteGenerationSchema,
  type SiteGenerationResult,
} from "@/server/prompts/site-generation.prompt";
import { SiteStyle } from "@/types";
import path from "path";
import fs from "fs/promises";
import { logDemoGenerationStarted, logDemoGenerationCompleted, logDemoGenerationFailed } from "./audit.service";

const STORAGE_PATH = process.env.STORAGE_LOCAL_PATH || "./storage";

export async function generateDemoSite(
  companyId: string,
  styleStr?: string
): Promise<void> {
  const style: SiteStyle =
    (styleStr as SiteStyle) ?? SiteStyle.MODERN_PREMIUM;

  const company = await db.company.findUniqueOrThrow({ where: { id: companyId } });

  const analysis = await db.analysis.findFirst({
    where: { companyId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
  });

  if (!analysis) throw new Error(`Keine abgeschlossene Analyse für ${companyId}`);

  const crawl = await db.crawl.findFirst({
    where: { companyId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    include: { pages: true },
  });

  const homePage = crawl?.pages.find((p) => p.pageType === "HOME") ?? null;
  const servicesPage = crawl?.pages.find((p) => p.pageType === "SERVICES") ?? null;

  // Versionsnummer ermitteln
  const existingCount = await db.generatedSite.count({
    where: { companyId, style },
  });
  const version = existingCount + 1;

  // Audit-Log: Demo-Generierung gestartet
  await logDemoGenerationStarted(companyId, style);

  // Site-Record anlegen
  const siteRecord = await db.generatedSite.create({
    data: {
      companyId,
      version,
      style,
      status: "GENERATING",
      generatedBy: "",
      promptVersion: "1.0",
    },
  });

  try {
    const systemPrompt = buildSiteGenerationSystemPrompt(style);
    const userPrompt = buildSiteGenerationUserPrompt({
      company,
      analysis,
      homePage,
      servicesPage,
      style,
    });

    const { object: siteContent, model } = await generateLLMObject(
      "generation",
      systemPrompt,
      userPrompt,
      siteGenerationSchema,
      { maxTokens: 6000, temperature: 0.4 }
    );

    // HTML generieren
    const htmlContent = renderSiteToHtml(siteContent, company.name);
    const cssContent = generateSiteCSS(siteContent);

    // Artefakt speichern
    const previewUrl = await saveSiteArtifact(
      companyId,
      siteRecord.id,
      htmlContent
    );

    await db.generatedSite.update({
      where: { id: siteRecord.id },
      data: {
        status: "GENERATED",
        htmlContent,
        cssContent,
        sections: JSON.stringify(siteContent.sections),
        hasPlaceholders: siteContent.hasPlaceholders,
        placeholderNotes: JSON.stringify(siteContent.placeholderSummary),
        unverifiedClaims: JSON.stringify(siteContent.unverifiedClaims ?? []),
        generatedBy: model,
        previewUrl,
      },
    });

    await db.company.update({
      where: { id: companyId },
      data: { status: "SITE_GENERATED" },
    });

    // Audit-Log: Demo erstellt
    await logDemoGenerationCompleted(companyId, siteRecord.id, siteContent.hasPlaceholders);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    
    // Audit-Log: Demo-Generierung fehlgeschlagen
    await logDemoGenerationFailed(companyId, message);
    
    await db.generatedSite.update({
      where: { id: siteRecord.id },
      data: { 
        status: "FAILED",
        errorCode: "GENERATION_ERROR",
        errorDetails: message,
      },
    });
    throw error;
  }
}

// ─── HTML-Renderer ────────────────────────────────────────────────────────────

function renderSiteToHtml(content: SiteGenerationResult, companyName: string): string {
  const sections = content.sections
    .map((s) => renderSection(s))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(content.meta.title)}</title>
  <meta name="description" content="${escapeHtml(content.meta.description)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(content.fonts.heading)}:wght@400;600;700&family=${encodeURIComponent(content.fonts.body)}:wght@400;500&display=swap" rel="stylesheet">
  <style>
    ${generateSiteCSS(content)}
  </style>
</head>
<body>
  <!-- DEMO: Generiert von Website Rescue Agent — Lucello Studio -->
  <!-- Platzhalter in [ECKIGEN_KLAMMERN] müssen vor Verwendung ersetzt werden -->
  ${sections}
</body>
</html>`;
}

function renderSection(section: { type: string; content: Record<string, unknown>; hasPlaceholders: boolean }): string {
  const c = section.content;
  const cls = section.hasPlaceholders ? ' data-has-placeholder="true"' : "";

  switch (section.type) {
    case "hero":
      return `<section class="section-hero"${cls}>
  <div class="container">
    <h1>${escapeHtml(String(c.headline || ""))}</h1>
    <p class="subheadline">${escapeHtml(String(c.subheadline || ""))}</p>
    <a href="${String(c.ctaUrl || "#kontakt")}" class="btn-primary">${escapeHtml(String(c.ctaText || "Jetzt anfragen"))}</a>
  </div>
</section>`;

    case "services":
      const services = Array.isArray(c.items) ? c.items : [];
      return `<section class="section-services"${cls}>
  <div class="container">
    <h2>${escapeHtml(String(c.title || "Unsere Leistungen"))}</h2>
    <div class="services-grid">
      ${services.map((s: unknown) => {
        const item = s as Record<string, unknown>;
        return `<div class="service-card">
        <h3>${escapeHtml(String(item.title || ""))}</h3>
        <p>${escapeHtml(String(item.description || ""))}</p>
      </div>`;
      }).join("\n")}
    </div>
  </div>
</section>`;

    case "trust":
      const points = Array.isArray(c.points) ? c.points : [];
      return `<section class="section-trust"${cls}>
  <div class="container">
    <h2>${escapeHtml(String(c.title || "Warum uns vertrauen?"))}</h2>
    <div class="trust-grid">
      ${points.map((p: unknown) => {
        const item = p as Record<string, unknown>;
        return `<div class="trust-item">
        <strong>${escapeHtml(String(item.label || ""))}</strong>
        <p>${escapeHtml(String(item.description || ""))}</p>
      </div>`;
      }).join("\n")}
    </div>
  </div>
</section>`;

    case "cta":
      return `<section class="section-cta"${cls}>
  <div class="container">
    <h2>${escapeHtml(String(c.headline || "Bereit für einen besseren Webauftritt?"))}</h2>
    <p>${escapeHtml(String(c.subtext || ""))}</p>
    <a href="${String(c.ctaUrl || "#kontakt")}" class="btn-primary btn-large">${escapeHtml(String(c.ctaText || "Jetzt Kontakt aufnehmen"))}</a>
  </div>
</section>`;

    case "footer":
      return `<footer class="section-footer"${cls}>
  <div class="container">
    <p>${escapeHtml(String(c.address || ""))}</p>
    <p>${escapeHtml(String(c.phone || ""))} | ${escapeHtml(String(c.email || ""))}</p>
    <p><small>© ${new Date().getFullYear()} — Demo erstellt von Lucello Studio</small></p>
  </div>
</footer>`;

    default:
      return `<section class="section-generic"${cls}>
  <div class="container">
    <h2>${escapeHtml(String(c.title || ""))}</h2>
    <p>${escapeHtml(String(c.body || ""))}</p>
  </div>
</section>`;
  }
}

// ─── CSS-Generator ────────────────────────────────────────────────────────────

function generateSiteCSS(content: SiteGenerationResult): string {
  const { colorPalette: c, fonts: f } = content;
  return `
    :root {
      --primary: ${c.primary};
      --secondary: ${c.secondary};
      --accent: ${c.accent};
      --bg: ${c.background};
      --text: ${c.text};
      --font-heading: '${f.heading}', sans-serif;
      --font-body: '${f.body}', sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-body); color: var(--text); background: var(--bg); line-height: 1.6; }
    h1, h2, h3 { font-family: var(--font-heading); }
    .container { max-width: 1140px; margin: 0 auto; padding: 0 24px; }
    .section-hero { background: var(--primary); color: white; padding: 100px 0; text-align: center; }
    .section-hero h1 { font-size: 3rem; margin-bottom: 1.5rem; font-weight: 700; }
    .subheadline { font-size: 1.25rem; opacity: 0.9; margin-bottom: 2.5rem; max-width: 600px; margin-left: auto; margin-right: auto; }
    .btn-primary { background: var(--accent); color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 1rem; display: inline-block; transition: opacity .2s; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-large { padding: 18px 40px; font-size: 1.125rem; }
    .section-services { padding: 80px 0; }
    .section-services h2 { font-size: 2rem; text-align: center; margin-bottom: 3rem; }
    .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
    .service-card { background: white; border: 1px solid #eee; border-radius: 12px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
    .service-card h3 { font-size: 1.2rem; margin-bottom: .75rem; color: var(--primary); }
    .section-trust { background: #f8f9fa; padding: 80px 0; }
    .section-trust h2 { font-size: 2rem; text-align: center; margin-bottom: 3rem; }
    .trust-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; }
    .trust-item { text-align: center; }
    .trust-item strong { display: block; font-size: 1.1rem; margin-bottom: .5rem; color: var(--primary); }
    .section-cta { background: var(--secondary); color: white; padding: 80px 0; text-align: center; }
    .section-cta h2 { font-size: 2.25rem; margin-bottom: 1rem; }
    .section-cta p { font-size: 1.1rem; opacity: .9; margin-bottom: 2rem; }
    .section-generic { padding: 60px 0; }
    .section-generic h2 { font-size: 1.75rem; margin-bottom: 1.5rem; }
    .section-footer { background: #111; color: #ccc; padding: 40px 0; text-align: center; }
    .section-footer p { margin-bottom: .5rem; font-size: .9rem; }
    [data-has-placeholder="true"] { outline: 2px dashed #f59e0b; outline-offset: 4px; }
    @media (max-width: 768px) {
      .section-hero h1 { font-size: 2rem; }
      .section-services, .section-trust, .section-cta { padding: 60px 0; }
    }
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function saveSiteArtifact(
  companyId: string,
  siteId: string,
  html: string
): Promise<string> {
  const dir = path.join(STORAGE_PATH, "sites", companyId);
  await fs.mkdir(dir, { recursive: true });
  const filename = `${siteId}.html`;
  await fs.writeFile(path.join(dir, filename), html, "utf-8");
  return `/storage/sites/${companyId}/${filename}`;
}
