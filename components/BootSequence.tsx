"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

const bootLines = [
  "BIOS [Luomo-OS v1.0] loading...",
  "Synchronizing astral pathways...",
  "Magic circuits connected.",
  "\"ATRI online. Cloud systems synchronized. Welcome aboard, Master.\""
];

function todayKey() {
  return `luomo-cloud-boot-${new Date().toISOString().slice(0, 10)}`;
}

export default function BootSequence() {
  const [visible, setVisible] = useState(false);
  const key = useMemo(todayKey, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadyShown = window.localStorage.getItem(key) === "done";
    if (reduceMotion || alreadyShown) return;
    setVisible(true);
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(key, "done");
      setVisible(false);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [key]);

  const skip = () => {
    window.localStorage.setItem(key, "done");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="boot-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: "none" }}
          transition={{ duration: 0.45 }}
        >
          <div className="boot-ring" aria-hidden="true" />
          <div className="boot-wave" aria-hidden="true" />
          <div className="boot-panel">
            <div className="boot-topline">
              <span>LUOMO CLOUD // STASIS WAKE</span>
              <button type="button" onClick={skip}>
                Skip
              </button>
            </div>
            <div className="boot-lines">
              {bootLines.map((line, index) => (
                <motion.p
                  key={line}
                  className="boot-line"
                  style={{ "--chars": line.length } as CSSProperties}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18 + index * 0.28, duration: 0.3 }}
                >
                  {line}
                </motion.p>
              ))}
            </div>
            <div className="boot-progress">
              <motion.span
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.78, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
