import { chromium } from "playwright";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = join(root, "output", "playwright");
const base = new URL(process.env.VISUAL_CHECK_URL || "http://127.0.0.1:7891");
assert.match(base.protocol, /^https?:$/);
mkdirSync(output, { recursive: true });
const versions = readdirSync(output).filter(s => /^t\d+$/.test(s)).map(s => Number(s.slice(1)));
const runId = process.env.VISUAL_CHECK_RUN_ID || "t" + String(Math.max(0, ...versions) + 1).padStart(3, "0");
assert.match(runId, /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/);
const runDir = resolve(output, runId);
assert.ok(runDir.startsWith(resolve(output) + (process.platform === "win32" ? "\\" : "/")));
mkdirSync(runDir);
const checks = [];
const errors = [];
const report = { baseUrl: base.origin, runId, screenshots: [], checks, errors };
let browser;
const check = (name, condition) => { assert.ok(condition, name); checks.push(name); };
function captureErrors(page) {
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
}
async function load(context) {
  const page = await context.newPage();
  captureErrors(page);
  const response = await page.goto(base.href, { waitUntil: "networkidle", timeout: 45000 });
  check("Homepage HTTP 200", response?.status() === 200);
  await page.locator("h1").waitFor();
  check("One accessible page title", await page.locator("h1").count() === 1);
  return page;
}
async function screenshot(page, name, fullPage = false) {
  const originalScroll = await page.evaluate(() => window.scrollY);
  if (fullPage) {
    // Visit lazy images as a reader would before capturing the complete page.
    for (const img of await page.locator("main img").all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(element => element.decode());
    }
    await page.evaluate(() => window.scrollTo(0, 0));
  }
  await page.screenshot({ path: join(runDir, name + ".png"), fullPage, animations: "disabled" });
  if (fullPage) await page.evaluate(y => window.scrollTo(0, y), originalScroll);
  report.screenshots.push(name + ".png");
}
async function noOverflow(page, name) {
  check(name + ": no horizontal overflow", await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
}
async function command(page, text) {
  await page.keyboard.press("Control+k");
  const search = page.getByRole("combobox", { name: "搜索快捷指令" });
  await search.fill(text); await search.press("Enter");
}
try {
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}) });
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: "reduce" });
  const page = await load(desktop);
  await noOverflow(page, "desktop");
  check("First visit keeps companion closed", await page.locator("[data-model-chat-input]").count() === 0);
  await screenshot(page, "desktop-hero");
  await screenshot(page, "desktop-full", true);
  // Every internal hash resolves, and every new-window link isolates its opener.
  check("All homepage anchors resolve", await page.evaluate(() => Array.from(document.querySelectorAll('a[href^="#"]')).every(a => document.getElementById(a.getAttribute("href").slice(1)))));
  check("All external new-window links isolate opener", await page.evaluate(() => Array.from(document.querySelectorAll('a[target="_blank"]')).every(a => a.rel.includes("noopener"))));
  check("Images decode successfully", await page.evaluate(() => Array.from(document.images).filter(i => i.complete).every(i => i.naturalWidth > 0)));
  await page.getByRole("button", { name: "查看 LuomoOps 详情", exact: true }).click();
  check("Service dialog opens", await page.getByRole("dialog", { name: "LuomoOps 服务详情" }).isVisible());
  await page.keyboard.press("Escape");
  check("Service dialog restores focus", await page.getByRole("button", { name: "查看 LuomoOps 详情", exact: true }).evaluate(el => el === document.activeElement));
  await page.getByRole("button", { name: "浏览全部 6 个世界" }).click();
  check("All six worlds expand", await page.locator("#world-gallery > button").count() === 6);
  await page.getByRole("button", { name: "查看场景：Sakura Shrine", exact: true }).click();
  await page.getByRole("button", { name: "下一张图片" }).click();
  check("Gallery navigation advances", await page.getByRole("dialog").getByRole("heading", { name: "Cyber Stage" }).isVisible());
  await screenshot(page, "gallery-dialog");
  await page.keyboard.press("ArrowLeft"); await page.keyboard.press("Escape");
  check("Gallery restores its trigger focus", await page.getByRole("button", { name: "查看场景：Sakura Shrine", exact: true }).evaluate(el => el === document.activeElement));
  await page.getByRole("button", { name: "收起画廊" }).click();
  const firstTab = page.getByRole("tab", { name: "LuomoOps CHAPTER / 01" });
  await firstTab.focus(); await page.keyboard.press("ArrowRight");
  check("Build tabs support arrow-key selection", await page.getByRole("tab", { name: "LuomoFile CHAPTER / 02" }).getAttribute("aria-selected") === "true");
  await command(page, "theme light");
  check("Light theme is applied", await page.evaluate(() => document.documentElement.dataset.theme === "light"));
  await page.keyboard.press("Escape");
  await page.locator("#services").scrollIntoViewIfNeeded();
  await screenshot(page, "desktop-light");
  await page.reload({ waitUntil: "networkidle" });
  check("Theme survives reload", await page.evaluate(() => document.documentElement.dataset.theme === "light"));
  await command(page, "particles off"); await page.keyboard.press("Escape");
  await command(page, "particles off");
  check("Repeated particle off stays off", await page.evaluate(() => JSON.parse(localStorage.getItem("luomo_prefs_v4")).particlesEnabled === false));
  await screenshot(page, "command-dialog");
  await page.keyboard.press("Escape");
  await command(page, "theme dark"); await page.keyboard.press("Escape");
  await command(page, "status");
  await page.waitForFunction(() => document.querySelector(".command-output")?.textContent?.includes("项服务正常"));
  check("Status command updates after its refresh", await page.locator(".command-output").isVisible());
  await page.keyboard.press("Escape");
  await command(page, "ask atri");
  await page.locator("[data-model-chat-input]").waitFor();
  check("ATRI command opens companion", await page.locator("[data-model-chat-input]").isVisible());
  await page.waitForFunction(() => document.querySelector("[data-model-chat-input]") === document.activeElement, null, { timeout: 5000 });
  check("ATRI command focuses its input", await page.locator("[data-model-chat-input]").evaluate(el => el === document.activeElement));
  await page.locator("[data-model-chat-input]").fill("你好");
  await page.locator("[data-model-chat-send]").click();
  await page.waitForFunction(() => { const button = document.querySelector("[data-model-chat-send]"); return button && !button.disabled; }, null, { timeout: 25000 });
  check("Chat releases input after reply", await page.locator("[data-model-chat-input]").isEditable());
  await screenshot(page, "companion-fallback");
  await desktop.close();

  for (const width of [390, 320, 768]) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: width < 768, hasTouch: true, reducedMotion: "reduce" });
    const mobile = await load(context);
    await noOverflow(mobile, width + "px");
    await screenshot(mobile, "mobile-" + width);
    await mobile.getByRole("button", { name: "打开导航", exact: true }).click();
    check(width + "px mobile navigation expands", await mobile.locator("#mobile-navigation").isVisible());
    await mobile.locator("#mobile-navigation").getByRole("link", { name: "服务入口", exact: true }).click();
    check(width + "px navigation closes after selection", await mobile.locator("#mobile-navigation").count() === 0);
    await noOverflow(mobile, width + "px services");
    await mobile.getByRole("button", { name: "查看 LuomoOps 详情", exact: true }).click();
    await noOverflow(mobile, width + "px service dialog");
    await mobile.keyboard.press("Escape");
    await mobile.locator("#services").scrollIntoViewIfNeeded();
    await screenshot(mobile, "mobile-services-" + width);
    if (width === 390) await screenshot(mobile, "mobile-full", true);
    await mobile.getByRole("button", { name: "打开云端伙伴", exact: true }).click();
    check(width + "px companion opens", await mobile.locator("[data-model-chat-input]").isVisible());
    await noOverflow(mobile, width + "px companion");
    await mobile.getByRole("button", { name: "收起云端伙伴", exact: true }).click();
    await context.close();
  }

  // Deliberately injected failures are separate from screenshots of live API data.
  const failure = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await failure.route("**/api/services", route => route.fulfill({ status: 503, contentType: "application/json", body: '{"error":"test unavailable"}' }));
  const failurePage = await failure.newPage();
  await failurePage.goto(base.href, { waitUntil: "networkidle" });
  check("Failed status request leaves loading and offers retry", await failurePage.getByRole("button", { name: "重新获取", exact: true }).isVisible());
  await failure.unroute("**/api/services");
  await failurePage.getByRole("button", { name: "重新获取", exact: true }).click();
  await failurePage.waitForFunction(() => !Array.from(document.querySelectorAll("button")).some(b => b.textContent === "重试中…"), null, { timeout: 40000 });
  check("Status retry recovers", await failurePage.getByRole("button", { name: "重新获取", exact: true }).count() === 0);
  await failure.close();

  const allDown = await browser.newContext();
  const services = ["ops","file","api","terminal","atri"].map(id => ({ id, name: id, status: "down", latency_ms: null }));
  await allDown.route("**/api/services", route => route.fulfill({ contentType: "application/json", body: JSON.stringify({ services, updated_at: new Date().toISOString() }) }));
  const downPage = await allDown.newPage();
  await downPage.goto(base.href, { waitUntil: "networkidle" });
  check("All-down snapshot displays zero, not endless loading", await downPage.getByRole("link", { name: "0 / 5 项服务正常", exact: true }).isVisible());
  await allDown.close();

  const normal = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: "no-preference" });
  const normalPage = await load(normal);
  const modelRequests = [];
  normalPage.on("request", request => { if (new URL(request.url()).pathname.startsWith("/live2d/")) modelRequests.push(request.url()); });
  await normalPage.getByRole("button", { name: "打开云端伙伴", exact: true }).click();
  await normalPage.locator("[data-model-chat-input]").waitFor();
  const manifest = await (await normalPage.request.get(new URL("/api/companions", base).href)).json();
  await normalPage.waitForTimeout(1000);
  if (!manifest.core.exists) check("Missing models avoid runtime asset requests", modelRequests.length === 0);
  await screenshot(normalPage, "companion-standard");
  await normal.close();

  const chatFailure = await browser.newContext();
  let chatRequests = 0;
  await chatFailure.route("**/api/atri/brain", route => { chatRequests++; return route.fulfill({ status: 429, contentType: "application/json", body: '{"ok":false,"error":"rate_limit_exceeded"}' }); });
  const chatPage = await chatFailure.newPage();
  await chatPage.goto(base.href, { waitUntil: "networkidle" });
  await command(chatPage, "ask atri");
  const chatInput = chatPage.locator("[data-model-chat-input]");
  await chatInput.fill("保留这条消息");
  await chatInput.evaluate(el => el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, isComposing: true })));
  check("IME Enter does not send an unfinished message", chatRequests === 0);
  await chatPage.locator("[data-model-chat-send]").click();
  await chatPage.locator(".companion-panel [role=alert]").waitFor();
  check("Chat HTTP error preserves the draft", await chatInput.inputValue() === "保留这条消息");
  check("Chat error releases the input lock", await chatInput.isEditable());
  await chatFailure.unroute("**/api/atri/brain");
  await chatPage.locator("[data-model-chat-send]").click();
  await chatPage.waitForFunction(() => document.querySelector("[data-model-chat-input]")?.value === "");
  check("Chat can retry after an HTTP error", await chatPage.locator(".companion-panel [role=alert]").count() === 0);
  await chatFailure.close();
  check("No unexpected browser errors in real-data flows", errors.length === 0);
  console.log("Browser verification passed: " + checks.length + " checks; " + report.screenshots.length + " screenshots in " + runDir);
} catch (error) {
  errors.push(error instanceof Error ? error.message : String(error));
  console.error("Browser verification failed:", errors.at(-1));
  process.exitCode = 1;
} finally {
  await browser?.close();
  writeFileSync(join(runDir, "verification.json"), JSON.stringify(report, null, 2) + "\n");
}
