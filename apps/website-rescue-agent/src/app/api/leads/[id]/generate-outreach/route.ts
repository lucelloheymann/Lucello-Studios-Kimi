import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { enqueueJob } from "@/lib/queue";
import { OutreachType } from "@prisma/client";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const schema = z.object({
  type: z.nativeEnum(OutreachType).optional().default(OutreachType.EMAIL_SHORT),
});

// POST /api/leads/:id/generate-outreach
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { type } = schema.parse(body);

  const analysis = await db.analysis.findFirst({
    where: { companyId: id, status: "COMPLETED" },
  });

  if (!analysis) {
    return NextResponse.json(
      { error: "Keine abgeschlossene Analyse — Outreach nicht möglich" },
      { status: 400 }
    );
  }

  const jobId = await enqueueJob("generate-outreach", { companyId: id, type });

  return NextResponse.json({ success: true, jobId, type });
}
