import type { WishItem } from "@/lib/home/wish";
import { Butterfly, Glyph, Lily, Pick, Spark, TrainGlyph } from "../art/Icons";

function hashIndex(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export default function WishItemIcon({ item, size = 44 }: { item: WishItem; size?: number }) {
  switch (item.id) {
    case "ticket": return <TrainGlyph size={size} />;
    case "lilies": return <span style={{ display: "inline-flex" }}><Lily size={size * 0.7} /><Lily size={size * 0.7} color="var(--lily-blue)" /></span>;
    case "butterfly": return <Butterfly size={size} />;
    case "pick": return <Pick size={size * 0.8} />;
    case "ciallo": return <Spark size={size * 0.8} />;
    case "mango":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
          <path d="M6 14L20 8L34 14V30L20 36L6 30Z" fill="#d9a35f" stroke="#7a5428" strokeWidth="1.4" />
          <path d="M6 14L20 20L34 14M20 20V36" fill="none" stroke="#7a5428" strokeWidth="1.4" />
          <path d="M10 22L16 25M10 26L16 29" stroke="#f2c230" strokeWidth="2" strokeLinecap="round" />
          <circle cx="26" cy="27" r="1.2" fill="#2b2442" /><circle cx="29" cy="25.6" r="1.2" fill="#2b2442" />
        </svg>
      );
    case "ramune":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
          <path d="M16 4H24V10C24 13 28 14 28 19V34C28 36 26 37 20 37C14 37 12 36 12 34V19C12 14 16 13 16 10Z" fill="#8fe0ff" fillOpacity=".55" stroke="#3fa8e8" strokeWidth="1.4" />
          <circle cx="20" cy="13" r="3.2" fill="#e8fbff" stroke="#3fa8e8" />
          <path d="M14 24H26" stroke="#ffffff" strokeWidth="3" opacity=".7" />
        </svg>
      );
    case "omamori":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
          <path d="M12 10C12 6 28 6 28 10V34H12Z" fill="#c4384b" stroke="#7a1f2c" strokeWidth="1.2" />
          <path d="M16 6C16 2 24 2 24 6" fill="none" stroke="#f2c230" strokeWidth="1.6" />
          <path d="M20 14V28M17 25L20 28L23 25" stroke="#f2c230" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "emergency":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
          <ellipse cx="20" cy="10" rx="11" ry="3.4" fill="none" stroke="#ffcf6b" strokeWidth="1.6" />
          <circle cx="20" cy="24" r="10" fill="#fff6e6" stroke="#c8b8ff" strokeWidth="1.4" />
          <path d="M20 17L22 22L27 22L23 25L24.6 30L20 27L15.4 30L17 25L13 22L18 22Z" fill="#c49cff" />
        </svg>
      );
    case "strawhat":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
          <ellipse cx="20" cy="25" rx="17" ry="6.5" fill="#f3d58a" stroke="#b98a3c" strokeWidth="1.3" />
          <path d="M11 24C11 14 15 10 20 10C25 10 29 14 29 24C25 26.5 15 26.5 11 24Z" fill="#f7e1a4" stroke="#b98a3c" strokeWidth="1.3" />
          <path d="M11.4 21C16 23.2 24 23.2 28.6 21" fill="none" stroke="#4f8fe0" strokeWidth="2.4" />
          <path d="M30 13l3-3m-1 3l3 0" stroke="#8fe0ff" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "heart":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
          <path d="M20 34L7 21A7.5 7.5 0 0 1 20 11A7.5 7.5 0 0 1 33 21Z" fill="#ff8fb1" fillOpacity=".7" stroke="#ff5c8a" strokeWidth="1.4" />
          <path d="M20 11L17 18L22 22L19 28" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="12" cy="17" r="1.6" fill="#fff" opacity=".8" />
        </svg>
      );
    case "yuzu":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
          <circle cx="20" cy="23" r="12" fill="#f6c93b" stroke="#c99a1c" strokeWidth="1.3" />
          <path d="M20 11C20 8 21 6 23 5" fill="none" stroke="#6b8a35" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M22 8C26 5 31 6 32 9C28 11 24 11 22 8Z" fill="#7fb04a" />
          {[[15, 20], [24, 18], [19, 27], [26, 26], [14, 26]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r=".9" fill="#c99a1c" opacity=".6" />)}
        </svg>
      );
    default:
      return <Glyph index={hashIndex(item.id)} size={size * 0.8} />;
  }
}
