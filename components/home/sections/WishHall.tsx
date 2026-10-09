"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import SectionHead from "../SectionHead";
import BannerArt from "../art/BannerArt";
import Modal from "@/components/ui/Modal";
import ModalBody from "../ModalBody";
import WishOverlay from "./WishOverlay";
import { BANNERS, findWishItem, wishPool } from "@/content/wish";
import { EMPTY_WISH_STATE, HARD_PITY, SOFT_PITY, WISH_COST, parseWishState, pullMany, type WishResult, type WishState } from "@/lib/home/wish";
import { KEYS, readJson, writeJson } from "@/lib/home/store";
import s from "./wish.module.css";

const POOL = wishPool();

function Jade({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2L20 9L12 22L4 9Z" fill="#8fd3ff" stroke="#e8fbff" strokeWidth="1.2" />
      <path d="M4 9H20M12 2L9 9L12 22L15 9Z" fill="none" stroke="#e8fbff" strokeWidth=".9" opacity=".8" />
    </svg>
  );
}

function stamp(at: number) {
  const d = new Date(at);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function WishHall() {
  const [active, setActive] = useState(0);
  const [state, setState] = useState<WishState>(EMPTY_WISH_STATE);
  const [results, setResults] = useState<WishResult[] | null>(null);
  const [panel, setPanel] = useState<"details" | "history" | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const banner = BANNERS[active];

  useEffect(() => {
    const sync = () => setState(readJson(KEYS.wish, parseWishState));
    sync();
    window.addEventListener("luomo:progress-reset", sync);
    return () => window.removeEventListener("luomo:progress-reset", sync);
  }, []);

  const wish = (count: number) => {
    const outcome = pullMany(state, POOL, banner.id, count);
    setState(outcome.state);
    writeJson(KEYS.wish, outcome.state);
    setResults(outcome.results);
  };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + BANNERS.length) % BANNERS.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="wrap">
        <SectionHead index="03" kicker="Wish · 祈愿" title="限定祈愿 · 作品展" id="projects-title">
          每一个作品都是一张限定卡池。抽卡不花钱，星琼由洛墨请客；就算歪了，作品也都能直接点进去看。
        </SectionHead>

        <div className={s.hall} style={{ ["--accent" as string]: banner.accent }}>
          <div className={s.tabs} role="tablist" aria-label="祈愿卡池">
            {BANNERS.map((entry, index) => (
              <button
                key={entry.id}
                ref={el => { tabs.current[index] = el; }}
                type="button"
                role="tab"
                id={`wish-tab-${entry.id}`}
                aria-selected={index === active}
                aria-controls="wish-panel"
                tabIndex={index === active ? 0 : -1}
                className={s.tab}
                onClick={() => setActive(index)}
                onKeyDown={event => onTabKey(event, index)}
                style={{ ["--accent" as string]: entry.accent }}
              >
                <BannerArt art={entry.art} uid={`tab-${entry.id}`} className={s.tabArt} />
                <span className={s.tabName}>{entry.name}</span>
              </button>
            ))}
          </div>

          <div className={s.banner} role="tabpanel" id="wish-panel" aria-labelledby={`wish-tab-${banner.id}`}>
            <div className={s.bannerArt} key={banner.id}>
              <BannerArt art={banner.art} uid={`main-${banner.id}`} className={s.bannerSvg} />
            </div>
            <div className={s.info} key={`info-${banner.id}`}>
              <p className={s.event}><span>限定祈愿</span>{banner.event}</p>
              <p className={s.up} aria-hidden="true">UP!</p>
              <h3 className={s.name}>{banner.name}</h3>
              <p className={s.epithet}>「{banner.epithet}」</p>
              <p className={s.desc}>{banner.description}</p>
              <div className={s.stack}>{banner.stack.map(item => <span key={item} className="chip">{item}</span>)}</div>
              <pre className={s.preview} aria-label="示例命令">{banner.preview.map(line => `› ${line}`).join("\n")}</pre>
              <a className={`btn btn--ghost ${s.visit}`} href={banner.href} target="_blank" rel="noopener noreferrer">前往 {banner.host} ↗</a>
            </div>
          </div>

          <div className={s.bar}>
            <div className={s.barLeft}>
              <button type="button" className={s.small} onClick={() => setPanel("details")}>详情</button>
              <button type="button" className={s.small} onClick={() => setPanel("history")}>记录</button>
              <span className={s.pity} suppressHydrationWarning>
                已祈愿 <b>{state.total}</b> 次 · 距保底 <b>{HARD_PITY - state.pity5}</b>
                {state.guaranteed && <em> · 下次五星必定 UP</em>}
              </span>
            </div>
            <div className={s.barRight}>
              <span className={s.wallet}><Jade /> ∞</span>
              <button type="button" className={s.wishBtn} onClick={() => wish(1)}>
                <span>祈愿 ×1</span><small><Jade size={13} /> × {WISH_COST}</small>
              </button>
              <button type="button" className={`${s.wishBtn} ${s.wishTen}`} onClick={() => wish(10)}>
                <span>祈愿 ×10</span><small><Jade size={13} /> × {WISH_COST * 10}</small>
              </button>
            </div>
          </div>
        </div>
      </div>

      {results && <WishOverlay results={results} onClose={() => setResults(null)} />}

      {panel && (
        <Modal onClose={() => setPanel(null)} label={panel === "details" ? "祈愿详情" : "祈愿记录"}>
          <ModalBody onClose={() => setPanel(null)} className={s.panel}>
            {panel === "details" ? (
              <>
                <h3>祈愿详情</h3>
                <p>当前 UP：<b>{banner.name}</b>「{banner.epithet}」</p>
                <ul>
                  <li>五星基础概率 <b>0.6%</b>，第 {SOFT_PITY} 抽起概率逐抽提升，最多 <b>{HARD_PITY}</b> 抽必出五星。</li>
                  <li>四星基础概率 <b>5.1%</b>，每 10 抽内必出至少一个四星。</li>
                  <li>五星有 50% 为当期 UP；若没有出 UP（俗称「歪了」），下一个五星必定是 UP。</li>
                  <li>祈愿记录与保底只保存在你自己的浏览器里，可以在 CONFIG 中清除。</li>
                </ul>
                <p className={s.note}>本祈愿不涉及任何真实货币。星琼无限，洛墨请客。</p>
              </>
            ) : (
              <>
                <h3>祈愿记录</h3>
                {state.history.length === 0 ? (
                  <p className={s.note}>还没有记录。去抽一发吧？</p>
                ) : (
                  <ol className={s.history}>
                    {state.history.map((entry, index) => (
                      <li key={`${entry.at}-${index}`} data-rarity={entry.rarity}>
                        <span>{findWishItem(entry.id)?.name ?? entry.id}{entry.lost && <em>（歪）</em>}</span>
                        <span>{"★".repeat(entry.rarity)}</span>
                        <time>{stamp(entry.at)}</time>
                      </li>
                    ))}
                  </ol>
                )}
              </>
            )}
          </ModalBody>
        </Modal>
      )}
    </section>
  );
}
