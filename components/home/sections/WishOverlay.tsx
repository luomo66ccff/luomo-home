"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import BannerArt from "../art/BannerArt";
import WishItemIcon from "./WishItemIcon";
import { BANNERS } from "@/content/wish";
import type { Rarity, WishResult } from "@/lib/home/wish";
import { unlock } from "@/lib/home/achievements";
import { chime } from "@/lib/home/sound";
import { toast } from "@/lib/home/store";
import { useReducedMotion } from "@/lib/home/hooks";
import s from "./wish.module.css";

const STARS: Record<Rarity, string> = { 3: "★★★", 4: "★★★★", 5: "★★★★★" };

function ResultCard({ result, index, single }: { result: WishResult; index: number; single?: boolean }) {
  const { item, lost } = result;
  const banner = item.rarity === 5 ? BANNERS.find(entry => entry.id === item.id) : undefined;
  return (
    <li className={`${s.card} ${single ? s.cardSingle : ""}`} data-rarity={item.rarity} style={{ animationDelay: `${index * 90}ms` }}>
      <div className={s.cardArt}>
        {banner ? <BannerArt art={banner.art} uid={`res-${index}-${banner.id}`} className={s.cardBanner} /> : <span className={s.cardIcon}><WishItemIcon item={item} size={single ? 96 : 52} /></span>}
        {lost && <span className={s.lost}>歪了</span>}
      </div>
      <div className={s.cardText}>
        <span className={s.cardStars} aria-label={`${item.rarity} 星`}>{STARS[item.rarity]}</span>
        <strong>{item.name}</strong>
        {(single || item.rarity === 5) && <small>{item.blurb}</small>}
        {item.href && <a href={item.href} target="_blank" rel="noopener noreferrer" className={s.cardLink}>前往看看 ↗</a>}
      </div>
    </li>
  );
}

export default function WishOverlay({ results, onClose }: { results: WishResult[]; onClose: () => void }) {
  const reduce = useReducedMotion();
  const best = useMemo(() => results.reduce<Rarity>((max, entry) => (entry.item.rarity > max ? entry.item.rarity : max), 3), [results]);
  const sorted = useMemo(() => [...results].sort((a, b) => b.item.rarity - a.item.rarity), [results]);
  const [phase, setPhase] = useState<"meteor" | "result">("meteor");

  useEffect(() => {
    if (reduce) { setPhase("result"); return; }
    const timer = window.setTimeout(() => setPhase("result"), 2600);
    return () => window.clearTimeout(timer);
  }, [reduce]);

  useEffect(() => {
    if (phase !== "result") return;
    chime(best);
    if (results.some(entry => entry.item.rarity === 5)) {
      unlock("gold");
      const lost = results.find(entry => entry.lost);
      if (lost) {
        unlock("lost");
        toast({ title: "小保底，歪了", body: `出的是「${lost.item.name}」。没关系，下一个五星一定是 UP。`, tone: "gold" });
      }
    }
  }, [phase, best, results]);

  return (
    <Modal onClose={onClose} label="祈愿结果" className={s.dialog}>
      <div className={s.stage} data-phase={phase} data-best={best}>
        {phase === "meteor" ? (
          <button type="button" className={s.meteorStage} onClick={() => setPhase("result")} aria-label="跳过动画">
            <span className={s.meteor} aria-hidden="true" />
            <span className={s.flash} aria-hidden="true" />
            <span className={s.skip}>点击跳过 ›</span>
          </button>
        ) : (
          <div className={s.results}>
            <p className={s.resultsTitle}>{results.length > 1 ? "十连祈愿" : "祈愿"} · 结果</p>
            <ul className={`${s.cards} ${results.length === 1 ? s.cardsSingle : ""}`}>
              {sorted.map((result, index) => <ResultCard key={index} result={result} index={index} single={results.length === 1} />)}
            </ul>
            <button type="button" className={`btn btn--gold ${s.confirm}`} onClick={onClose} autoFocus>确认</button>
          </div>
        )}
      </div>
    </Modal>
  );
}
