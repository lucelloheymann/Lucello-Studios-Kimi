import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { LeadStatus, ACTIVE_CONVERSATION_STATUSES, ReplySentiment } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last3Days = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  const [
    // ─── BASIS-KPIS ─────────────────────────────────────────────────────
    totalLeads,
    statusCounts,
    avgScore,
    topIndustries,
    recentLeads,
    
    // ─── OPERATIONAL: WORKFLOW-WARTELISTEN ──────────────────────────────
    // Crawl fehlt
    waitingCrawl,
    waitingCrawlCount,
    
    // Analyse fehlt
    waitingAnalysis,
    waitingAnalysisCount,
    
    // Demo fehlt (qualifiziert aber keine Demo)
    readyForDemo,
    readyForDemoCount,
    
    // Outreach fehlt (Demo erstellt aber kein Outreach)
    readyForOutreach,
    readyForOutreachCount,
    
    // ─── OPERATIONAL: FREIGABEN & REVIEWS ───────────────────────────────
    // Freigabe offen ( Outreach-Entwürfe bereit zur Freigabe)
    needsApproval,
    needsApprovalCount,
    
    // Mit Platzhaltern (müssen vor Freigabe geprüft werden)
    hasPlaceholders,
    hasPlaceholdersCount,
    
    // ─── OPERATIONAL: BLOCKIERT & FEHLER ────────────────────────────────
    // Blockiert für Versand
    blockedOutreach,
    blockedOutreachCount,
    
    // Fehlgeschlagene Crawls
    failedCrawls,
    failedCrawlsCount,
    
    // Fehlgeschlagene Analysen
    failedAnalyses,
    failedAnalysesCount,
    
    // Fehlgeschlagene Demos (REJECTED oder ERROR)
    failedDemos,
    failedDemosCount,
    
    // ─── OPERATIONAL: KONTAKT-LÜCKEN ────────────────────────────────────
    // Leads ohne Kontaktdaten (Email oder Contacts)
    missingContacts,
    missingContactsCount,
    
    // Qualifizierte ohne Kontaktdaten (hohe Priorität!)
    qualifiedMissingContacts,
    qualifiedMissingContactsCount,
    
    // ─── OPERATIONAL: "STUCK" LEADS (verwaiste/veraltete) ───────────────
    // Qualifiziert aber seit 7 Tagen keine Demo
    stuckQualifiedNoDemo,
    
    // Demo erstellt aber seit 3 Tagen kein Outreach
    stuckDemoNoOutreach,
    
    // ─── OUTREACH STATS ─────────────────────────────────────────────────
    outreachDraftCount,
    approvedOutreachCount,
    sentOutreachCount,
    repliedOutreachCount,
    
    // ─── AUDIT & AKTIVITÄT ──────────────────────────────────────────────
    // Letzte 24h Aktivitäten
    recentActivity,
    
    // Neue Leads (letzte 24h)
    newLeads24h,
    
    // Neue Freigaben (letzte 24h)
    newApprovals24h,
    
    // Neue Blockierungen (letzte 24h)
    newBlocks24h,
    
    // ─── HIGH-VALUE LEADS (Opportunity Score) ───────────────────────────
    highValueLeads,
    
    // ─── CONVERSATION STATS ─────────────────────────────────────────────
    // Antworten heute
    repliesToday,
    // Antworten letzte 7 Tage
    repliesLast7Days,
    // Heute fällige Follow-ups
    followUpsDueToday,
    // Überfällige Follow-ups
    overdueFollowUps,
    // Offene Konversationen
    openConversations,
    // Positive Replies
    positiveReplies,
    // Dringende Follow-ups (Liste)
    urgentFollowUps,
    
  ] = await Promise.all([
    // ─── BASIS ──────────────────────────────────────────────────────────
    db.company.count({ where: { isBlacklisted: false } }),
    
    db.company.groupBy({
      by: ["status"],
      _count: { status: true },
      where: { isBlacklisted: false },
    }),
    
    db.analysis.aggregate({
      _avg: { overallScore: true, opportunityScore: true },
      where: { status: "COMPLETED" },
    }),
    
    db.company.groupBy({
      by: ["industry"],
      _count: { industry: true },
      where: { isBlacklisted: false, industry: { not: null } },
      orderBy: { _count: { industry: "desc" } },
      take: 5,
    }),
    
    db.company.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      where: { isBlacklisted: false },
      include: { 
        analyses: { orderBy: { createdAt: "desc" }, take: 1 },
        generatedSites: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    
    // ─── WORKFLOW-WARTELISTEN ───────────────────────────────────────────
    // Crawl fehlt
    db.company.findMany({
      where: { isBlacklisted: false, status: "NEW" },
      orderBy: { createdAt: "asc" },
      take: 5,
      select: { id: true, name: true, domain: true, createdAt: true },
    }),
    db.company.count({ where: { isBlacklisted: false, status: "NEW" } }),
    
    // Analyse fehlt
    db.company.findMany({
      where: { isBlacklisted: false, status: "CRAWLED" },
      orderBy: { updatedAt: "asc" },
      take: 5,
      select: { id: true, name: true, domain: true, updatedAt: true },
    }),
    db.company.count({ where: { isBlacklisted: false, status: "CRAWLED" } }),
    
    // Demo fehlt (QUALIFIED)
    db.company.findMany({
      where: { isBlacklisted: false, status: "QUALIFIED", isQualified: true },
      include: { 
        analyses: { orderBy: { createdAt: "desc" }, take: 1, select: { overallScore: true, opportunityScore: true } },
        generatedSites: { where: { status: { in: ["GENERATED", "APPROVED"] } }, take: 1, select: { id: true } },
      },
      orderBy: [{ opportunityScore: "desc" }, { updatedAt: "asc" }],
      take: 5,
    }).then(leads => leads.filter(l => l.generatedSites.length === 0)),
    db.company.count({ where: { isBlacklisted: false, status: "QUALIFIED", isQualified: true } }),
    
    // Outreach fehlt (SITE_GENERATED aber kein Outreach-Draft)
    db.company.findMany({
      where: { isBlacklisted: false, status: "SITE_GENERATED" },
      include: { 
        analyses: { orderBy: { createdAt: "desc" }, take: 1, select: { overallScore: true } },
        outreachDrafts: { where: { status: { in: ["DRAFT", "APPROVED", "SENT"] } }, take: 1, select: { id: true } },
      },
      orderBy: { updatedAt: "asc" },
      take: 5,
    }).then(leads => leads.filter(l => l.outreachDrafts.length === 0)),
    db.company.count({ where: { isBlacklisted: false, status: "SITE_GENERATED" } }),
    
    // ─── FREIGABEN & REVIEWS ────────────────────────────────────────────
    // Freigabe offen (DRAFT, nicht blockiert, keine Platzhalter)
    db.outreachDraft.findMany({
      where: { 
        status: "DRAFT", 
        isBlockedForSend: false, 
        hasUnreviewedPlaceholders: false 
      },
      include: { company: { select: { name: true, id: true, domain: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.outreachDraft.count({ 
      where: { status: "DRAFT", isBlockedForSend: false, hasUnreviewedPlaceholders: false } 
    }),
    
    // Mit Platzhaltern
    db.outreachDraft.findMany({
      where: { status: "DRAFT", hasUnreviewedPlaceholders: true },
      include: { company: { select: { name: true, id: true, domain: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.outreachDraft.count({ where: { status: "DRAFT", hasUnreviewedPlaceholders: true } }),
    
    // ─── BLOCKIERT & FEHLER ─────────────────────────────────────────────
    // Blockiert
    db.outreachDraft.findMany({
      where: { status: "DRAFT", isBlockedForSend: true },
      include: { company: { select: { name: true, id: true, domain: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.outreachDraft.count({ where: { status: "DRAFT", isBlockedForSend: true } }),
    
    // Fehlgeschlagene Crawls
    db.crawl.findMany({
      where: { status: "FAILED" },
      include: { company: { select: { id: true, name: true, domain: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.crawl.count({ where: { status: "FAILED" } }),
    
    // Fehlgeschlagene Analysen
    db.analysis.findMany({
      where: { status: "FAILED" },
      include: { company: { select: { id: true, name: true, domain: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.analysis.count({ where: { status: "FAILED" } }),
    
    // Fehlgeschlagene Demos
    db.generatedSite.findMany({
      where: { status: { in: ["REJECTED", "ERROR"] } },
      include: { company: { select: { id: true, name: true, domain: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.generatedSite.count({ where: { status: { in: ["REJECTED", "ERROR"] } } }),
    
    // ─── KONTAKT-LÜCKEN ─────────────────────────────────────────────────
    // Alle ohne Kontaktdaten
    db.company.findMany({
      where: {
        isBlacklisted: false,
        status: { in: ["CRAWLED", "ANALYZED", "QUALIFIED", "SITE_GENERATED", "OUTREACH_DRAFT_READY"] },
        email: null,
        contacts: { none: {} },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, name: true, domain: true, status: true },
    }),
    db.company.count({
      where: {
        isBlacklisted: false,
        status: { in: ["CRAWLED", "ANALYZED", "QUALIFIED", "SITE_GENERATED", "OUTREACH_DRAFT_READY"] },
        email: null,
        contacts: { none: {} },
      },
    }),
    
    // Qualifizierte ohne Kontaktdaten (hohe Priorität)
    db.company.findMany({
      where: {
        isBlacklisted: false,
        status: "QUALIFIED",
        isQualified: true,
        email: null,
        contacts: { none: {} },
      },
      include: { analyses: { orderBy: { createdAt: "desc" }, take: 1, select: { overallScore: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    db.company.count({
      where: {
        isBlacklisted: false,
        status: "QUALIFIED",
        isQualified: true,
        email: null,
        contacts: { none: {} },
      },
    }),
    
    // ─── "STUCK" LEADS ──────────────────────────────────────────────────
    // Qualifiziert seit >7 Tagen ohne Demo
    db.company.findMany({
      where: {
        isBlacklisted: false,
        status: "QUALIFIED",
        isQualified: true,
        updatedAt: { lt: last7Days },
      },
      include: { analyses: { orderBy: { createdAt: "desc" }, take: 1, select: { overallScore: true } } },
      orderBy: { updatedAt: "asc" },
      take: 3,
    }),
    
    // Demo seit >3 Tagen ohne Outreach
    db.company.findMany({
      where: {
        isBlacklisted: false,
        status: "SITE_GENERATED",
        updatedAt: { lt: last3Days },
      },
      orderBy: { updatedAt: "asc" },
      take: 3,
      select: { id: true, name: true, domain: true, updatedAt: true },
    }),
    
    // ─── OUTREACH STATS ─────────────────────────────────────────────────
    db.outreachDraft.count({ where: { status: "DRAFT" } }),
    db.outreachDraft.count({ where: { status: "APPROVED" } }),
    db.outreachDraft.count({ where: { status: "SENT" } }),
    db.outreachDraft.count({ where: { status: "REPLIED" } }),
    
    // ─── AUDIT & AKTIVITÄT ──────────────────────────────────────────────
    db.auditLog.findMany({
      where: { createdAt: { gte: last7Days } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { company: { select: { name: true, id: true } } },
    }),
    
    db.company.count({ where: { createdAt: { gte: last24Hours }, isBlacklisted: false } }),
    
    db.outreachDraft.count({ where: { approvedAt: { gte: last24Hours } } }),
    
    db.outreachDraft.count({ where: { updatedAt: { gte: last24Hours }, isBlockedForSend: true } }),
    
    // ─── HIGH-VALUE LEADS ───────────────────────────────────────────────
    db.company.findMany({
      where: {
        isBlacklisted: false,
        isQualified: true,
        status: { in: ["QUALIFIED", "SITE_GENERATED", "OUTREACH_DRAFT_READY"] },
      },
      include: { 
        analyses: { orderBy: { createdAt: "desc" }, take: 1, select: { overallScore: true, opportunityScore: true } },
      },
      orderBy: { opportunityScore: "desc" },
      take: 5,
    }),
    
    // ─── CONVERSATION STATS ─────────────────────────────────────────────
    // Antworten heute
    db.reply.count({
      where: { receivedAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0) } },
    }),
    
    // Antworten letzte 7 Tage
    db.reply.count({
      where: { receivedAt: { gte: last7Days } },
    }),
    
    // Heute fällige Follow-ups
    db.conversation.count({
      where: {
        status: { in: ACTIVE_CONVERSATION_STATUSES },
        nextFollowUpDueAt: {
          not: null,
          lte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0),
        },
      },
    }),
    
    // Überfällige Follow-ups
    db.conversation.count({
      where: {
        status: { in: ACTIVE_CONVERSATION_STATUSES },
        nextFollowUpDueAt: { not: null, lt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0) },
      },
    }),
    
    // Offene Konversationen (aktive)
    db.conversation.count({
      where: { status: { in: ACTIVE_CONVERSATION_STATUSES } },
    }),
    
    // Positive Replies
    db.reply.count({
      where: { sentiment: ReplySentiment.POSITIVE },
    }),
    
    // Dringende Follow-ups (Liste) - NUR heute fällig oder überfällig
    db.conversation.findMany({
      where: {
        status: { in: ACTIVE_CONVERSATION_STATUSES },
        nextFollowUpDueAt: { 
          not: null, 
          lte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59) // Bis Ende heute
        },
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            domain: true,
            opportunityScore: true,
          },
        },
        replies: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: [
        { nextFollowUpDueAt: "asc" },
      ],
      take: 10,
    }).then(conversations => {
      // Sortierung: Überfällig zuerst, dann Opportunity Score, dann lastContactAt
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
      return conversations
        .map(c => ({
          ...c,
          isOverdue: c.nextFollowUpDueAt!.getTime() < todayStart,
          daysOverdue: c.nextFollowUpDueAt!.getTime() < todayStart
            ? Math.floor((todayStart - c.nextFollowUpDueAt!.getTime()) / (1000 * 60 * 60 * 24))
            : 0,
          isToday: c.nextFollowUpDueAt!.getTime() >= todayStart,
        }))
        .sort((a, b) => {
          // Zuerst überfällig
          if (a.isOverdue && !b.isOverdue) return -1;
          if (!a.isOverdue && b.isOverdue) return 1;
          // Dann Opportunity Score (höher zuerst)
          const scoreDiff = (b.company.opportunityScore || 0) - (a.company.opportunityScore || 0);
          if (scoreDiff !== 0) return scoreDiff;
          // Dann lastContactAt (älter zuerst)
          return a.lastContactAt.getTime() - b.lastContactAt.getTime();
        });
    }),
  ]);

  // ═══════════════════════════════════════════════════════════════════════
  // ACTION ITEMS GENERIEREN (mit Priorisierung)
  // ═══════════════════════════════════════════════════════════════════════
  
  const actionItems: ActionItem[] = [];
  
  // ═══ PRIORITÄT 0: KRITISCHE BLOCKER & FEHLER ═══════════════════════════
  
  // Blockierte Outreachs (höchste Priorität - müssen korrigiert werden)
  if (blockedOutreach.length > 0) {
    actionItems.push({
      id: "blocked",
      priority: 0,
      severity: "error" as const,
      icon: "Ban",
      label: `${blockedOutreachCount} Outreach${blockedOutreachCount > 1 ? "s" : ""} blockiert`,
      sub: "Versand verhindert — Korrektur nötig",
      cta: "Prüfen",
      href: "/outreach?status=BLOCKED",
      count: blockedOutreachCount,
      leads: blockedOutreach.map(d => ({ 
        id: d.companyId, 
        name: d.company.name, 
        meta: d.blockReason || "Blockiert" 
      })),
    });
  }
  
  // Fehlgeschlagene Crawls
  if (failedCrawls.length > 0) {
    actionItems.push({
      id: "failed-crawl",
      priority: 0,
      severity: "error" as const,
      icon: "XCircle",
      label: `${failedCrawlsCount} Crawl${failedCrawlsCount > 1 ? "s" : ""} fehlgeschlagen`,
      sub: "Erneut versuchen oder manuell prüfen",
      cta: "Ansehen",
      href: "/logs?filter=failed-crawls",
      count: failedCrawlsCount,
      leads: failedCrawls.map(c => ({ 
        id: c.companyId, 
        name: c.company.name, 
        meta: c.errorMessage?.slice(0, 40) || "Fehler" 
      })),
    });
  }
  
  // Fehlgeschlagene Demos
  if (failedDemos.length > 0) {
    actionItems.push({
      id: "failed-demo",
      priority: 0,
      severity: "error" as const,
      icon: "XCircle",
      label: `${failedDemosCount} Demo-Generierung fehlgeschlagen`,
      sub: "Neugenerierung oder manuelle Prüfung",
      cta: "Prüfen",
      href: "/logs?filter=failed-demos",
      count: failedDemosCount,
      leads: failedDemos.map(d => ({ 
        id: d.companyId, 
        name: d.company.name, 
        meta: d.errorCode || "Fehler" 
      })),
    });
  }
  
  // ═══ PRIORITÄT 1: HIGH-VALUE BLOCKER ═══════════════════════════════════
  
  // Qualifiziert ohne Kontaktdaten (können nicht bearbeitet werden!)
  if (qualifiedMissingContacts.length > 0) {
    actionItems.push({
      id: "qualified-missing-contacts",
      priority: 1,
      severity: "error" as const,
      icon: "User",
      label: `${qualifiedMissingContactsCount} qualifizierte${qualifiedMissingContactsCount > 1 ? "" : "r"} Lead ohne Kontakt`,
      sub: "Qualifiziert aber keine E-Mail — Outreach unmöglich",
      cta: "Ergänzen",
      href: "/leads?status=QUALIFIED&filter=missing-contacts",
      count: qualifiedMissingContactsCount,
      leads: qualifiedMissingContacts.map(l => ({ 
        id: l.id, 
        name: l.name, 
        meta: l.analyses[0]?.overallScore ? `Score ${Math.round(l.analyses[0].overallScore)}` : "Qualifiziert"
      })),
    });
  }
  
  // ═══ PRIORITÄT 2: FREIGABEN & REVIEWS ══════════════════════════════════
  
  // Mit Platzhaltern (müssen vor Freigabe geprüft werden)
  if (hasPlaceholders.length > 0) {
    actionItems.push({
      id: "placeholders",
      priority: 2,
      severity: "warning" as const,
      icon: "AlertTriangle",
      label: `${hasPlaceholdersCount} Outreach mit Platzhaltern`,
      sub: "Vor Freigabe prüfen",
      cta: "Review",
      href: "/outreach?status=NEEDS_REVIEW",
      count: hasPlaceholdersCount,
      leads: hasPlaceholders.map(d => ({ 
        id: d.companyId, 
        name: d.company.name, 
        meta: d.subject?.slice(0, 30) || "Entwurf" 
      })),
    });
  }
  
  // Freigabe offen
  if (needsApproval.length > 0) {
    actionItems.push({
      id: "approval",
      priority: 2,
      severity: "info" as const,
      icon: "CheckCircle",
      label: `${needsApprovalCount} Outreach zur Freigabe bereit`,
      sub: "Review abgeschlossen — Versand möglich",
      cta: "Freigeben",
      href: "/outreach?status=APPROVED",
      count: needsApprovalCount,
      leads: needsApproval.map(d => ({ 
        id: d.companyId, 
        name: d.company.name, 
        meta: d.subject?.slice(0, 30) || "Bereit" 
      })),
    });
  }
  
  // ═══ PRIORITÄT 3: WORKFLOW-AUFTRÄGE ════════════════════════════════════
  
  // Demo bereit (qualifiziert)
  if (readyForDemo.length > 0) {
    const topLeads = readyForDemo
      .sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0))
      .slice(0, 5);
    
    actionItems.push({
      id: "demo",
      priority: 3,
      severity: "info" as const,
      icon: "LayoutTemplate",
      label: `${readyForDemoCount} Lead${readyForDemoCount > 1 ? "s" : ""} bereit für Demo`,
      sub: "Qualifiziert — Demo-Seite generieren",
      cta: "Generieren",
      href: "/leads?status=QUALIFIED",
      count: readyForDemoCount,
      leads: topLeads.map(l => ({ 
        id: l.id, 
        name: l.name, 
        meta: l.analyses[0]?.overallScore != null 
          ? `Score ${Math.round(l.analyses[0].overallScore)}${l.opportunityScore ? ` · Opp ${Math.round(l.opportunityScore)}` : ""}`
          : "Qualifiziert"
      })),
    });
  }
  
  // Outreach bereit (Demo erstellt)
  if (readyForOutreach.length > 0) {
    actionItems.push({
      id: "outreach",
      priority: 3,
      severity: "info" as const,
      icon: "Send",
      label: `${readyForOutreachCount} Lead${readyForOutreachCount > 1 ? "s" : ""} bereit für Outreach`,
      sub: "Demo erstellt — Outreach generieren",
      cta: "Erstellen",
      href: "/leads?status=SITE_GENERATED",
      count: readyForOutreachCount,
      leads: readyForOutreach.map(l => ({ 
        id: l.id, 
        name: l.name, 
        meta: l.analyses[0]?.overallScore != null ? `Score ${Math.round(l.analyses[0].overallScore)}` : "Bereit"
      })),
    });
  }
  
  // Crawl wartend
  if (waitingCrawl.length > 0) {
    actionItems.push({
      id: "crawl",
      priority: 4,
      severity: "info" as const,
      icon: "Play",
      label: `${waitingCrawlCount} Lead${waitingCrawlCount > 1 ? "s" : ""} warten auf Crawl`,
      sub: "Website laden und analysieren",
      cta: "Starten",
      href: "/leads?status=NEW",
      count: waitingCrawlCount,
      leads: waitingCrawl.map(l => ({ id: l.id, name: l.name, meta: l.domain || "Neu" })),
    });
  }
  
  // Analyse wartend
  if (waitingAnalysis.length > 0) {
    actionItems.push({
      id: "analyze",
      priority: 4,
      severity: "info" as const,
      icon: "Sparkles",
      label: `${waitingAnalysisCount} Lead${waitingAnalysisCount > 1 ? "s" : ""} warten auf Analyse`,
      sub: "Gecrawlt — Qualifizierung ausstehend",
      cta: "Analysieren",
      href: "/leads?status=CRAWLED",
      count: waitingAnalysisCount,
      leads: waitingAnalysis.map(l => ({ id: l.id, name: l.name, meta: l.domain || "Gecrawlt" })),
    });
  }
  
  // ═══ PRIORITÄT 5: KONTAKT-LÜCKEN ═══════════════════════════════════════
  
  if (missingContacts.length > 0 && qualifiedMissingContacts.length === 0) {
    actionItems.push({
      id: "contacts",
      priority: 5,
      severity: "warning" as const,
      icon: "User",
      label: `${missingContactsCount} Lead${missingContactsCount > 1 ? "s" : ""} ohne Kontaktdaten`,
      sub: "Für späteren Outreach E-Mail ergänzen",
      cta: "Ergänzen",
      href: "/leads?filter=missing-contacts",
      count: missingContactsCount,
      leads: missingContacts.slice(0, 5).map(l => ({ 
        id: l.id, 
        name: l.name, 
        meta: l.status 
      })),
    });
  }
  
  // ═══ PRIORITÄT 6: STUCK LEADS (verwaist) ═══════════════════════════════
  
  if (stuckQualifiedNoDemo.length > 0) {
    actionItems.push({
      id: "stuck-qualified",
      priority: 6,
      severity: "warning" as const,
      icon: "Clock",
      label: `${stuckQualifiedNoDemo.length} qualifiziert${stuckQualifiedNoDemo.length > 1 ? "e" : "er"} Lead seit >7 Tagen ohne Demo`,
      sub: "Demo-Generierung verzögert",
      cta: "Ansehen",
      href: "/leads?status=QUALIFIED&sort=oldest",
      count: stuckQualifiedNoDemo.length,
      leads: stuckQualifiedNoDemo.map(l => ({ 
        id: l.id, 
        name: l.name, 
        meta: l.analyses[0]?.overallScore ? `Score ${Math.round(l.analyses[0].overallScore)}` : "Qualifiziert"
      })),
    });
  }
  
  if (stuckDemoNoOutreach.length > 0) {
    actionItems.push({
      id: "stuck-demo",
      priority: 6,
      severity: "warning" as const,
      icon: "Clock",
      label: `${stuckDemoNoOutreach.length} Demo${stuckDemoNoOutreach.length > 1 ? "s" : ""} seit >3 Tagen ohne Outreach`,
      sub: "Outreach-Generierung verzögert",
      cta: "Ansehen",
      href: "/leads?status=SITE_GENERATED&sort=oldest",
      count: stuckDemoNoOutreach.length,
      leads: stuckDemoNoOutreach.map(l => ({ id: l.id, name: l.name, meta: l.domain || "" })),
    });
  }
  
  // Fehlgeschlagene Analysen (niedrigere Priorität da seltener kritisch)
  if (failedAnalyses.length > 0) {
    actionItems.push({
      id: "failed-analysis",
      priority: 7,
      severity: "warning" as const,
      icon: "AlertTriangle",
      label: `${failedAnalysesCount} Analyse${failedAnalysesCount > 1 ? "n" : ""} fehlgeschlagen`,
      sub: "Erneut versuchen",
      cta: "Prüfen",
      href: "/logs?filter=failed-analyses",
      count: failedAnalysesCount,
      leads: failedAnalyses.map(a => ({ 
        id: a.companyId, 
        name: a.company.name, 
        meta: a.errorMessage?.slice(0, 40) || "Fehler" 
      })),
    });
  }

  // Nach Priorität sortieren
  actionItems.sort((a, b) => a.priority - b.priority);

  // ═══════════════════════════════════════════════════════════════════════
  // TODOS FÜR HEUTE (Top 3-5 Prioritäten)
  // ═══════════════════════════════════════════════════════════════════════
  
  const todayTodos = actionItems
    .filter(item => item.priority <= 3)
    .slice(0, 5)
    .map(item => ({
      id: item.id,
      severity: item.severity,
      label: item.label,
      count: item.count,
      href: item.href,
      cta: item.cta,
    }));

  return NextResponse.json({
    session: { user: { name: session.user?.name } },
    
    // ─── BASIS ───
    totalLeads,
    statusCounts,
    avgScore: avgScore._avg.overallScore,
    avgOpportunityScore: avgScore._avg.opportunityScore,
    topIndustries,
    recentLeads,
    
    // ─── OPERATIONAL ───
    actionItems,
    todayTodos,
    
    // ─── COUNTS FÜR KPIS ───
    workflowCounts: {
      crawl: waitingCrawlCount,
      analysis: waitingAnalysisCount,
      demo: readyForDemoCount,
      outreach: readyForOutreachCount,
    },
    
    outreachStats: {
      draft: outreachDraftCount,
      approved: approvedOutreachCount,
      sent: sentOutreachCount,
      replied: repliedOutreachCount,
      blocked: blockedOutreachCount,
      needsReview: hasPlaceholdersCount,
      readyToApprove: needsApprovalCount,
    },
    
    errors: {
      failedCrawls: failedCrawlsCount,
      failedDemos: failedDemosCount,
      failedAnalyses: failedAnalysesCount,
      missingContacts: missingContactsCount,
      qualifiedMissingContacts: qualifiedMissingContactsCount,
    },
    
    // ─── STUCK LEADS ───
    stuckLeads: {
      qualifiedNoDemo: readyForDemoCount,
      demoNoOutreach: readyForOutreachCount,
      stuckQualifiedNoDemo: stuckQualifiedNoDemo.length,
      stuckDemoNoOutreach: stuckDemoNoOutreach.length,
    },
    
    // ─── HIGH-VALUE LEADS ───
    highValueLeads: highValueLeads.map(l => ({
      id: l.id,
      name: l.name,
      domain: l.domain,
      status: l.status,
      score: l.analyses[0]?.overallScore || null,
      opportunityScore: l.opportunityScore || null,
    })),
    
    // ─── AKTIVITÄT ───
    recentActivity: recentActivity.map(a => ({
      id: a.id,
      eventType: a.eventType,
      action: a.action,
      title: a.title,
      companyName: a.company?.name,
      companyId: a.companyId,
      createdAt: a.createdAt,
      severity: a.severity,
    })),
    activityMeta: {
      newLeads24h,
      newApprovals24h,
      newBlocks24h,
    },
    
    // ─── CONVERSATION KPIS ───
    conversationStats: {
      repliesToday,
      repliesLast7Days,
      followUpsDueToday,
      overdueFollowUps,
      openConversations,
      positiveReplies,
    },
    
    // ─── DRINGENDE FOLLOW-UPS ───
    urgentFollowUps: urgentFollowUps.map(c => ({
      id: c.id,
      companyId: c.companyId,
      companyName: c.company.name,
      companyDomain: c.company.domain,
      opportunityScore: c.company.opportunityScore,
      status: c.status,
      followUpCount: c.followUpCount,
      nextFollowUpDueAt: c.nextFollowUpDueAt,
      lastContactAt: c.lastContactAt,
      isOverdue: c.nextFollowUpDueAt! < new Date(),
      daysOverdue: c.nextFollowUpDueAt! < new Date() 
        ? Math.floor((new Date().getTime() - c.nextFollowUpDueAt!.getTime()) / (1000 * 60 * 60 * 24))
        : 0,
      currentSentiment: c.currentSentiment,
      lastReplyContent: c.replies[0]?.content || null,
    })),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPEN
// ═══════════════════════════════════════════════════════════════════════════

interface ActionItem {
  id: string;
  priority: number;
  severity: "info" | "warning" | "error";
  icon: string;
  label: string;
  sub: string;
  cta: string;
  href: string;
  count: number;
  leads: { id: string; name: string; meta: string }[];
}
