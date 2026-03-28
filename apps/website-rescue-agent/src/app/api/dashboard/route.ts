import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { LeadStatus } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    totalLeads,
    statusCounts,
    avgScore,
    topIndustries,
    recentLeads,
    pendingOutreach,
    waitingCrawl,
    waitingAnalysis,
    readyForDemo,
    readyForOutreach,
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
    db.company.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      where: { isBlacklisted: false },
      include: { analyses: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
    db.outreachDraft.findMany({
      where: { status: "DRAFT" },
      include: { company: { select: { name: true, id: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Warten auf Crawl
    db.company.findMany({
      where: { isBlacklisted: false, status: "NEW" },
      orderBy: { createdAt: "asc" },
      take: 3,
      select: { id: true, name: true, domain: true, createdAt: true },
    }),
    // Gecrawlt, warten auf Analyse
    db.company.findMany({
      where: { isBlacklisted: false, status: "CRAWLED" },
      orderBy: { updatedAt: "asc" },
      take: 3,
      select: { id: true, name: true, domain: true, updatedAt: true },
    }),
    // Qualifiziert, Demo fehlt noch
    db.company.findMany({
      where: { isBlacklisted: false, status: "QUALIFIED" },
      include: { analyses: { orderBy: { createdAt: "desc" }, take: 1, select: { overallScore: true } } },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
    // Analysiert oder Qualifiziert, kein Outreach-Entwurf
    db.company.findMany({
      where: {
        isBlacklisted: false,
        status: { in: ["SITE_GENERATED", "OUTREACH_DRAFT_READY"] },
      },
      include: { analyses: { orderBy: { createdAt: "desc" }, take: 1, select: { overallScore: true } } },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
  ]);

  return NextResponse.json({
    session: { user: { name: session.user?.name } },
    totalLeads,
    statusCounts,
    avgScore: avgScore._avg.overallScore,
    topIndustries,
    recentLeads,
    pendingOutreach,
    waitingCrawl,
    waitingAnalysis,
    readyForDemo,
    readyForOutreach,
  });
}
