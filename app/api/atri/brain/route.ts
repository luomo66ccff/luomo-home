import { NextResponse } from "next/server";
import { runAtriBrain } from "@/lib/atri-brain/provider";
import type { AtriBrainRequest } from "@/lib/atri-brain/types";
import {
  consumeAtriRateLimit,
  getClientIdentifier,
  isAllowedAtriOrigin,
} from "@/lib/request-security";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, {
    status,
    headers: { ...NO_STORE_HEADERS, ...headers },
  });
}

function readContext(input: unknown): AtriBrainRequest["context"] {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const raw = input as Record<string, unknown>;
  return {
    companionId: String(raw.companionId || "").slice(0, 32),
    currentSection: String(raw.currentSection || "").slice(0, 64),
    currentMood: String(raw.currentMood || "").slice(0, 32),
    currentForm: String(raw.currentForm || "").slice(0, 32),
    pageTitle: String(raw.pageTitle || "").slice(0, 120),
    servicesCount: Math.max(0, Math.min(100, Number(raw.servicesCount) || 0)),
  };
}

export async function POST(request: Request) {
  if (!isAllowedAtriOrigin(request)) {
    return json({ ok: false, error: "origin_not_allowed" }, 403);
  }

  const rateLimit = consumeAtriRateLimit(getClientIdentifier(request));
  if (!rateLimit.allowed) {
    return json(
      { ok: false, error: "rate_limit_exceeded" },
      429,
      { "Retry-After": String(rateLimit.retryAfterSeconds) }
    );
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const message = String(body.message || "").trim().slice(0, 500);

    if (!message) {
      return json({
        ok: false,
        source: "fallback",
        text: "ATRI needs a message before she can respond.",
        mood: "idle",
        form: "default",
      }, 400);
    }

    const result = await runAtriBrain(
      { message, context: readContext(body.context) },
      {
        allowSecretForms: process.env.ATRI_ALLOW_SECRET_FORMS === "true",
        allowDebugForms:
          process.env.NODE_ENV !== "production" &&
          process.env.ATRI_ALLOW_DEBUG_FORMS === "true",
      }
    );

    return json(result);
  } catch (error) {
    console.error("[ATRI Brain] route error", {
      reason: error instanceof Error ? error.message : "unknown_error",
    });

    return json({
      ok: false,
      source: "fallback",
      text: "ATRI is temporarily unavailable. Please try again later.",
      mood: "warning",
      form: "default",
      expression: "surprised",
      motion: "alert",
      debug: { reason: "route_error" },
    }, 500);
  }
}
