// scripts/visual-check.mjs
// Lightweight screenshot verification for LuomoHome.
// Requires: playwright (npm install --save-dev playwright)
// Usage: node scripts/visual-check.mjs

import { chromium } from "playwright";
import { mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "screenshots", "visual-check");
const baseUrl = process.env.VISUAL_CHECK_URL || "http://127.0.0.1:7891";

const shots = [
  { name: "desktop-hero", path: "/", width: 1440, height: 900 },
  { name: "desktop-service", path: "/", width: 1440, height: 900, scroll: "#service-constellation" },
  { name: "desktop-cockpit", path: "/", width: 1440, height: 900, scroll: "#operations-cockpit" },
  { name: "mobile-hero", path: "/", width: 390, height: 844 },
  { name: "mobile-service", path: "/", width: 390, height: 844, scroll: "#service-constellation" },
];

async function main() {
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  for (const shot of shots) {
    await page.setViewportSize({ width: shot.width, height: shot.height });
    await page.goto(baseUrl + shot.path, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);
    if (shot.scroll) {
      await page.locator(shot.scroll).scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
    }
    const filePath = join(outDir, shot.name + ".png");
    await page.screenshot({ path: filePath, fullPage: false });
    console.log("  ✓ " + shot.name + " (" + shot.width + "x" + shot.height + ")");
  }

  await browser.close();
  console.log("\nDone! Screenshots saved to " + outDir);
}

main().catch((err) => { console.error("Screenshot failed:", err.message); process.exit(1); });