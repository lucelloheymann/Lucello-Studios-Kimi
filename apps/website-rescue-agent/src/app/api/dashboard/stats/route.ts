import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { LeadStatus } from "@prisma/client";
import { STATUS_LABELS } from "@/lib/utils";
import type { DashboardStats } from "@/types";

// GET /api/dashboard/stats
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    totalLeads,
    statusCounts,
    avgScoreResult,
    topIndustries,
    recentLogs,
    qualifiedCount,
  ] = await Promise.all([
    db.company.count({ where: { isBlacklisted: false } }),

    db.company.groupBy({
      by: ["status"],
      _count: { status: true },
      where: { isBlacklisted: false },
    }),

    db.analysis.aggregate({
      _avg: { overallScore: true },
      where: { status: "COMPLETED" },
    }),

    db.company.groupBy({
      by: ["industry"],
      _count: { industry: true },
      where: { isBlacklisted: false, industry: { not: null } },
      orderBy: { _count: { industry: "desc" } },
      take: 5,
    }),

    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { company: { select: { name: true } } },
    }),

    db.company.count({ where: { isQualified: true } }),
  ]);

  const statusMap = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count.status])
  );

  const won = statusMap[LeadStatus.WON] ?? 0;
  const total = totalLeads;
  const conversionRate = total > 0 ? Math.round((won / total) * 100) : 0;

  // Pipeline Funnel
  const funnelStages = [
    LeadStatus.NEW,
    LeadStatus.CRAWLED,
    LeadStatus.ANALYZED,
    LeadStatus.QUALIFIED,
    LeadStatus.SITE_GENERATED,
    LeadStatus.OUTREACH_DRAFT_READY,
    LeadStatus.SENT,
    LeadStatus.WON,
  ].map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: statusMap[status] ?? 0,
    percentage: total > 0 ? Math.round(((statusMap[status] ?? 0) / total) * 100) : 0,
  }));

  const stats: DashboardStats = {
    totalLeads,
    newLeads: statusMap[LeadStatus.NEW] ?? 0,
    qualifiedLeads: qualifiedCount,
    sitesGenerated: statusMap[LeadStatus.SITE_GENERATED] ?? 0,
    pendingReview: statusMap[LeadStatus.IN_REVIEW] ?? 0,
    outreachReady: statusMap[LeadStatus.OUTREACH_DRAFT_READY] ?? 0,
    sent: statusMap[LeadStatus.SENT] ?? 0,
    responded: statusMap[LeadStatus.RESPONDED] ?? 0,
    won,
    conversionRate,
    avgScore: avgScoreResult._avg.overallScore,
    topIndustries: topIndustries.map((i) => ({
      industry: i.industry!,
      count: i._count.industry,
    })),
    recentActivity: recentLogs.map((log) => ({
      id: log.id,
      type: log.action,
      companyName: log.company?.name ?? "Unbekannt",
      companyId: log.companyId ?? "",
      description: formatActivityDescription(log.action),
      timestamp: log.createdAt,
    })),
    pipelineFunnel: funnelStages,
  };

  return NextResponse.json(stats);
}

function formatActivityDescription(action: string): string {
  const map: Record<string, string> = {
    "lead.created": "Lead erstellt",
    "analysis.completed": "Analyse abgeschlossen",
    "site.generated": "Demo-Website generiert",
    "outreach.approved": "Outreach freigegeben",
    "outreach.sent": "Nachricht gesendet",
    "outreach.rejected": "Outreach abgelehnt",
  };
  return map[action] ?? action;
}
