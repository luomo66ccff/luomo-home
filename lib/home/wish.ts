export type Rarity = 3 | 4 | 5;

export type WishItem = {
  id: string;
  name: string;
  rarity: Rarity;
  blurb: string;
  href?: string;
};

export type WishState = {
  pity5: number;
  pity4: number;
  guaranteed: boolean;
  total: number;
  history: { id: string; rarity: Rarity; lost: boolean; at: number }[];
};

export type WishPool = { five: WishItem[]; four: WishItem[]; three: WishItem[] };

export type WishResult = { item: WishItem; lost: boolean };

export const WISH_COST = 160;
export const HARD_PITY = 90;
export const SOFT_PITY = 74;
const FOUR_PITY = 10;
const HISTORY_LIMIT = 60;

export const EMPTY_WISH_STATE: WishState = { pity5: 0, pity4: 0, guaranteed: false, total: 0, history: [] };

export function fiveStarRate(pullsSinceFive: number): number {
  const nth = pullsSinceFive + 1;
  if (nth >= HARD_PITY) return 1;
  if (nth < SOFT_PITY) return 0.006;
  return Math.min(1, 0.006 + (nth - SOFT_PITY + 1) * 0.06);
}

function pick<T>(list: T[], rng: () => number): T {
  return list[Math.min(list.length - 1, Math.floor(rng() * list.length))];
}

export function pullOnce(state: WishState, pool: WishPool, upId: string, rng: () => number = Math.random): { result: WishResult; state: WishState } {
  const roll = rng();
  let rarity: Rarity = 3;
  if (roll < fiveStarRate(state.pity5)) rarity = 5;
  else if (state.pity4 + 1 >= FOUR_PITY || roll < fiveStarRate(state.pity5) + 0.051) rarity = 4;

  let item: WishItem;
  let lost = false;
  let guaranteed = state.guaranteed;
  if (rarity === 5) {
    const up = pool.five.find(entry => entry.id === upId) ?? pool.five[0];
    const others = pool.five.filter(entry => entry.id !== up.id);
    if (guaranteed || !others.length || rng() < 0.5) {
      item = up;
      guaranteed = false;
    } else {
      item = pick(others, rng);
      lost = true;
      guaranteed = true;
    }
  } else {
    item = pick(rarity === 4 ? pool.four : pool.three, rng);
  }

  const next: WishState = {
    pity5: rarity === 5 ? 0 : state.pity5 + 1,
    pity4: rarity >= 4 ? 0 : state.pity4 + 1,
    guaranteed,
    total: state.total + 1,
    history: [{ id: item.id, rarity, lost, at: Date.now() }, ...state.history].slice(0, HISTORY_LIMIT),
  };
  return { result: { item, lost }, state: next };
}

export function pullMany(state: WishState, pool: WishPool, upId: string, count: number, rng: () => number = Math.random) {
  const results: WishResult[] = [];
  let current = state;
  for (let i = 0; i < count; i++) {
    const step = pullOnce(current, pool, upId, rng);
    results.push(step.result);
    current = step.state;
  }
  return { results, state: current };
}

export function parseWishState(raw: string | null): WishState {
  try {
    const data = raw ? JSON.parse(raw) : null;
    if (!data || typeof data !== "object") return EMPTY_WISH_STATE;
    const int = (value: unknown, max: number) => (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= max ? value : 0);
    const history = Array.isArray(data.history)
      ? data.history
          .filter((entry: unknown): entry is WishState["history"][number] => {
            if (!entry || typeof entry !== "object") return false;
            const e = entry as Record<string, unknown>;
            return typeof e.id === "string" && (e.rarity === 3 || e.rarity === 4 || e.rarity === 5) && typeof e.at === "number";
          })
          .map((entry: WishState["history"][number]) => ({ id: entry.id, rarity: entry.rarity, lost: Boolean(entry.lost), at: entry.at }))
          .slice(0, HISTORY_LIMIT)
      : [];
    return {
      pity5: int(data.pity5, HARD_PITY - 1),
      pity4: int(data.pity4, FOUR_PITY - 1),
      guaranteed: data.guaranteed === true,
      total: int(data.total, Number.MAX_SAFE_INTEGER),
      history,
    };
  } catch {
    return EMPTY_WISH_STATE;
  }
}
