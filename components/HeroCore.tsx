"use client";

import { motion } from "framer-motion";
import { Code2, Files, Gauge } from "lucide-react";
import AccessPassButton from "./AccessPassButton";
import { visualAssets } from "@/lib/visual-assets";
import { HERO } from "@/content/copy";

const { hero: heroAssets, magic, hud } = visualAssets;

export default function HeroCore() {
  return (
    <div className="hero-core-root">
      <div className="hero-bg-base" />
      <div
        className="hero-bg-image"
        style={{ backgroundImage: `url(${heroAssets.primary})` }}
        aria-hidden="true"
      />
      <div className="hero-bg-mask" aria-hidden="true" />
      <div
        className="hero-hud-frame"
        style={{ backgroundImage: `url(${hud.frame})` }}
        aria-hidden="true"
      />

      <div className="hero-core-grid">
        <div className="hero-copy-block">
          <motion.p
            className="eyebrow hero-eyebrow"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            ASTRAL PATH // ONLINE
          </motion.p>
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1 }}
          >
            Luomo Cloud
          </motion.h1>
          <motion.div
            className="mx-auto mt-6 max-w-3xl text-center"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.22 }}
          >
            <p className="text-xl font-semibold tracking-[0.16em] text-cyan-50 sm:text-2xl">
              渡尽长夜，终见星辰。
            </p>
            <p className="mt-3 text-sm tracking-[0.18em] text-cyan-100/70 sm:text-base">
              Beyond the long night, the stars at last appear.
            </p>
            <p className="mt-2 text-sm tracking-[0.12em] text-fuchsia-100/65 sm:text-base">
              長き夜を渡り、ついに星々を仰ぐ。
            </p>
          </motion.div>
          <motion.p
            className="hero-sublead"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.34 }}
          >
            Private infrastructure with a little anime soul. Status, storage,
            operations, and automation are gathered into one glowing gateway.
          </motion.p>

          <motion.div
            className="hero-actions hero-action-row"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.46 }}
          >
            <AccessPassButton href="https://ops.luomo.moe" className="hero-primary-pass">
              <Gauge size={18} />
              Jump to cockpit
            </AccessPassButton>
            <AccessPassButton href="https://file.luomo.moe" className="hero-secondary-pass">
              <Files size={18} />
              Open archive
            </AccessPassButton>
            <AccessPassButton href="https://api.luomo.moe" className="hero-secondary-pass">
              <Code2 size={18} />
              Developer gate
            </AccessPassButton>
          </motion.div>

          <motion.div
            className="hero-status-strip"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.58 }}
          >
            <span />
            <strong>All systems are glowing quietly.</strong>
            <em>mood: calm</em>
          </motion.div>
        </div>

        <motion.div
          className="hero-main-visual"
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.22 }}
        >
          <div className="hero-main-visual-aura" aria-hidden="true" />
          <img
            src={heroAssets.fallback}
            alt="Luomo Cloud cyber magic control room"
            className="hero-key-art"
            loading="eager"
          />
          <img
            src={magic.circle}
            alt=""
            className="hero-magic-ring"
            aria-hidden="true"
          />
          <div className="hero-visual-console">
            <span>CORE-01</span>
            <strong>Cloud jump vector locked</strong>
            <em>magic circuits stable</em>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
