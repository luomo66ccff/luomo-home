import { NextResponse } from "next/server";
import { getServicesStatus } from "@/lib/status";

export async function GET() {
  try {
    const payload = await getServicesStatus();
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({
      services: [],
      updated_at: new Date().toISOString()
    });
  }
}
