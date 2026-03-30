// Analyse-Service: Heuristiken + LLM-Bewertung kombiniert

import { db } from "@/lib/db";
import { runHeuristicAnalysis } from "@/lib/heuristics";
import { generateLLMObject } from "@/lib/llm";
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisUserPrompt } from "@/server/prompts/analysis.prompt";
import { analysisSchema } from "@/server/prompts/analysis.prompt";
import type { AnalysisResult } from "@/types";
import { logAnalysisStarted, logAnalysisCompleted } from "./audit.service";

// LLM und Heuristik gewichten
const HEURISTIC_WEIGHT = 0.35;
const LLM_WEIGHT = 0.65;

export async function analyzeWebsite(companyId: string): Promise<void> {
  const company = await db.company.findUniqueOrThrow({ where: { id: companyId } });

  // Neuesten Crawl laden
  const crawl = await db.crawl.findFirst({
    where: { companyId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    include: { pages: true },
  });

  if (!crawl) throw new Error(`Kein abgeschlossener Crawl für ${companyId}`);

  const homePage = crawl.pages.find((p) => p.pageType === "HOME") ?? crawl.pages[0];

  // VALIDIERUNG: Mindestanforderungen für brauchbare Analyse
  const hasValidContent = 
    homePage &&
    homePage.title &&
    homePage.title.length > 0 &&
    (homePage.wordCount ?? 0) > 50;

  if (!hasValidContent) {
    const failReason = !homePage?.title 
      ? 'Kein Seitentitel vorhanden' 
      : `Zu wenig Content (${homePage.wordCount} Wörter)`;
    
    await db.analysis.create({
      data: {
        companyId,
        crawlId: crawl.id,
        status: "FAILED",
        errorMessage: `Unzureichende Crawl-Daten: ${failReason}`,
        isQualified: false,
      },
    });

    await db.company.update({
      where: { id: companyId },
      data: { status: "ANALYSIS_FAILED" },
    });

    throw new Error(`Analyse nicht möglich: ${failReason}`);
  }

  // Audit-Log: Analyse gestartet
  await logAnalysisStarted(companyId);

  // Analyse-Record anlegen
  const analysis = await db.analysis.create({
    data: {
      companyId,
      crawlId: crawl.id,
      status: "RUNNING",
    },
  });

  try {
    // 1. Heuristische Analyse
    const heuristicResult = runHeuristicAnalysis({
      crawl,
      pages: crawl.pages,
      homePage: homePage ?? undefined,
    });

    // 2. LLM-Analyse (falls konfiguriert)
    let llmResult: AnalysisResult | null = null;
    let llmModel = "";

    try {
      const userPrompt = buildAnalysisUserPrompt({
        company,
        crawl,
        pages: crawl.pages,
        homePage: homePage ?? null,
        heuristicScores: heuristicResult.dimensionScores,
        heuristicChecks: heuristicResult.checks,
      });

      const result = await generateLLMObject(
        "analysis",
        ANALYSIS_SYSTEM_PROMPT,
        userPrompt,
        analysisSchema,
        { maxTokens: 4096, temperature: 0.2 }
      );

      llmResult = result.object;
      llmModel = result.model;
    } catch (llmError) {
      console.warn("LLM-Analyse fehlgeschlagen, nutze nur Heuristik:", llmError);
    }

    // 3. Scores kombinieren
    const combinedScores = combineDimensionScores(
      heuristicResult.dimensionScores,
      llmResult
    );

    const overallScore = calculateWeightedOverall(combinedScores);
    const confidence = llmResult ? 0.85 : 0.6;

    // 4. Opportunity-Qualifikation
    const isQualified =
      overallScore < 55 &&
      (combinedScores.conversion ?? 0) < 70 &&
      !company.isBlacklisted;

    const opportunityScore = calculateOpportunityScore(overallScore, company);
    const buyingProbability = calculateBuyingProbability(
      overallScore,
      company.industry,
      opportunityScore
    );

    // 5. Analyse speichern
    await db.analysis.update({
      where: { id: analysis.id },
      data: {
        status: "COMPLETED",

        overallScore,
        confidence,

        designScore: combinedScores.design ?? heuristicResult.dimensionScores.design,
        clarityScore: combinedScores.clarity ?? heuristicResult.dimensionScores.clarity,
        conversionScore: combinedScores.conversion ?? heuristicResult.dimensionScores.conversion,
        trustScore: combinedScores.trust ?? heuristicResult.dimensionScores.trust,
        uxScore: combinedScores.ux ?? heuristicResult.dimensionScores.ux,
        mobileScore: combinedScores.mobile ?? heuristicResult.dimensionScores.mobile,
        seoScore: combinedScores.seo ?? heuristicResult.dimensionScores.seo,
        performanceScore: combinedScores.performance ?? heuristicResult.dimensionScores.performance,
        modernityScore: llmResult?.scoreCard?.dimensions?.modernity?.score ?? 40,

        scoreReasons: JSON.stringify(llmResult?.scoreCard?.dimensions ?? heuristicResult.checks),
        executiveSummary: llmResult?.executiveSummary ?? generateFallbackSummary(overallScore, company.name),
        strengths: JSON.stringify(llmResult?.strengths ?? []),
        weaknesses: JSON.stringify(llmResult?.weaknesses ?? []),
        quickWins: JSON.stringify(llmResult?.quickWins ?? []),
        opportunities: JSON.stringify(llmResult?.opportunities ?? []),
        findings: JSON.stringify(llmResult?.findings ?? heuristicResult.checks.filter((c) => !c.passed).map((c) => ({
          category: c.category,
          severity: c.score < 30 ? "high" : "medium",
          title: c.name,
          description: c.reason,
        }))),

        isQualified,
        qualificationReason: isQualified
          ? "Score unter 55 und klares Verbesserungspotenzial"
          : `Score ${overallScore} — nicht qualifiziert`,
        opportunityScore,
        buyingProbability,

        heuristicVersion: "1.0",
        llmModel: llmModel || null,
        llmPromptVersion: "1.0",
      },
    });

    // Company-Status + Scores aktualisieren
    await db.company.update({
      where: { id: companyId },
      data: {
        status: isQualified ? "QUALIFIED" : "ANALYZED",
        isQualified,
        opportunityScore,
        buyingProbability,
        priority: Math.round(opportunityScore),
      },
    });

    // Audit-Log: Analyse abgeschlossen
    await logAnalysisCompleted(companyId, overallScore, isQualified);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    await db.analysis.update({
      where: { id: analysis.id },
      data: { status: "FAILED", errorMessage: message },
    });
    throw error;
  }
}

// ─── Score-Kombination ────────────────────────────────────────────────────────

function combineDimensionScores(
  heuristic: Record<string, number>,
  llm: AnalysisResult | null
): Record<string, number> {
  if (!llm) return heuristic;

  const dims = llm.scoreCard?.dimensions;
  if (!dims) return heuristic;

  const combined: Record<string, number> = {};
  for (const [key, hScore] of Object.entries(heuristic)) {
    const llmDim = dims[key as keyof typeof dims];
    const llmScore = llmDim?.score;
    if (llmScore !== undefined) {
      combined[key] = Math.round(
        hScore * HEURISTIC_WEIGHT + llmScore * LLM_WEIGHT
      );
    } else {
      combined[key] = hScore;
    }
  }
  return combined;
}

function calculateWeightedOverall(scores: Record<string, number>): number {
  const weights: Record<string, number> = {
    conversion: 0.25,
    trust: 0.20,
    clarity: 0.15,
    seo: 0.15,
    mobile: 0.10,
    ux: 0.08,
    design: 0.05,
    performance: 0.02,
  };

  let total = 0;
  let weightSum = 0;
  for (const [dim, w] of Object.entries(weights)) {
    if (scores[dim] !== undefined) {
      total += scores[dim] * w;
      weightSum += w;
    }
  }

  return weightSum > 0 ? Math.round(total / weightSum) : 0;
}

function calculateOpportunityScore(
  websiteScore: number,
  company: { industry?: string | null; city?: string | null }
): number {
  // Schwache Website = hohe Opportunity
  const weaknessFactor = Math.max(0, 100 - websiteScore);

  // Branchenbonus (kaufkräftige Branchen)
  const premiumIndustries = ["immobilien", "kanzlei", "arztpraxis", "berater"];
  const industryBonus = premiumIndustries.includes(company.industry ?? "") ? 15 : 0;

  // Stadtbonus
  const cityBonus = company.city ? 5 : 0;

  return Math.min(100, Math.round(weaknessFactor * 0.8 + industryBonus + cityBonus));
}

function calculateBuyingProbability(
  websiteScore: number,
  industry: string | null,
  opportunityScore: number
): number {
  // Niedrige Score + hohe Opportunity = höhere Kaufwahrscheinlichkeit
  const base = Math.min(0.8, opportunityScore / 100);
  const industryMultiplier = ["immobilien", "kanzlei"].includes(industry ?? "")
    ? 1.2
    : 1.0;
  return Math.min(0.95, Math.round(base * industryMultiplier * 100) / 100);
}

function generateFallbackSummary(score: number, name: string): string {
  if (score < 30)
    return `${name} hat erhebliche Schwächen im Web-Auftritt. Die Website bietet wenig Orientierung, fehlende Conversion-Elemente und wirkt technisch veraltet. Klares Optimierungspotenzial vorhanden.`;
  if (score < 55)
    return `${name} hat einen soliden, aber ausbaufähigen Web-Auftritt. Mehrere Bereiche bieten deutliches Verbesserungspotenzial, insbesondere bei Conversion und Vertrauensaufbau.`;
  return `${name} hat einen gut gepflegten Web-Auftritt. Nur geringes Verbesserungspotenzial identifiziert.`;
}
