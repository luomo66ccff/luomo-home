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
const launchOptions = {
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
};

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
  await page.waitForFunction(() => !document.documentElement.dataset.boot, null, { timeout: 8000 });
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
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  }
  await page.screenshot({ path: join(runDir, name + ".png"), fullPage, animations: "disabled" });
  if (fullPage) await page.evaluate(y => window.scrollTo({ top: y, behavior: "instant" }), originalScroll);
  report.screenshots.push(name + ".png");
}
async function noOverflow(page, name) {
  check(name + ": no horizontal overflow", await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
}
async function command(page, text) {
  await page.keyboard.press("Control+k");
  const search = page.getByRole("combobox", { name: "搜索传送锚点" });
  await search.waitFor();
  await search.fill(text);
  await search.press("Enter");
}
const isFocused = locator => locator.evaluate(el => el === document.activeElement);

try {
  browser = await chromium.launch(launchOptions);
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: "reduce" });
  const page = await load(desktop);
  await noOverflow(page, "desktop");
  check("First visit keeps companion closed", await page.locator("[data-model-chat-input]").count() === 0);
  check("Service names are server-rendered", (await page.locator("#services").textContent()).includes("LuomoOps"));
  await screenshot(page, "desktop-hero");
  await screenshot(page, "desktop-full", true);
  check("All homepage anchors resolve", await page.evaluate(() => Array.from(document.querySelectorAll('a[href^="#"]')).every(a => document.getElementById(a.getAttribute("href").slice(1)))));
  check("All external new-window links isolate opener", await page.evaluate(() => Array.from(document.querySelectorAll('a[target="_blank"]')).every(a => a.rel.includes("noopener"))));
  check("Images decode successfully", await page.evaluate(() => Array.from(document.images).filter(i => i.complete).every(i => i.naturalWidth > 0)));
  check("Self-hosted fonts load", await page.evaluate(async () => { await document.fonts.ready; return ["stationDisplay", "wenkai"].every(name => [...document.fonts].some(f => f.family.includes(name) && f.status === "loaded")); }));

  // Station map dialog.
  const station = page.locator("#services").getByRole("button", { name: /^监控空间站（LuomoOps）/ });
  await station.click();
  check("Station dialog opens", await page.getByRole("dialog", { name: "监控空间站 站点详情" }).isVisible());
  await page.keyboard.press("Escape");
  check("Station dialog restores focus", await isFocused(station));

  // Wish: reduced motion skips the meteor and shows the result directly.
  const firstTab = page.getByRole("tab", { name: "LuomoOps" });
  await firstTab.focus(); await page.keyboard.press("ArrowRight");
  check("Wish tabs support arrow-key selection", await page.getByRole("tab", { name: "LuomoFile" }).getAttribute("aria-selected") === "true");
  await page.locator("#projects").getByRole("button", { name: /×10/ }).click();
  const wishDialog = page.getByRole("dialog", { name: "祈愿结果" });
  await wishDialog.getByRole("button", { name: "确认" }).waitFor();
  check("Ten-pull shows ten cards", await wishDialog.locator("li").count() === 10);
  await screenshot(page, "wish-result");
  await wishDialog.getByRole("button", { name: "确认" }).click();
  check("Wish history persists", await page.evaluate(() => (JSON.parse(localStorage.getItem("luomo:wish:v1") || "{}").history || []).length >= 10));

  // CG viewer.
  const firstCg = page.getByRole("button", { name: /^开往群星的末班车/ });
  await firstCg.click();
  await page.getByRole("dialog", { name: "CG 鉴赏：开往群星的末班车" }).waitFor();
  await page.keyboard.press("ArrowRight");
  check("CG viewer navigation advances", await page.getByRole("dialog", { name: "CG 鉴赏：竹林里，有光" }).isVisible());
  await screenshot(page, "cg-viewer");
  await page.keyboard.press("Escape");
  check("CG viewer restores its trigger focus", await isFocused(firstCg));

  // Theme via command palette, persisted through reload.
  const themeIs = theme => page.waitForFunction(value => document.documentElement.dataset.theme === value, theme, { timeout: 3000 }).then(() => true, () => false);
  await command(page, "theme light");
  check("Light theme is applied", await themeIs("light"));
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await screenshot(page, "desktop-light");
  await page.reload({ waitUntil: "networkidle" });
  check("Theme survives reload", await page.evaluate(() => document.documentElement.dataset.theme === "light"));
  await command(page, "theme dark");
  check("Dark theme is restored", await themeIs("dark"));

  // CONFIG: particles switch persists in the shared preference store.
  await page.getByRole("button", { name: "打开 CONFIG 设置" }).click();
  const config = page.getByRole("dialog", { name: "CONFIG 设置" });
  const particles = config.getByRole("switch", { name: "指尖星尘" });
  const before = await particles.getAttribute("aria-checked");
  await particles.click();
  check("Particle preference toggles", await page.evaluate(expected => String(JSON.parse(localStorage.getItem("luomo_prefs_v4")).particlesEnabled) === expected, before === "true" ? "false" : "true"));
  await screenshot(page, "config-dialog");
  await page.keyboard.press("Escape");

  // Keyboard greeting.
  await page.locator("body").click({ position: { x: 5, y: 400 } });
  await page.keyboard.type("ciallo");
  check("Ciallo greeting toasts", await page.getByText("Ciallo～(∠・ω< )⌒★").first().isVisible());

  // ATRI through the command palette.
  await command(page, "atri");
  await page.locator("[data-model-chat-input]").waitFor();
  check("ATRI command opens companion", await page.locator("[data-model-chat-input]").isVisible());
  await page.waitForFunction(() => document.querySelector("[data-model-chat-input]") === document.activeElement, null, { timeout: 5000 });
  check("ATRI command focuses its input", await isFocused(page.locator("[data-model-chat-input]")));
  await page.locator("[data-model-chat-input]").fill("你好");
  await page.locator("[data-model-chat-send]").click();
  await page.waitForFunction(() => { const button = document.querySelector("[data-model-chat-send]"); return button && !button.disabled; }, null, { timeout: 25000 });
  check("Chat releases input after reply", await page.locator("[data-model-chat-input]").isEditable());
  check("Chat shows the sent bubble", await page.locator(".phone .bubble.me", { hasText: "你好" }).count() >= 1);
  await screenshot(page, "companion-fallback");
  await desktop.close();

  for (const width of [390, 320, 768]) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: width < 768, hasTouch: true, reducedMotion: "reduce" });
    const mobile = await load(context);
    await noOverflow(mobile, width + "px");
    await screenshot(mobile, "mobile-" + width);
    await mobile.getByRole("button", { name: /打开传送锚点/ }).click();
    const search = mobile.getByRole("combobox", { name: "搜索传送锚点" });
    await search.fill("星轨"); await search.press("Enter");
    check(width + "px palette closes after selection", await mobile.getByRole("dialog", { name: "传送锚点" }).count() === 0);
    await mobile.waitForFunction(() => Math.abs(document.getElementById("services").getBoundingClientRect().top) < 120, null, { timeout: 5000 });
    await noOverflow(mobile, width + "px services");
    const stripButton = mobile.locator("#services button:visible", { hasText: "LuomoOps" }).first();
    await stripButton.click();
    await noOverflow(mobile, width + "px station dialog");
    await mobile.keyboard.press("Escape");
    await screenshot(mobile, "mobile-services-" + width);
    if (width === 390) await screenshot(mobile, "mobile-full", true);
    await mobile.getByRole("button", { name: /^打开乘务员通讯/ }).click();
    check(width + "px companion opens", await mobile.locator("[data-model-chat-input]").waitFor({ timeout: 5000 }).then(() => true, () => false));
    await noOverflow(mobile, width + "px companion");
    if (width === 390) await screenshot(mobile, "mobile-companion");
    await mobile.getByRole("button", { name: "收起通讯", exact: true }).click();
    check(width + "px companion closes", await mobile.locator("[data-model-chat-input]").count() === 0);
    await context.close();
  }

  // Deliberately injected failures are separate from screenshots of live API data.
  const failure = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  await failure.route("**/api/services", route => route.fulfill({ status: 503, contentType: "application/json", body: '{"error":"test unavailable"}' }));
  const failurePage = await failure.newPage();
  await failurePage.goto(base.href, { waitUntil: "networkidle" });
  const refresh = failurePage.locator("#operations").getByRole("button", { name: "刷新" });
  await refresh.waitFor();
  check("Failed status request leaves loading and offers refresh", await refresh.isEnabled());
  await failure.unroute("**/api/services");
  await refresh.click();
  await failurePage.waitForFunction(() => /运营\s*\d+\/5/.test(document.querySelector("#operations")?.textContent || ""), null, { timeout: 40000 });
  check("Status refresh recovers", true);
  await failure.close();

  const allDown = await browser.newContext({ reducedMotion: "reduce" });
  const services = ["ops", "file", "api", "terminal", "atri"].map(id => ({ id, name: id, status: "down", latency_ms: null }));
  await allDown.route("**/api/services", route => route.fulfill({ contentType: "application/json", body: JSON.stringify({ services, updated_at: new Date().toISOString() }) }));
  const downPage = await allDown.newPage();
  await downPage.goto(base.href, { waitUntil: "networkidle" });
  await downPage.waitForFunction(() => /运营\s*0\/5/.test(document.querySelector("#operations")?.textContent || ""), null, { timeout: 10000 });
  check("All-down snapshot displays zero, not endless loading", (await downPage.locator("#operations").textContent()).includes("停运"));
  await allDown.close();

  const normal = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: "no-preference" });
  const normalPage = await load(normal);
  const modelRequests = [];
  normalPage.on("request", request => { if (new URL(request.url()).pathname.startsWith("/live2d/")) modelRequests.push(request.url()); });
  await normalPage.getByRole("button", { name: /^打开乘务员通讯/ }).click();
  await normalPage.locator("[data-model-chat-input]").waitFor();
  const manifest = await (await normalPage.request.get(new URL("/api/companions", base).href)).json();
  await normalPage.waitForTimeout(1000);
  if (!manifest.core.exists) check("Missing models avoid runtime asset requests", modelRequests.length === 0);
  await screenshot(normalPage, "companion-standard");
  await normal.close();

  const chatFailure = await browser.newContext({ reducedMotion: "reduce" });
  let chatRequests = 0;
  await chatFailure.route("**/api/atri/brain", route => { chatRequests++; return route.fulfill({ status: 429, contentType: "application/json", body: '{"ok":false,"error":"rate_limit_exceeded"}' }); });
  const chatPage = await chatFailure.newPage();
  captureErrors(chatPage);
  await chatPage.goto(base.href, { waitUntil: "networkidle" });
  await command(chatPage, "atri");
  const chatInput = chatPage.locator("[data-model-chat-input]");
  await chatInput.fill("保留这条消息");
  await chatInput.evaluate(el => el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, isComposing: true })));
  check("IME Enter does not send an unfinished message", chatRequests === 0);
  await chatPage.locator("[data-model-chat-send]").click();
  await chatPage.locator(".phone [role=alert]").waitFor();
  check("Chat HTTP error preserves the draft", await chatInput.inputValue() === "保留这条消息");
  check("Chat error releases the input lock", await chatInput.isEditable());
  await chatFailure.unroute("**/api/atri/brain");
  await chatPage.locator("[data-model-chat-send]").click();
  await chatPage.waitForFunction(() => document.querySelector("[data-model-chat-input]")?.value === "");
  check("Chat can retry after an HTTP error", await chatPage.locator(".phone [role=alert]").count() === 0);
  await chatFailure.close();
  const unexpected = errors.filter(message => !/status of 429|status of 503|Failed to load resource/.test(message));
  check("No unexpected browser errors", unexpected.length === 0);
  console.log("Browser verification passed: " + checks.length + " checks; " + report.screenshots.length + " screenshots in " + runDir);
} catch (error) {
  errors.push(error instanceof Error ? error.message : String(error));
  console.error("Browser verification failed:", errors.at(-1));
  process.exitCode = 1;
} finally {
  await browser?.close();
  writeFileSync(join(runDir, "verification.json"), JSON.stringify(report, null, 2) + "\n");
}
