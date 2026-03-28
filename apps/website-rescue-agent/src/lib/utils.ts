import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { LeadStatus } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Score-Utilities ──────────────────────────────────────────────────────────

export function scoreToLabel(score: number): string {
  if (score >= 80) return "Sehr gut";
  if (score >= 60) return "Gut";
  if (score >= 40) return "Mittel";
  if (score >= 20) return "Schwach";
  return "Kritisch";
}

export function scoreToColor(score: number): string {
  if (score >= 80) return "score-excellent";
  if (score >= 60) return "score-good";
  if (score >= 40) return "score-medium";
  if (score >= 20) return "score-low";
  return "score-critical";
}

export function scoreToHex(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#22c55e";
  if (score >= 40) return "#eab308";
  if (score >= 20) return "#f97316";
  return "#ef4444";
}

// ─── Status-Utilities ─────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Neu",
  QUEUED_FOR_CRAWL: "Crawl geplant",
  CRAWLED: "Gecrawlt",
  ANALYZED: "Analysiert",
  QUALIFIED: "Qualifiziert",
  DISQUALIFIED: "Ausgeschlossen",
  SITE_GENERATED: "Demo erstellt",
  IN_REVIEW: "In Prüfung",
  APPROVED_FOR_OUTREACH: "Freigegeben",
  OUTREACH_DRAFT_READY: "Entwurf bereit",
  SENT: "Gesendet",
  RESPONDED: "Geantwortet",
  WON: "Gewonnen",
  LOST: "Verloren",
};

export const STATUS_COLORS: Record<
  LeadStatus,
  "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
> = {
  NEW: "default",
  QUEUED_FOR_CRAWL: "secondary",
  CRAWLED: "secondary",
  ANALYZED: "secondary",
  QUALIFIED: "success",
  DISQUALIFIED: "destructive",
  SITE_GENERATED: "success",
  IN_REVIEW: "warning",
  APPROVED_FOR_OUTREACH: "success",
  OUTREACH_DRAFT_READY: "success",
  SENT: "default",
  RESPONDED: "success",
  WON: "success",
  LOST: "destructive",
};

export const PIPELINE_STAGES: LeadStatus[] = [
  "NEW",
  "QUEUED_FOR_CRAWL",
  "CRAWLED",
  "ANALYZED",
  "QUALIFIED",
  "SITE_GENERATED",
  "IN_REVIEW",
  "APPROVED_FOR_OUTREACH",
  "OUTREACH_DRAFT_READY",
  "SENT",
  "RESPONDED",
  "WON",
];

// ─── Domain-Utilities ─────────────────────────────────────────────────────────

export function extractDomain(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
  }
}

export function normalizeUrl(url: string): string {
  if (!url) return "";
  if (!url.startsWith("http")) return `https://${url}`;
  return url;
}

// ─── Format-Utilities ─────────────────────────────────────────────────────────

export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelative(date: Date | string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "gerade eben";
  if (minutes < 60) return `vor ${minutes} Min.`;
  if (hours < 24) return `vor ${hours} Std.`;
  if (days < 7) return `vor ${days} Tag${days > 1 ? "en" : ""}`;
  return formatDate(d);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

// ─── Suchgebiet ───────────────────────────────────────────────────────────────

export const GERMAN_STATES: Record<string, string> = {
  "DE-BB": "Brandenburg",
  "DE-BE": "Berlin",
  "DE-BW": "Baden-Württemberg",
  "DE-BY": "Bayern",
  "DE-HB": "Bremen",
  "DE-HE": "Hessen",
  "DE-HH": "Hamburg",
  "DE-MV": "Mecklenburg-Vorpommern",
  "DE-NI": "Niedersachsen",
  "DE-NW": "Nordrhein-Westfalen",
  "DE-RP": "Rheinland-Pfalz",
  "DE-SH": "Schleswig-Holstein",
  "DE-SL": "Saarland",
  "DE-SN": "Sachsen",
  "DE-ST": "Sachsen-Anhalt",
  "DE-TH": "Thüringen",
};

// ─── Branchen ─────────────────────────────────────────────────────────────────

export const INDUSTRIES: Record<string, string> = {
  handwerk: "Handwerk",
  immobilien: "Immobilienmakler",
  kanzlei: "Kanzleien / Rechtsanwälte",
  arztpraxis: "Arztpraxen / Gesundheit",
  dienstleister: "Lokale Dienstleister",
  agentur: "Agenturen",
  berater: "Berater / Coaches",
  gastronomie: "Gastronomie",
  einzelhandel: "Einzelhandel",
  logistik: "Logistik / Transport",
  bildung: "Bildung / Kurse",
  kosmetik: "Kosmetik / Beauty",
  fitness: "Fitness / Sport",
  other: "Sonstige",
};
