import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { enqueueJob } from "@/lib/queue";
import { SiteStyle } from "@/types";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const schema = z.object({
  style: z.nativeEnum(SiteStyle).optional().default(SiteStyle.MODERN_PREMIUM),
});

// POST /api/leads/:id/generate-site
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { style } = schema.parse(body);

  const analysis = await db.analysis.findFirst({
    where: { companyId: id, status: "COMPLETED" },
  });

  if (!analysis) {
    return NextResponse.json(
      { error: "Keine abgeschlossene Analyse vorhanden" },
      { status: 400 }
    );
  }

  const jobId = await enqueueJob("generate-site", { companyId: id, style }, { priority: 3 });

  return NextResponse.json({ success: true, jobId, style });
}
