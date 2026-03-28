// Auth API Route - Temporärer Demo-Bypass
// Für Produktion: NextAuth.js oder ähnliches implementieren

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Temporärer Handler für Demo
export async function GET() {
  const session = await auth();
  return NextResponse.json(session);
}

export async function POST() {
  const session = await auth();
  return NextResponse.json(session);
}
