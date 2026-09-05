import { NextResponse } from "next/server";
import { getServicesStatus } from "@/lib/status";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return NextResponse.json(await getServicesStatus(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ services: [], updated_at: new Date().toISOString(), error: "status_unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
