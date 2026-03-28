import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { extractDomain, normalizeUrl } from "@/lib/utils";
import { z } from "zod";
import type { LeadFilters } from "@/types";

const createLeadSchema = z.object({
  name: z.string().min(2),
  domain: z.string().min(3),
  websiteUrl: z.string().url().optional(),
  industry: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  notes: z.string().optional(),
});

// GET /api/leads
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = req.nextUrl.searchParams;

  const filters: LeadFilters = {
    status: params.getAll("status"),
    industry: params.getAll("industry"),
    state: params.getAll("state"),
    search: params.get("search") ?? undefined,
    minScore: params.get("minScore") ? Number(params.get("minScore")) : undefined,
    maxScore: params.get("maxScore") ? Number(params.get("maxScore")) : undefined,
    isQualified: params.get("isQualified") === "true" ? true : params.get("isQualified") === "false" ? false : undefined,
    page: Number(params.get("page") ?? 1),
    pageSize: Number(params.get("pageSize") ?? 25),
    sortBy: params.get("sortBy") ?? "createdAt",
    sortOrder: (params.get("sortOrder") as "asc" | "desc") ?? "desc",
  };

  const where = buildWhereClause(filters);
  const orderBy = buildOrderBy(filters);

  const [total, items] = await Promise.all([
    db.company.count({ where }),
    db.company.findMany({
      where,
      orderBy,
      skip: ((filters.page ?? 1) - 1) * (filters.pageSize ?? 25),
      take: filters.pageSize ?? 25,
      include: {
        _count: { select: { analyses: true, generatedSites: true, outreachDrafts: true } },
      },
    }),
  ]);

  return NextResponse.json({
    items,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.ceil(total / (filters.pageSize ?? 25)),
  });
}

// POST /api/leads
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createLeadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Daten", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const domain = extractDomain(data.domain);

  // Dubletten-Check
  const existing = await db.company.findUnique({ where: { domain } });
  if (existing) {
    return NextResponse.json(
      { error: "Domain bereits vorhanden", existingId: existing.id },
      { status: 409 }
    );
  }

  const company = await db.company.create({
    data: {
      name: data.name,
      domain,
      websiteUrl: data.websiteUrl ?? normalizeUrl(domain),
      industry: data.industry,
      city: data.city,
      state: data.state,
      phone: data.phone,
      email: data.email,
      notes: data.notes,
      ownerId: session.user?.id,
    },
  });

  await db.pipelineState.create({
    data: {
      companyId: company.id,
      toStatus: "NEW",
      changedBy: session.user?.id,
      reason: "Manuell erstellt",
    },
  });

  await db.auditLog.create({
    data: {
      companyId: company.id,
      action: "lead.created",
      entityType: "Company",
      entityId: company.id,
      userId: session.user?.id,
      metadata: { source: "manual" },
    },
  });

  return NextResponse.json(company, { status: 201 });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildWhereClause(filters: LeadFilters) {
  const where: Record<string, unknown> = {
    isBlacklisted: false,
    isDuplicate: false,
  };

  if (filters.status?.length) where.status = { in: filters.status };
  if (filters.industry?.length) where.industry = { in: filters.industry };
  if (filters.state?.length) where.state = { in: filters.state };
  if (filters.isQualified !== undefined) where.isQualified = filters.isQualified;

  if (filters.minScore !== undefined || filters.maxScore !== undefined) {
    where.opportunityScore = {};
    if (filters.minScore !== undefined) (where.opportunityScore as Record<string, number>).gte = filters.minScore;
    if (filters.maxScore !== undefined) (where.opportunityScore as Record<string, number>).lte = filters.maxScore;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { domain: { contains: filters.search, mode: "insensitive" } },
      { city: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}

function buildOrderBy(filters: LeadFilters) {
  const field = filters.sortBy ?? "createdAt";
  const order = filters.sortOrder ?? "desc";
  return { [field]: order };
}
