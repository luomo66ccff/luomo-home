"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import SectionHead from "../SectionHead";
import Modal from "@/components/ui/Modal";
import VnDialog from "../VnDialog";
import { CG_ENTRIES } from "@/content/gallery";
import { unlock } from "@/lib/home/achievements";
import { KEYS, readJson, toast, writeJson } from "@/lib/home/store";
import s from "./gallery.module.css";

const IDS = new Set(CG_ENTRIES.map(entry => entry.id));

function parseSeen(raw: string | null): string[] {
  try {
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data.filter((id): id is string => typeof id === "string" && IDS.has(id)) : [];
  } catch {
    return [];
  }
}

function Viewer({ index, onIndex, onClose }: { index: number; onIndex: (next: number) => void; onClose: () => void }) {
  const [hidden, setHidden] = useState(false);
  const entry = CG_ENTRIES[index];
  const total = CG_ENTRIES.length;
  const go = useCallback((delta: number) => onIndex((index + delta + total) % total), [index, onIndex, total]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(1);
      else if (event.key === "ArrowLeft") go(-1);
      else if (event.key.toLowerCase() === "h") setHidden(value => !value);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <Modal onClose={onClose} label={`CG 鉴赏：${entry.title}`} className={s.viewer}>
      <div className={s.viewerStage}>
        <button type="button" className={s.viewerImage} onClick={() => hidden && setHidden(false)} aria-label={hidden ? "显示文字框" : entry.alt} tabIndex={hidden ? 0 : -1}>
          <Image key={entry.id} src={entry.src} alt={entry.alt} fill sizes="100vw" priority className={s.viewerImg} />
        </button>
        <header className={s.viewerTop} data-hidden={hidden}>
          <span className={s.viewerCount}>CG {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
          <span className={s.viewerPlace}>{entry.place}</span>
          <button type="button" className={s.viewerBtn} onClick={() => setHidden(true)}>HIDE</button>
          <button type="button" className={s.viewerBtn} onClick={onClose} aria-label="关闭鉴赏">CLOSE ✕</button>
        </header>
        <button type="button" className={`${s.nav} ${s.prev}`} onClick={() => go(-1)} aria-label="上一张" data-hidden={hidden}>‹</button>
        <button type="button" className={`${s.nav} ${s.next}`} onClick={() => go(1)} aria-label="下一张" data-hidden={hidden}>›</button>
        <div className={s.viewerBox} data-hidden={hidden}>
          <VnDialog speaker={entry.title} lines={[entry.caption]} system={false} />
        </div>
      </div>
    </Modal>
  );
}

export default function CgGallery() {
  const [seen, setSeen] = useState<string[]>([]);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const sync = () => setSeen(readJson(KEYS.cg, parseSeen));
    sync();
    window.addEventListener("luomo:progress-reset", sync);
    return () => window.removeEventListener("luomo:progress-reset", sync);
  }, []);

  const view = useCallback((index: number) => {
    setOpen(index);
    const id = CG_ENTRIES[index].id;
    setSeen(current => {
      if (current.includes(id)) return current;
      const next = [...current, id];
      writeJson(KEYS.cg, next);
      if (next.length === CG_ENTRIES.length && unlock("cg")) {
        toast({ title: "回想模式 · 全部解锁", body: "所有风景都看过了。下一次旅行，也请让我替你拍下来。", tone: "gold" });
      }
      return next;
    });
  }, []);

  return (
    <section id="worlds" className="section" aria-labelledby="worlds-title">
      <div className="wrap">
        <SectionHead index="05" kicker="Extra · CG 鉴赏" title="旅途中的风景" id="worlds-title">
          这些风景都是旅途中替你拍下来的。看过的会盖上小小的印章，全部看完的话……会发生什么呢？
        </SectionHead>

        <div className={s.frame}>
          <div className={s.frameTop} aria-hidden="true">
            <span>CG MODE</span>
            <span>PAGE 1 / 1</span>
            <span>{String(seen.length).padStart(2, "0")} / {String(CG_ENTRIES.length).padStart(2, "0")} COLLECTED</span>
          </div>
          <ul className={s.grid}>
            {CG_ENTRIES.map((entry, index) => (
              <li key={entry.id} className={s.item}>
                <button type="button" className={s.thumb} onClick={() => view(index)} aria-label={`${entry.title}：${entry.place}。打开鉴赏`}>
                  <Image src={entry.src} alt="" fill sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 300px" className={s.thumbImg} />
                  <span className={s.no}>No.{String(index + 1).padStart(2, "0")}</span>
                  {seen.includes(entry.id) && <span className={s.seen} aria-hidden="true">既読</span>}
                  <span className={s.caption}><strong>{entry.title}</strong><small>{entry.place}</small></span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {open !== null && <Viewer index={open} onIndex={view} onClose={() => setOpen(null)} />}
    </section>
  );
}
