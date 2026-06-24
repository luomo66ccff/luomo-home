"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface Props {
  children: ReactNode;
  preset?: "dreamUp" | "softFade" | "scaleIn";
  delay?: number;
  className?: string;
  once?: boolean;
}

const presetsMap = {
  dreamUp: { hidden: { opacity: 0, y: 32, filter: "blur(10px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)" } },
  softFade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
  scaleIn: { hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1 } },
};

export default function Reveal({ children, preset = "dreamUp", delay = 0, className = "", once = true }: Props) {
  const reduced = usePrefersReducedMotion();
  const p = presetsMap[preset];

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      initial={p.hidden}
      whileInView={p.show}
      viewport={{ once, margin: "-8%" }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.8, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
