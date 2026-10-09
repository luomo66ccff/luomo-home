"use client";

import { useEffect, useState } from "react";
import { Barcode, Spark } from "../art/Icons";
import { unlock } from "@/lib/home/achievements";
import { chime } from "@/lib/home/sound";
import { KEYS, readJson, toast, writeJson } from "@/lib/home/store";
import { hhmm, useClock } from "@/lib/home/hooks";
import s from "./ticket.module.css";

type Stamp = { no: string; at: number };

function parseStamp(raw: string | null): Stamp | null {
  try {
    const data = raw ? JSON.parse(raw) : null;
    return data && typeof data.no === "string" && typeof data.at === "number" ? { no: data.no.slice(0, 8), at: data.at } : null;
  } catch {
    return null;
  }
}

function stampDate(at: number) {
  const d = new Date(at);
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function NightTicket() {
  const [stamp, setStamp] = useState<Stamp | null>(null);
  const [fresh, setFresh] = useState(false);
  const now = useClock();

  useEffect(() => {
    const sync = () => setStamp(readJson(KEYS.ticket, parseStamp));
    sync();
    window.addEventListener("luomo:progress-reset", sync);
    return () => window.removeEventListener("luomo:progress-reset", sync);
  }, []);

  const board = () => {
    if (stamp) return;
    const next: Stamp = { no: String(Math.floor(1000 + Math.random() * 9000)), at: Date.now() };
    writeJson(KEYS.ticket, next);
    setStamp(next);
    setFresh(true);
    chime(4);
    unlock("ticket");
    toast({ title: "检票完成，欢迎上车", body: `车票 No.${next.no} · 请保管好您的车票，下车前还要用。` });
  };

  const departure = now ? hhmm(new Date(Math.ceil((now.getTime() + 120_000) / 300_000) * 300_000)) : "--:--";

  return (
    <div className={s.holder}>
      <article className={s.ticket} aria-label={stamp ? `夜行线乘车券，已检票，编号 ${stamp.no}` : "夜行线乘车券，尚未检票"}>
        <div className={s.main}>
          <header className={s.head}>
            <span className={s.brand}><Spark size={11} /> 夜行线 · 乘车券</span>
            <span className={s.code}>LM-0712</span>
          </header>
          <div className={s.route}>
            <div><strong>洛墨</strong><small>らくぼく</small></div>
            <span className={s.arrow} aria-hidden="true"><i />✦<i /></span>
            <div><strong>群星</strong><small>STARWARD</small></div>
          </div>
          <dl className={s.meta}>
            <div><dt>发车</dt><dd suppressHydrationWarning>{departure}</dd></div>
            <div><dt>车厢</dt><dd>3 号</dd></div>
            <div><dt>座位</dt><dd>07A</dd></div>
            <div><dt>乘客</dt><dd>无名客</dd></div>
          </dl>
          <p className={s.fine}>本票当日有效 · 过站不补 · 车内仅限饮用波子汽水<br />邻座 07B 已售 · 白发的小旅客 · 请保持安静</p>
          {stamp && (
            <div className={`${s.stamp} ${fresh ? s.stampFresh : ""}`} aria-hidden="true">
              <span>洛墨站</span>
              <b>已检</b>
              <span>{stampDate(stamp.at)}</span>
            </div>
          )}
        </div>
        <div className={s.stub} aria-hidden="true">
          <span className={s.stubLabel}>存根</span>
          <Barcode seed={stamp?.no ?? "LM-0712"} className={s.barcode} height={30} bars={34} />
          <span className={s.stubNo}>{stamp ? `No.${stamp.no}` : "No.————"}</span>
        </div>
      </article>
      <button type="button" className={`btn ${stamp ? "btn--ghost" : "btn--gold"} ${s.cta}`} onClick={board} disabled={!!stamp}>
        {stamp ? "已检票 · 祝旅途愉快" : "检票上车"}
      </button>
    </div>
  );
}
