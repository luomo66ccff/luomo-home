import { NextResponse } from "next/server";
import { SERVICES } from "@/lib/services";
import { isoNow } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    service: "LuomoHome",
    status: "operational",
    updated_at: isoNow(),
    services_count: SERVICES.length
  });
}
