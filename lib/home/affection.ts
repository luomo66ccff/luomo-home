export const AFFECTION_MAX = 20;
export const HEART_COUNT = 5;
const STEP = AFFECTION_MAX / HEART_COUNT;

export type AffectionMap = Record<string, number>;

export function parseAffection(raw: string | null): AffectionMap {
  try {
    const data = raw ? JSON.parse(raw) : null;
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    const result: AffectionMap = {};
    for (const [id, value] of Object.entries(data)) {
      if (/^[a-z][a-z0-9-]{0,23}$/.test(id) && typeof value === "number" && Number.isFinite(value)) {
        result[id] = Math.max(0, Math.min(AFFECTION_MAX, Math.floor(value)));
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function heartsFor(points: number | undefined): number {
  return Math.min(HEART_COUNT, Math.floor((points ?? 0) / STEP));
}

export function addAffection(map: AffectionMap, id: string, amount: number) {
  const before = map[id] ?? 0;
  const after = Math.max(0, Math.min(AFFECTION_MAX, before + amount));
  return { next: { ...map, [id]: after }, changed: after !== before, rose: heartsFor(after) > heartsFor(before), hearts: heartsFor(after) };
}
