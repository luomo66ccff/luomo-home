"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import ModalBody from "../ModalBody";
import { usePrefs } from "../PrefsContext";
import { TEXT_SPEED_LABELS, useVnSettings, type VnSettings } from "@/lib/home/settings";
import { ACHIEVEMENTS, getUnlocked } from "@/lib/home/achievements";
import { clearLocalProgress, toast } from "@/lib/home/store";
import s from "./system.module.css";

const THEMES = [
  { id: "dark", label: "夜" },
  { id: "light", label: "朝" },
  { id: "system", label: "跟随系统" },
] as const;

export default function ConfigModal() {
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);
  const { settings, update } = useVnSettings();
  const { prefs, setTheme, toggleParticles } = usePrefs();

  useEffect(() => {
    const show = () => { setUnlocked(getUnlocked()); setConfirming(false); setOpen(true); };
    const refresh = () => setUnlocked(getUnlocked());
    window.addEventListener("luomo:config", show);
    window.addEventListener("luomo:achievement", refresh);
    return () => { window.removeEventListener("luomo:config", show); window.removeEventListener("luomo:achievement", refresh); };
  }, []);

  if (!open) return null;
  const close = () => setOpen(false);

  const reset = () => {
    if (!confirming) { setConfirming(true); return; }
    clearLocalProgress();
    setUnlocked([]);
    setConfirming(false);
    toast({ title: "进度已清除", body: "车票、祈愿记录、成就与存档都回到了起点。设置保留。" });
  };

  return (
    <Modal onClose={close} label="CONFIG 设置" className={s.config}>
      <ModalBody onClose={close}>
        <header className={s.configHead}>
          <p>CONFIG</p>
          <h2>环境设定</h2>
        </header>

        <div className={s.configGrid}>
          <section aria-labelledby="cfg-text">
            <h3 id="cfg-text">文字</h3>
            <div className={s.row}>
              <span id="cfg-speed">文字速度</span>
              <div className={s.segment} role="radiogroup" aria-labelledby="cfg-speed">
                {TEXT_SPEED_LABELS.map((label, index) => (
                  <button key={label} type="button" role="radio" aria-checked={settings.textSpeed === index} onClick={() => update({ textSpeed: index as VnSettings["textSpeed"] })}>{label}</button>
                ))}
              </div>
            </div>
            <label className={s.row}>
              <span>自动播放间隔 <b>{settings.autoDelay.toFixed(1)} 秒</b></span>
              <input type="range" min={1} max={6} step={0.5} value={settings.autoDelay} onChange={event => update({ autoDelay: Number(event.target.value) })} />
            </label>
          </section>

          <section aria-labelledby="cfg-sound">
            <h3 id="cfg-sound">声音</h3>
            <div className={s.row}>
              <span id="cfg-sound-switch">效果音与拨弦</span>
              <button type="button" className={s.switch} role="switch" aria-checked={settings.sound} aria-labelledby="cfg-sound-switch" onClick={() => update({ sound: !settings.sound })}><i /></button>
            </div>
            <label className={s.row}>
              <span>音量 <b>{Math.round(settings.volume * 100)}%</b></span>
              <input type="range" min={0} max={1} step={0.1} value={settings.volume} onChange={event => update({ volume: Number(event.target.value) })} disabled={!settings.sound} />
            </label>
          </section>

          <section aria-labelledby="cfg-view">
            <h3 id="cfg-view">画面</h3>
            <div className={s.row}>
              <span id="cfg-theme">昼夜</span>
              <div className={s.segment} role="radiogroup" aria-labelledby="cfg-theme">
                {THEMES.map(theme => (
                  <button key={theme.id} type="button" role="radio" aria-checked={prefs.theme === theme.id} onClick={() => setTheme(theme.id)}>{theme.label}</button>
                ))}
              </div>
            </div>
            <div className={s.row}>
              <span id="cfg-particles">指尖星尘</span>
              <button type="button" className={s.switch} role="switch" aria-checked={prefs.particlesEnabled} aria-labelledby="cfg-particles" onClick={toggleParticles}><i /></button>
            </div>
          </section>

          <section aria-labelledby="cfg-achv" className={s.achvSection}>
            <h3 id="cfg-achv">成就 <b>{unlocked.length}/{ACHIEVEMENTS.length}</b></h3>
            <ul className={s.achvList}>
              {ACHIEVEMENTS.map(entry => {
                const done = unlocked.includes(entry.id);
                return (
                  <li key={entry.id} data-done={done}>
                    <strong>{done ? entry.name : "？？？"}</strong>
                    <small>{entry.hint}</small>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <footer className={s.configFoot}>
          <p>所有进度只保存在你自己的浏览器里。</p>
          <button type="button" className={`btn ${confirming ? s.danger : "btn--ghost"}`} onClick={reset}>
            {confirming ? "真的要清除吗？再点一次确认" : "清除本地进度"}
          </button>
        </footer>
      </ModalBody>
    </Modal>
  );
}
