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

// ═══════════════════════════════════════════════════════════════════════════════
// Conversation / Follow-up / Reply Management Types (MVP)
// Manuelle Definition da Prisma-Generate durch Windows-Dateisperre blockiert ist
// ═══════════════════════════════════════════════════════════════════════════════

export interface Conversation {
  id: string;
  companyId: string;
  initialOutreachId: string | null;
  status: ConversationStatus;
  currentSentiment: ReplySentiment | null;
  firstSentAt: Date;
  lastContactAt: Date;
  replyReceivedAt: Date | null;
  followUpCount: number;
  nextFollowUpDueAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations (optional, je nach Query)
  replies?: Reply[];
  followUps?: FollowUp[];
}

export interface Reply {
  id: string;
  conversationId: string;
  sentiment: ReplySentiment;
  content: string | null;
  notes: string | null;
  receivedAt: Date;
  createdBy: string;
  createdAt: Date;
}

export interface FollowUp {
  id: string;
  conversationId: string;
  sequenceNumber: number;
  status: FollowUpStatus;
  outreachDraftId: string | null;
  sentAt: Date | null;
  dueAt: Date;
  createdAt: Date;
}

// Enums als Konstanten-Objekte (für Verwendung als Werte)
// SQLite hat keine nativen Enums, daher werden diese als Strings gespeichert

export const LeadStatus = {
  NEW: "NEW",
  QUEUED_FOR_CRAWL: "QUEUED_FOR_CRAWL",
  CRAWLED: "CRAWLED",
  ANALYZED: "ANALYZED",
  QUALIFIED: "QUALIFIED",
  DISQUALIFIED: "DISQUALIFIED",
  SITE_GENERATED: "SITE_GENERATED",
  IN_REVIEW: "IN_REVIEW",
  APPROVED_FOR_OUTREACH: "APPROVED_FOR_OUTREACH",
  OUTREACH_DRAFT_READY: "OUTREACH_DRAFT_READY",
  SENT: "SENT",
  RESPONDED: "RESPONDED",
  WON: "WON",
  LOST: "LOST",
} as const;
export type LeadStatus = typeof LeadStatus[keyof typeof LeadStatus];

export const JobStatus = {
  PENDING: "PENDING",
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  SKIPPED: "SKIPPED",
} as const;
export type JobStatus = typeof JobStatus[keyof typeof JobStatus];

export const PageType = {
  HOME: "HOME",
  SERVICES: "SERVICES",
  ABOUT: "ABOUT",
  CONTACT: "CONTACT",
  REFERENCES: "REFERENCES",
  IMPRINT: "IMPRINT",
  CAREER: "CAREER",
  OTHER: "OTHER",
} as const;
export type PageType = typeof PageType[keyof typeof PageType];

export const SiteStyle = {
  SERIOUS_CONSERVATIVE: "SERIOUS_CONSERVATIVE",
  MODERN_PREMIUM: "MODERN_PREMIUM",
  LOCAL_APPROACHABLE: "LOCAL_APPROACHABLE",
  PERFORMANCE_CONVERSION: "PERFORMANCE_CONVERSION",
} as const;
export type SiteStyle = typeof SiteStyle[keyof typeof SiteStyle];

export const GenerationStatus = {
  PENDING: "PENDING",
  GENERATING: "GENERATING",
  GENERATED: "GENERATED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
export type GenerationStatus = typeof GenerationStatus[keyof typeof GenerationStatus];

export const OutreachType = {
  EMAIL_SHORT: "EMAIL_SHORT",
  EMAIL_LONG: "EMAIL_LONG",
  CONTACT_FORM: "CONTACT_FORM",
  LINKEDIN: "LINKEDIN",
  FOLLOW_UP: "FOLLOW_UP",
  OBJECTION_RESPONSE: "OBJECTION_RESPONSE",
} as const;
export type OutreachType = typeof OutreachType[keyof typeof OutreachType];

export const OutreachStatus = {
  DRAFT: "DRAFT",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SENT: "SENT",
  BOUNCED: "BOUNCED",
  REPLIED: "REPLIED",
} as const;
export type OutreachStatus = typeof OutreachStatus[keyof typeof OutreachStatus];

export const SearchScope = {
  NATIONWIDE: "NATIONWIDE",
  BY_STATE: "BY_STATE",
  BY_CITY: "BY_CITY",
  BY_RADIUS: "BY_RADIUS",
} as const;
export type SearchScope = typeof SearchScope[keyof typeof SearchScope];

export const OfferTier = {
  SMALL: "SMALL",
  MEDIUM: "MEDIUM",
  PREMIUM: "PREMIUM",
} as const;
export type OfferTier = typeof OfferTier[keyof typeof OfferTier];

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

// ─── Audit/Timeline Event-Typen ───────────────────────────────────────────────

export const AuditEventType = {
  SYSTEM: "SYSTEM",
  WORKFLOW: "WORKFLOW",
  QUALIFICATION: "QUALIFICATION",
  DEMO: "DEMO",
  OUTREACH: "OUTREACH",
  SEND: "SEND",
  ERROR: "ERROR",
} as const;
export type AuditEventType = typeof AuditEventType[keyof typeof AuditEventType];

export const AuditAction = {
  // System
  "system.job_started": "system.job_started",
  "system.job_completed": "system.job_completed",
  "system.job_failed": "system.job_failed",
  "system.error": "system.error",
  
  // Workflow
  "workflow.crawl_started": "workflow.crawl_started",
  "workflow.crawl_completed": "workflow.crawl_completed",
  "workflow.analysis_started": "workflow.analysis_started",
  "workflow.analysis_completed": "workflow.analysis_completed",
  "workflow.status_changed": "workflow.status_changed",
  
  // Qualification
  "qualification.qualified": "qualification.qualified",
  "qualification.disqualified": "qualification.disqualified",
  "qualification.auto_qualified": "qualification.auto_qualified",
  
  // Demo
  "demo.generation_started": "demo.generation_started",
  "demo.generation_completed": "demo.generation_completed",
  "demo.generation_failed": "demo.generation_failed",
  "demo.regenerated": "demo.regenerated",
  "demo.approved": "demo.approved",
  "demo.rejected": "demo.rejected",
  
  // Outreach
  "outreach.draft_created": "outreach.draft_created",
  "outreach.edited": "outreach.edited",
  "outreach.approved": "outreach.approved",
  "outreach.rejected": "outreach.rejected",
  "outreach.sent": "outreach.sent",
  "outreach.bounced": "outreach.bounced",
  "outreach.replied": "outreach.replied",
  "outread.opened": "outreach.opened",
} as const;
export type AuditAction = typeof AuditAction[keyof typeof AuditAction];

export const Severity = {
  INFO: "INFO",
  WARNING: "WARNING",
  ERROR: "ERROR",
  CRITICAL: "CRITICAL",
} as const;
export type Severity = typeof Severity[keyof typeof Severity];

export interface TimelineEvent {
  id: string;
  eventType: AuditEventType;
  action: AuditAction | string;
  title: string;
  description?: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
  isSystem: boolean;
  severity?: Severity;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export interface EditHistoryEntry {
  at: string;
  by: string;
  field: string;
  oldVal?: string;
  newVal?: string;
}

// ─── Timeline Filter ──────────────────────────────────────────────────────────

export interface TimelineFilter {
  eventTypes?: AuditEventType[];
  severity?: Severity[];
  dateFrom?: Date;
  dateTo?: Date;
  userId?: string;
  includeSystem?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Conversation / Follow-up / Reply Management Types (MVP)
// ═══════════════════════════════════════════════════════════════════════════════

export const ReplySentiment = {
  POSITIVE: "POSITIVE",
  NEUTRAL: "NEUTRAL",
  NEGATIVE: "NEGATIVE",
  SPAM: "SPAM",
} as const;
export type ReplySentiment = typeof ReplySentiment[keyof typeof ReplySentiment];

export const ConversationStatus = {
  PENDING: "PENDING",
  REPLIED: "REPLIED",
  FOLLOW_UP_SENT: "FOLLOW_UP_SENT",
  CLOSED_WON: "CLOSED_WON",
  CLOSED_LOST: "CLOSED_LOST",
  NO_REPLY_CLOSED: "NO_REPLY_CLOSED",
} as const;
export type ConversationStatus = typeof ConversationStatus[keyof typeof ConversationStatus];

export const FollowUpStatus = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  CANCELLED: "CANCELLED",
} as const;
export type FollowUpStatus = typeof FollowUpStatus[keyof typeof FollowUpStatus];

// Aktive Conversation-Status (für Prüfung auf existierende aktive Conversation)
export const ACTIVE_CONVERSATION_STATUSES: ConversationStatus[] = [
  ConversationStatus.PENDING,
  ConversationStatus.REPLIED,
  ConversationStatus.FOLLOW_UP_SENT,
];

// Interface für Reply-Daten
export interface ReplyData {
  sentiment: ReplySentiment;
  content?: string;
  notes?: string;
  createdBy: string;
}

// Interface für Follow-up-Daten
export interface FollowUpData {
  sequenceNumber: number;
  dueAt: Date;
  outreachDraftId?: string;
}

// Interface für Conversation-Filter
export interface ConversationFilter {
  status?: ConversationStatus;
  companyId?: string;
  hasReply?: boolean;
  followUpDue?: boolean;
  overdue?: boolean;
}
