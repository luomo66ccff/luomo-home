import { existsSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { companionOrder, getCompanionProfile } from "@/lib/companions/companionRegistry";
import { live2dConfig } from "@/lib/live2d/live2dConfig";

export const dynamic = "force-dynamic";

function publicAssetPath(assetPath: string): string {
  return path.join(process.cwd(), "public", assetPath.replace(/^\/+/, ""));
}

export async function GET() {
  const core = {
    path: live2dConfig.cubismCorePath,
    exists: existsSync(publicAssetPath(live2dConfig.cubismCorePath)),
  };
  const models = Object.fromEntries(companionOrder.map((id) => {
    const modelPath = getCompanionProfile(id).modelPath;
    return [id, { path: modelPath, exists: existsSync(publicAssetPath(modelPath)) }];
  }));

  return NextResponse.json(
    { core, models },
    { headers: { "Cache-Control": "no-store" } },
  );
}
