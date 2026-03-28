import { NextResponse } from "next/server";
import { mockCompanies } from "@/lib/mock/data";

export async function GET() {
  return NextResponse.json(mockCompanies);
}
