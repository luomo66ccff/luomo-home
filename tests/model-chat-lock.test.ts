import { afterEach, describe, expect, it } from "vitest";
import {
  acquireModelChatLock,
  isModelChatLocked,
  releaseModelChatLock,
} from "../lib/modelChatLock";

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;

function installDomStubs() {
  const eventTarget = new EventTarget();
  (globalThis as Record<string, unknown>).window = eventTarget;
  (globalThis as Record<string, unknown>).document = {
    querySelectorAll: () => [],
  };
}

afterEach(() => {
  releaseModelChatLock();
  (globalThis as Record<string, unknown>).window = originalWindow;
  (globalThis as Record<string, unknown>).document = originalDocument;
});

describe("model chat lock", () => {
  it("releases idempotently and protects a newer owner token", () => {
    installDomStubs();
    const first = acquireModelChatLock();
    expect(first).not.toBeNull();
    expect(acquireModelChatLock()).toBeNull();
    expect(releaseModelChatLock(first!)).toBe(true);
    expect(releaseModelChatLock(first!)).toBe(false);

    const second = acquireModelChatLock();
    expect(second).not.toBeNull();
    expect(releaseModelChatLock(first!)).toBe(false);
    expect(isModelChatLocked()).toBe(true);
    expect(releaseModelChatLock(second!)).toBe(true);
    expect(isModelChatLocked()).toBe(false);
  });
});
