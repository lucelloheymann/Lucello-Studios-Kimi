// Zentrale Typen für Website Rescue Agent
// Prisma-Enums und erweiterte App-Typen

export type {
  Company,
  Contact,
  Crawl,
  Page,
  Analysis,
  CompetitorSnapshot,
  GeneratedSite,
  OutreachDraft,
  PipelineState,
  FollowUpTask,
  AuditLog,
  Artifact,
  SearchConfiguration,
  IndustryTemplate,
  OfferTemplate,
  OutreachTemplate,
  JobRecord,
} from "@prisma/client";

export {
  LeadStatus,
  JobStatus,
  PageType,
  SiteStyle,
  GenerationStatus,
  OutreachType,
  OutreachStatus,
  SearchScope,
  OfferTier,
} from "@prisma/client";

// ─── Analyse-Typen ─────────────────────────────────────────────────────────────

export interface ScoreDimension {
  score: number; // 0–100
  reason: string;
  observations: string[];
  confidence: number; // 0–1
}

export interface ScoreCard {
  overall: number;
  dimensions: {
    design: ScoreDimension;
    clarity: ScoreDimension;
    conversion: ScoreDimension;
    trust: ScoreDimension;
    ux: ScoreDimension;
    mobile: ScoreDimension;
    seo: ScoreDimension;
    performance: ScoreDimension;
    modernity: ScoreDimension;
  };
  confidence: number;
}

export interface Finding {
  category: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  recommendation?: string;
}

export interface Opportunity {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
}

export interface AnalysisResult {
  scoreCard: ScoreCard;
  executiveSummary: string;
  strengths: string[];
  weaknesses: string[];
  quickWins: string[];
  opportunities: Opportunity[];
  findings: Finding[];
  isQualified: boolean;
  qualificationReason: string;
  opportunityScore: number;
  buyingProbability: number;
}

// ─── Heuristik-Typen ──────────────────────────────────────────────────────────

export interface HeuristicCheck {
  id: string;
  name: string;
  category: keyof ScoreCard["dimensions"];
  weight: number;
  passed: boolean;
  score: number;
  reason: string;
}

export interface HeuristicResult {
  checks: HeuristicCheck[];
  dimensionScores: Record<string, number>;
  overallScore: number;
}

// ─── Demo-Website-Typen ───────────────────────────────────────────────────────

export interface SiteSection {
  id: string;
  type:
    | "hero"
    | "value_proposition"
    | "services"
    | "differentiators"
    | "trust"
    | "about"
    | "process"
    | "faq"
    | "cta"
    | "footer";
  title?: string;
  content: Record<string, unknown>;
  hasPlaceholders: boolean;
  placeholderFields?: string[];
}

export interface GeneratedSiteContent {
  meta: {
    title: string;
    description: string;
    style: string;
    industry: string;
    generatedAt: string;
  };
  sections: SiteSection[];
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

// ─── Outreach-Typen ──────────────────────────────────────────────────────────

export interface RedFlag {
  type:
    | "unverified_claim"
    | "placeholder"
    | "sensitive_info"
    | "duplicate_risk"
    | "low_confidence";
  description: string;
  severity: "blocking" | "warning";
}

export interface OutreachContent {
  subject: string;
  body: string;
  redFlags: RedFlag[];
  hasUnreviewedPlaceholders: boolean;
  isBlockedForSend: boolean;
  blockReason?: string;
}

// ─── Dashboard-Typen ─────────────────────────────────────────────────────────

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  sitesGenerated: number;
  pendingReview: number;
  outreachReady: number;
  sent: number;
  responded: number;
  won: number;
  conversionRate: number;
  avgScore: number | null;
  topIndustries: { industry: string; count: number }[];
  recentActivity: ActivityItem[];
  pipelineFunnel: FunnelStage[];
}

export interface ActivityItem {
  id: string;
  type: string;
  companyName: string;
  companyId: string;
  description: string;
  timestamp: Date;
}

export interface FunnelStage {
  status: string;
  label: string;
  count: number;
  percentage: number;
}

// ─── API-Typen ─────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LeadFilters {
  status?: string[];
  industry?: string[];
  state?: string[];
  minScore?: number;
  maxScore?: number;
  isQualified?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ─── Job-Typen ────────────────────────────────────────────────────────────────

export interface JobPayload {
  companyId: string;
  [key: string]: unknown;
}

export type QueueName =
  | "crawl"
  | "analyze"
  | "generate-site"
  | "generate-outreach"
  | "qualify"
  | "compare-competitors"
  | "send-outreach";
