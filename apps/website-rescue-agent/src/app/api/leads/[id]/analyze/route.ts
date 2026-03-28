import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { enqueueJob } from "@/lib/queue";

type Params = { params: Promise<{ id: string }> };

// POST /api/leads/:id/analyze
export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const crawl = await db.crawl.findFirst({
    where: { companyId: id, status: "COMPLETED" },
  });

  if (!crawl) {
    return NextResponse.json(
      { error: "Kein abgeschlossener Crawl vorhanden — bitte zuerst crawlen" },
      { status: 400 }
    );
  }

  const jobId = await enqueueJob("analyze", { companyId: id }, { priority: 5 });

  return NextResponse.json({ success: true, jobId });
}
