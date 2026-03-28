import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { enqueueJob } from "@/lib/queue";

type Params = { params: Promise<{ id: string }> };

// POST /api/leads/:id/crawl
export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const company = await db.company.findUnique({ where: { id } });
  if (!company) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  const jobId = await enqueueJob("crawl", { companyId: id }, { priority: 5 });

  await db.company.update({ where: { id }, data: { status: "QUEUED_FOR_CRAWL" } });

  await db.jobRecord.create({
    data: {
      type: "crawl",
      status: "PENDING",
      entityType: "Company",
      entityId: id,
      queueJobId: jobId,
    },
  });

  return NextResponse.json({ success: true, jobId });
}
