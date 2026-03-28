import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logQualified } from "@/server/services/audit.service";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/leads/:id/qualify
export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const company = await db.company.findUnique({ where: { id } });
  if (!company) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }

  // Prüfe ob Analyse vorhanden
  const analysis = await db.analysis.findFirst({
    where: { companyId: id, status: "COMPLETED" },
  });
  if (!analysis) {
    return NextResponse.json(
      { error: "Keine Analyse vorhanden — bitte zuerst analysieren" },
      { status: 400 }
    );
  }

  await db.company.update({
    where: { id },
    data: { isQualified: true },
  });

  // Audit-Log: Qualifiziert
  await logQualified(id, analysis.overallScore ?? 0, false, session.user?.id ?? "unknown");

  return NextResponse.json({ success: true });
}
