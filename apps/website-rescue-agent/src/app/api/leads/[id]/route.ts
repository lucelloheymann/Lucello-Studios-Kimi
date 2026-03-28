import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

// GET /api/leads/:id
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const company = await db.company.findUnique({
    where: { id },
    include: {
      contacts: true,
      crawls: { orderBy: { createdAt: "desc" }, take: 1, include: { pages: true } },
      analyses: { orderBy: { createdAt: "desc" }, take: 1 },
      generatedSites: { orderBy: { createdAt: "desc" }, take: 5 },
      outreachDrafts: { orderBy: { createdAt: "desc" }, take: 5 },
      pipelineStates: { orderBy: { createdAt: "desc" }, take: 10 },
      followUpTasks: { where: { completedAt: null }, orderBy: { dueAt: "asc" } },
      competitorSnapshots: true,
      auditLogs: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!company) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  return NextResponse.json(company);
}

// PATCH /api/leads/:id
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const updateSchema = z.object({
    name: z.string().optional(),
    industry: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    notes: z.string().optional(),
    nextActionAt: z.string().datetime().optional(),
    nextActionNote: z.string().optional(),
    isBlacklisted: z.boolean().optional(),
    priority: z.number().min(0).max(100).optional(),
  });

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
  }

  const company = await db.company.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(company);
}

// DELETE /api/leads/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await db.company.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
