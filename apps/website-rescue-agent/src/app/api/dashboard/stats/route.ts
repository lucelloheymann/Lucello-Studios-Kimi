import { NextResponse } from "next/server";
import { mockStats, mockActivities } from "@/lib/mock/data";

export async function GET() {
  return NextResponse.json({
    stats: mockStats,
    recentActivities: mockActivities,
  });
}
