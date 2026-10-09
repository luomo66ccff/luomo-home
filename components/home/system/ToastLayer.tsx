"use client";

import { useEffect, useRef, useState } from "react";
import { Spark } from "../art/Icons";
import type { Toast } from "@/lib/home/store";
import { chime } from "@/lib/home/sound";
import s from "./system.module.css";

type Entry = Toast & { id: number; kind: "toast" | "achv" };

export default function ToastLayer() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const nextId = useRef(1);

  useEffect(() => {
    const push = (entry: Omit<Entry, "id">) => {
      const id = nextId.current++;
      setEntries(current => [...current.slice(-2), { ...entry, id }]);
      window.setTimeout(() => setEntries(current => current.filter(item => item.id !== id)), entry.kind === "achv" ? 5200 : 4200);
    };
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<Toast>).detail;
      if (detail?.title) push({ ...detail, kind: "toast" });
    };
    const onAchievement = (event: Event) => {
      const detail = (event as CustomEvent<{ name: string; hint: string }>).detail;
      if (!detail?.name) return;
      chime(5);
      push({ title: detail.name, body: detail.hint, tone: "gold", kind: "achv" });
    };
    window.addEventListener("luomo:toast", onToast);
    window.addEventListener("luomo:achievement", onAchievement);
    return () => { window.removeEventListener("luomo:toast", onToast); window.removeEventListener("luomo:achievement", onAchievement); };
  }, []);

  return (
    <div className={s.toasts} role="status" aria-live="polite">
      {entries.map(entry => (
        <div key={entry.id} className={s.toast} data-kind={entry.kind} data-tone={entry.tone ?? "info"}>
          {entry.kind === "achv" && <span className={s.toastIcon} aria-hidden="true"><Spark size={16} /></span>}
          <div>
            {entry.kind === "achv" && <p className={s.toastLabel}>成就达成</p>}
            <p className={s.toastTitle}>{entry.title}</p>
            {entry.body && <p className={s.toastBody}>{entry.body}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
