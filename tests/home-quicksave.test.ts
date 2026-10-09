import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { quickLoad, quickSave } from "../lib/home/quicksave";
import { KEYS } from "../lib/home/store";

vi.mock("../lib/home/achievements", () => ({ unlock: vi.fn() }));

describe("quick saves with deferred section layout", () => {
  const storage = new Map<string, string>();
  const root = { dataset: {} as Record<string, string> };
  const scrollTo = vi.fn();
  const getRect = vi.fn(() => ({ top: -220, bottom: 655 }));
  const removeEventListener = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    storage.clear();
    root.dataset = {};
    scrollTo.mockClear();
    getRect.mockReset().mockReturnValue({ top: -220, bottom: 655 });
    removeEventListener.mockClear();
    vi.stubGlobal("window", {
      scrollY: 4800,
      innerHeight: 844,
      scrollTo,
      matchMedia: (query: string) => ({ matches: query.includes("max-width") }),
      dispatchEvent: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener,
      setTimeout,
      clearTimeout,
    });
    vi.stubGlobal("document", {
      documentElement: root,
      getElementById: (id: string) => id === "services" ? { getBoundingClientRect: getRect } : null,
    });
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("stores the section offset as well as the legacy absolute position", () => {
    quickSave();
    expect(JSON.parse(storage.get(KEYS.quickSave)!)).toMatchObject({ y: 4800, section: "services", offset: 220 });
  });

  it("realizes mobile layout before restoring the offset despite changed preceding heights", () => {
    storage.set(KEYS.quickSave, JSON.stringify({ y: 4800, section: "services", at: 123, offset: 220 }));
    getRect.mockImplementation(() => {
      expect(root.dataset.homePositioning).toBe("true");
      return { top: 1300, bottom: 2175 };
    });
    quickLoad();
    expect(scrollTo).toHaveBeenCalledWith({ top: 6320, behavior: "smooth" });
    vi.advanceTimersByTime(2500);
    expect(root.dataset.homePositioning).toBeUndefined();
    expect(removeEventListener).toHaveBeenCalledWith("scrollend", expect.any(Function));
  });

  it("keeps old saves and malformed optional offsets compatible", () => {
    storage.set(KEYS.quickSave, JSON.stringify({ y: 5000, section: "services", at: 123, offset: "bad" }));
    quickLoad();
    expect(scrollTo).toHaveBeenCalledWith({ top: 5000, behavior: "smooth" });
  });

  it("rejects corrupt saves without starting a scroll or forcing layout", () => {
    storage.set(KEYS.quickSave, JSON.stringify({ y: null, section: "services", at: 123 }));
    quickLoad();
    expect(scrollTo).not.toHaveBeenCalled();
    expect(root.dataset.homePositioning).toBeUndefined();
  });
});
