import { describe, expect, it } from "vitest";
import { readJsonObject } from "../lib/request-body";
import { normalizeBrainOutput } from "../lib/atri-brain/normalize";
const request = (body: string) => new Request("https://example.com/chat", { method: "POST", body });
describe("chat body and output validation", () => {
  it.each(["null", "[]", '"hello"', "12", "{bad json", ""])("rejects invalid object body %s as a client error", async body => {
    await expect(readJsonObject(request(body))).rejects.toMatchObject({ status: 400 });
  });
  it("rejects oversized streamed bodies without requiring Content-Length", async () => {
    await expect(readJsonObject(request(JSON.stringify({ message: "x".repeat(17000) })))).rejects.toMatchObject({ status: 413 });
  });
  it("accepts an ordinary UTF-8 message", async () => { expect(await readJsonObject(request('{"message":"你好"}'))).toEqual({ message: "你好" }); });
  it("does not convert provider rejection into success", () => {
    expect(normalizeBrainOutput({ ok: false, text: "Unavailable", source: "ai" }, false, false)).toMatchObject({ ok: false, source: "fallback" });
  });
  it("rejects empty response text", () => { expect(normalizeBrainOutput({ ok: true, text: "  " }, false, false).ok).toBe(false); });
});
