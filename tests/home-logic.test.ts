import { describe, expect, it } from "vitest";
import { addAffection, AFFECTION_MAX, HEART_COUNT, heartsFor, parseAffection } from "../lib/home/affection";
import { ACHIEVEMENTS, parseAchievements } from "../lib/home/achievements";
import { moonLitPath, moonPhase, SYNODIC_MONTH } from "../lib/home/moon";
import { dayKey, drawFortune } from "../lib/home/omikuji";
import { EMPTY_WISH_STATE, fiveStarRate, HARD_PITY, parseWishState, pullMany, SOFT_PITY, type WishPool } from "../lib/home/wish";
import { BANNERS, wishPool } from "../content/wish";

const POOL: WishPool = {
  five: [{ id: "up", name: "UP", rarity: 5, blurb: "" }, { id: "std", name: "STD", rarity: 5, blurb: "" }],
  four: [{ id: "four", name: "FOUR", rarity: 4, blurb: "" }],
  three: [{ id: "three", name: "THREE", rarity: 3, blurb: "" }],
};
const unlucky = () => 0.99;

describe("wish pity", () => {
  it("keeps the base rate until soft pity and guarantees a five-star at hard pity", () => {
    expect(fiveStarRate(0)).toBe(0.006);
    expect(fiveStarRate(SOFT_PITY - 2)).toBe(0.006);
    expect(fiveStarRate(SOFT_PITY - 1)).toBeCloseTo(0.066);
    expect(fiveStarRate(HARD_PITY - 1)).toBe(1);
  });

  it("forces a four-star every ten pulls without a higher drop", () => {
    const { results, state } = pullMany(EMPTY_WISH_STATE, POOL, "up", 10, unlucky);
    expect(results.slice(0, 9).every(result => result.item.rarity === 3)).toBe(true);
    expect(results[9].item.rarity).toBe(4);
    expect(state.pity4).toBe(0);
    expect(state.pity5).toBe(10);
  });

  it("loses the first 50/50 at hard pity, then guarantees the banner item", () => {
    const first = pullMany(EMPTY_WISH_STATE, POOL, "up", HARD_PITY, unlucky);
    const gold = first.results[HARD_PITY - 1];
    expect(first.results.slice(0, HARD_PITY - 1).some(result => result.item.rarity === 5)).toBe(false);
    expect(gold.item.id).toBe("std");
    expect(gold.lost).toBe(true);
    expect(first.state.guaranteed).toBe(true);

    const second = pullMany(first.state, POOL, "up", HARD_PITY, unlucky);
    const next = second.results[HARD_PITY - 1];
    expect(next.item.id).toBe("up");
    expect(next.lost).toBe(false);
    expect(second.state.guaranteed).toBe(false);
    expect(second.state.total).toBe(HARD_PITY * 2);
  });

  it("rejects tampered or corrupted saved state", () => {
    expect(parseWishState("{not json")).toEqual(EMPTY_WISH_STATE);
    const parsed = parseWishState(JSON.stringify({ pity5: 9999, pity4: -3, guaranteed: "yes", total: 4.5, history: [{ id: "x", rarity: 6, at: 1 }, { id: "ok", rarity: 4, at: 2 }] }));
    expect(parsed.pity5).toBe(0);
    expect(parsed.pity4).toBe(0);
    expect(parsed.guaranteed).toBe(false);
    expect(parsed.total).toBe(0);
    expect(parsed.history).toEqual([{ id: "ok", rarity: 4, lost: false, at: 2 }]);
  });

  it("ships a pool with unique ids and one five-star per banner", () => {
    const pool = wishPool();
    const ids = [...pool.five, ...pool.four, ...pool.three].map(item => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(pool.five.map(item => item.id)).toEqual(BANNERS.map(banner => banner.id));
    expect(pool.four.every(item => item.rarity === 4)).toBe(true);
    expect(pool.three.every(item => item.rarity === 3)).toBe(true);
  });
});

describe("moon phase", () => {
  const reference = Date.UTC(2000, 0, 6, 18, 14);

  it("matches the reference new moon and the following full moon", () => {
    expect(moonPhase(new Date(reference)).name).toBe("新月");
    const full = moonPhase(new Date(reference + (SYNODIC_MONTH / 2) * 86_400_000));
    expect(full.name).toBe("满月");
    expect(full.illumination).toBeCloseTo(1, 5);
  });

  it("lands on real full moons within the naming window", () => {
    for (const iso of ["2025-10-07T03:47:00Z", "2026-01-03T10:03:00Z", "2026-09-26T16:49:00Z"]) {
      expect(moonPhase(new Date(iso)).name).toBe("满月");
    }
  });

  it("draws a finite SVG path for every fraction", () => {
    for (let i = 0; i <= 20; i++) {
      const path = moonLitPath(i / 20, 60);
      expect(path).toMatch(/^M 60 0 A /);
      expect(path).not.toMatch(/NaN|Infinity/);
    }
  });
});

describe("omikuji", () => {
  it("is deterministic per key and never recommends and forbids the same thing", () => {
    expect(drawFortune("seed:2026-10-09")).toEqual(drawFortune("seed:2026-10-09"));
    for (let i = 0; i < 500; i++) {
      const fortune = drawFortune(`k${i}:2026-10-09`);
      expect(fortune.good).not.toBe(fortune.bad);
      expect(fortune.number).toBeGreaterThanOrEqual(1);
      expect(fortune.number).toBeLessThanOrEqual(99);
    }
  });

  it("reaches every rank", () => {
    const ranks = new Set(Array.from({ length: 3000 }, (_, i) => drawFortune(`spread-${i}`).rank));
    expect([...ranks].sort()).toEqual(["中吉", "凶", "吉", "大吉", "小吉", "末吉"].sort());
  });

  it("formats local day keys with zero padding", () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });
});

describe("affection", () => {
  it("parses only well-formed companion entries", () => {
    expect(parseAffection(null)).toEqual({});
    expect(parseAffection("[1,2]")).toEqual({});
    expect(parseAffection(JSON.stringify({ atri: 7.8, "Bad Key": 3, allium: -4, congyu: 999, x: "5" }))).toEqual({ atri: 7, allium: 0, congyu: AFFECTION_MAX });
  });

  it("fills one heart per step and caps at the maximum", () => {
    expect(heartsFor(undefined)).toBe(0);
    expect(heartsFor(AFFECTION_MAX / HEART_COUNT - 1)).toBe(0);
    expect(heartsFor(AFFECTION_MAX / HEART_COUNT)).toBe(1);
    expect(heartsFor(AFFECTION_MAX * 3)).toBe(HEART_COUNT);
  });

  it("reports when a heart is gained and stops changing at the cap", () => {
    const first = addAffection({}, "atri", 2);
    expect(first).toMatchObject({ changed: true, rose: false, hearts: 0 });
    const second = addAffection(first.next, "atri", 2);
    expect(second).toMatchObject({ changed: true, rose: true, hearts: 1 });
    const full = addAffection({ atri: AFFECTION_MAX - 1 }, "atri", 5);
    expect(full).toMatchObject({ changed: true, rose: true, hearts: HEART_COUNT });
    expect(full.next.atri).toBe(AFFECTION_MAX);
    expect(addAffection(full.next, "atri", 1).changed).toBe(false);
  });
});

describe("achievements", () => {
  it("keeps unique ids and drops unknown saved entries", () => {
    const ids = ACHIEVEMENTS.map(entry => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(parseAchievements(JSON.stringify(["ticket", "hacked", 3, "terminus"]))).toEqual(["ticket", "terminus"]);
    expect(parseAchievements("oops")).toEqual([]);
  });
});
