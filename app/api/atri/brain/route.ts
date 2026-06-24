import { NextResponse } from "next/server";
import { runAtriBrain } from "@/lib/atri-brain/provider";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = String(body.message || "").slice(0, 500);

    if (!message) {
      return NextResponse.json({
        ok: false,
        source: "fallback",
        text: "ATRI ?????????",
        mood: "idle",
        form: "default",
      });
    }

    const result = await runAtriBrain(
      { message, context: body.context || {} },
      {
        allowSecretForms: Boolean(body.context?.allowSecretForms),
        allowDebugForms: Boolean(body.context?.allowDebugForms),
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[ATRI Brain] route error", {
      reason: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      ok: false,
      source: "fallback",
      text: "ATRI ?????????????????????",
      mood: "warning",
      form: "default",
      expression: "surprised",
      motion: "alert",
      debug: { reason: "route_error" },
    });
  }
}
