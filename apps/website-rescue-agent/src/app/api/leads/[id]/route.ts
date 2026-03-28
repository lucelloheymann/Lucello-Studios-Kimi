import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const company = await db.company.findUnique({
    where: { id },
    include: {
      contacts: true,
      crawls: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { pages: { orderBy: { pageType: "asc" } } },
      },
      analyses: { orderBy: { createdAt: "desc" }, take: 1 },
      generatedSites: { orderBy: { createdAt: "desc" }, take: 3 },
      outreachDrafts: { orderBy: { createdAt: "desc" }, take: 3 },
      pipelineStates: { orderBy: { createdAt: "desc" }, take: 20 },
      auditLogs: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ company });
}
