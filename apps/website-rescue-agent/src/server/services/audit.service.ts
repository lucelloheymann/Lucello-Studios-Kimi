// Audit-Service: Zentrale, konsistente Event-Protokollierung
// Für Timeline, Verlauf, Fehler-Tracking und Compliance

import { db } from "@/lib/db";
import { AuditEventType, AuditAction, Severity, TimelineEvent } from "@/types";

interface LogEventParams {
  companyId: string;
  eventType: AuditEventType;
  action: AuditAction | string;
  title: string;
  description?: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  isSystem?: boolean;
  severity?: Severity;
  metadata?: Record<string, unknown>;
}

/**
 * Zentrale Methode zum Loggen eines Events
 */
export async function logEvent(params: LogEventParams): Promise<void> {
  await db.auditLog.create({
    data: {
      companyId: params.companyId,
      eventType: params.eventType,
      action: params.action,
      title: params.title,
      description: params.description,
      entityType: params.entityType,
      entityId: params.entityId,
      userId: params.userId,
      isSystem: params.isSystem ?? false,
      severity: params.severity ?? Severity.INFO,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  });
}

// ─── Workflow Events ──────────────────────────────────────────────────────────

export async function logCrawlStarted(companyId: string, userId?: string): Promise<void> {
  await logEvent({
    companyId,
    eventType: AuditEventType.WORKFLOW,
    action: AuditAction["workflow.crawl_started"],
    title: "Website-Crawl gestartet",
    description: "Die Website wird gescannt und analysiert",
    entityType: "Company",
    entityId: companyId,
    userId,
    isSystem: !userId,
  });
}

export async function logCrawlCompleted(
  companyId: string,
  pageCount: number,
  userId?: string
): Promise<void> {
  await logEvent({
    companyId,
    eventType: AuditEventType.WORKFLOW,
    action: AuditAction["workflow.crawl_completed"],
    title: "Crawl abgeschlossen",
    description: `${pageCount} Seiten erfolgreich gescannt`,
    entityType: "Crawl",
    userId,
    isSystem: !userId,
    metadata: { pageCount },
  });
}

export async function logCrawlFailed(
  companyId: string,
  error: string,
  userId?: string
): Promise<void> {
  await logEvent({
    companyId,
    eventType: AuditEventType.ERROR,
    action: AuditAction["system.job_failed"],
    title: "Crawl fehlgeschlagen",
    description: error,
    entityType: "Crawl",
    userId,
    isSystem: !userId,
    severity: Severity.ERROR,
    metadata: { error },
  });
}

export async function logAnalysisStarted(companyId: string, userId?: string): Promise<void> {
  await logEvent({
    companyId,
    eventType: AuditEventType.WORKFLOW,
    action: AuditAction["workflow.analysis_started"],
    title: "KI-Analyse gestartet",
    description: "9-dimensionale Website-Analyse wird durchgeführt",
    entityType: "Analysis",
    userId,
    isSystem: !userId,
  });
}

export async function logAnalysisCompleted(
  companyId: string,
  score: number,
  isQualified: boolean,
  userId?: string
): Promise<void> {
  await logEvent({
    companyId,
    eventType: AuditEventType.WORKFLOW,
    action: AuditAction["workflow.analysis_completed"],
    title: "Analyse abgeschlossen",
    description: `Gesamtscore: ${Math.round(score)}/100 — Lead ${isQualified ? "qualifiziert" : "nicht qualifiziert"}`,
    entityType: "Analysis",
    userId,
    isSystem: !userId,
    metadata: { score, isQualified },
  });
}

export async function logStatusChanged(
  companyId: string,
  fromStatus: string,
  toStatus: string,
  reason?: string,
  userId?: string
): Promise<void> {
  await logEvent({
    companyId,
    eventType: AuditEventType.WORKFLOW,
    action: AuditAction["workflow.status_changed"],
    title: "Status geändert",
    description: reason || `${fromStatus} → ${toStatus}`,
    entityType: "Company",
    userId,
    isSystem: !userId,
    metadata: { fromStatus, toStatus, reason },
  });
}

// ─── Qualification Events ─────────────────────────────────────────────────────

export async function logQualified(
  companyId: string,
  score: number,
  auto: boolean,
  userId?: string
): Promise<void> {
  await logEvent({
    companyId,
    eventType: AuditEventType.QUALIFICATION,
    action: auto ? AuditAction["qualification.auto_qualified"] : AuditAction["qualification.qualified"],
    title: auto ? "Automatisch qualifiziert" : "Lead qualifiziert",
    description: `Score ${Math.round(score)}/100 — Für Relaunch-Pitch freigegeben`,
    entityType: "Company",
    userId,
    isSystem: auto,
    metadata: { score, auto },
  });
}

export async function logDisqualified(
  companyId: string,
  reason: string,
  userId?: string
): Promise<void> {
  await logEvent({
    companyId,
    eventType: AuditEventType.QUALIFICATION,
    action: AuditAction["qualification.disqualified"],
    title: "Lead disqualifiziert",
    description: reason,
    entityType: "Company",
    userId,
    isSystem: !userId,
    severity: Severity.WARNING,
    metadata: { reason },
  });
}

// ─── Demo/GeneratedSite Events ────────────────────────────────────────────────

export async function logDemoGenerationStarted(
  companyId: string,
  style: string,
  userId?: string
): Promise<void> {
  await logEvent({
    companyId,
    eventType: AuditEventType.DEMO,
    action: AuditAction["demo.generation_started"],
    title: "Demo-Erstellung gestartet",
    description: `Stil: ${style.replace(/_/g, " ")}`,
    entityType: "GeneratedSite",
    userId,
    isSystem: !userId,
    metadata: { style },
  });
}

export async function logDemoGenerationCompleted(
  companyId: string,
  siteId: string,
  hasPlaceholders: boolean,
  userId?: string
): Promise<void> {
  await logEvent({
    companyId,
    eventType: AuditEventType.DEMO,
    action: AuditAction["demo.generation_completed"],
    title: "Demo-Website erstellt",
    description: hasPlaceholders
      ? "Demo enthält Platzhalter — vor Versand prüfen"
      : "Demo bereit zur Verwendung",
    entityType: "GeneratedSite",
    entityId: siteId,
    userId,
    isSystem: !userId,
    severity: hasPlaceholders ? Severity.WARNING : Severity.INFO,
    metadata: { siteId, hasPlaceholders },
  });
}

export async function logDemoGenerationFailed(
  companyId: string,
  error: string,
  userId?: string
): Promise<void> {
  await logEvent({
    companyId,
    eventType: AuditEventType.ERROR,
    action: AuditAction["demo.generation_failed"],
    title: "Demo-Erstellung fehlgeschlagen",
    description: error,
    entityType: "GeneratedSite",
    userId,
    isSystem: !userId,
    severity: Severity.ERROR,
    metadata: { error },
  });
}

export async function logDemoRegenerated(
  companyId: string,
  siteId: string,
  reason: string,
  userId: string
): Promise<void> {
  await logEvent({
    companyId,
    eventType: AuditEventType.DEMO,
    action: AuditAction["demo.regenerated"],
    title: "Demo neu generiert",
    description: reason,
    entityType: "GeneratedSite",
    entityId: siteId,
    userId,
    metadata: { siteId, reason },
  });
}

// ─── Outreach Events ──────────────────────────────────────────────────────────

export async function logOutreachDraftCreated(
  companyId: string,
  draftId: string,
  type: string,
  userId?: string
): Promise<void> {
  await logEvent({
    companyId,
    eventType: AuditEventType.OUTREACH,
    action: AuditAction["outreach.draft_created"],
    title: "Outreach-Entwurf erstellt",
    description: `Typ: ${type.replace(/_/g, " ")}`,
    entityType: "OutreachDraft",
    entityId: draftId,
    userId,
    isSystem: !userId,
    metadata: { draftId, type },
  });
}

export async function logOutreachEdited(
  companyId: string,
  draftId: string,
  fields: string[],
  userId: string
): Promise<void> {
  await logEvent({
    companyId,
    eventType: AuditEventType.OUTREACH,
    action: AuditAction["outreach.edited"],
    title: "Outreach bearbeitet",
    description: `Geändert: ${fields.join(", ")}`,
    entityType: "OutreachDraft",
    entityId: draftId,
    userId,
    metadata: { draftId, fields },
  });
}

export async function logOutreachApproved(
  companyId: string,
  draftId: string,
  userId: string,
  notes?: string
): Promise<void> {
  await logEvent({
    companyId,
    eventType: AuditEventType.OUTREACH,
    action: AuditAction["outreach.approved"],
    title: "Outreach freigegeben",
    description: notes || "Zur Versand freigegeben",
    entityType: "OutreachDraft",
    entityId: draftId,
    userId,
    metadata: { draftId, notes },
  });
}

export async function logOutreachRejected(
  companyId: string,
  draftId: string,
  reason: string,
  userId: string
): Promise<void> {
  await logEvent({
    companyId,
    eventType: AuditEventType.OUTREACH,
    action: AuditAction["outreach.rejected"],
    title: "Outreach abgelehnt",
    description: reason,
    entityType: "OutreachDraft",
    entityId: draftId,
    userId,
    severity: Severity.WARNING,
    metadata: { draftId, reason },
  });
}

export async function logOutreachSent(
  companyId: string,
  draftId: string,
  recipientEmail: string,
  userId: string
): Promise<void> {
  await logEvent({
    companyId,
    eventType: AuditEventType.SEND,
    action: AuditAction["outreach.sent"],
    title: "Outreach versendet",
    description: `An: ${recipientEmail}`,
    entityType: "OutreachDraft",
    entityId: draftId,
    userId,
    metadata: { draftId, recipientEmail },
  });
}

export async function logOutreachReplied(
  companyId: string,
  draftId: string,
  userId?: string
): Promise<void> {
  await logEvent({
    companyId,
    eventType: AuditEventType.SEND,
    action: AuditAction["outreach.replied"],
    title: "Antwort erhalten",
    description: "Der Empfänger hat auf die Nachricht geantwortet",
    entityType: "OutreachDraft",
    entityId: draftId,
    userId,
    isSystem: !userId,
    metadata: { draftId },
  });
}

// ─── Timeline Abfragen ────────────────────────────────────────────────────────

export interface GetTimelineOptions {
  companyId: string;
  eventTypes?: AuditEventType[];
  limit?: number;
  offset?: number;
}

export async function getTimeline(options: GetTimelineOptions): Promise<TimelineEvent[]> {
  const logs = await db.auditLog.findMany({
    where: {
      companyId: options.companyId,
      ...(options.eventTypes?.length ? { eventType: { in: options.eventTypes } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: options.limit ?? 50,
    skip: options.offset ?? 0,
  });

  return logs.map((log) => ({
    id: log.id,
    eventType: log.eventType as AuditEventType,
    action: log.action,
    title: log.title || log.action,
    description: log.description || undefined,
    timestamp: log.createdAt,
    userId: log.userId || undefined,
    isSystem: log.isSystem,
    severity: (log.severity as Severity) || undefined,
    entityType: log.entityType || undefined,
    entityId: log.entityId || undefined,
    metadata: log.metadata ? JSON.parse(log.metadata) : undefined,
  }));
}

/**
 * Aggregierte Statistik für Dashboard
 */
export async function getRecentActivity(limit: number = 10): Promise<TimelineEvent[]> {
  const logs = await db.auditLog.findMany({
    where: {
      eventType: {
        in: [AuditEventType.WORKFLOW, AuditEventType.OUTREACH, AuditEventType.SEND],
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { company: { select: { name: true } } },
  });

  return logs.map((log) => ({
    id: log.id,
    eventType: log.eventType as AuditEventType,
    action: log.action,
    title: log.title || log.action,
    description: log.description || undefined,
    timestamp: log.createdAt,
    userId: log.userId || undefined,
    isSystem: log.isSystem,
    severity: (log.severity as Severity) || undefined,
    entityType: log.entityType || undefined,
    entityId: log.entityId || undefined,
    metadata: log.metadata ? JSON.parse(log.metadata) : undefined,
  }));
}
