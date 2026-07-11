"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Cloud, Layers3, Server, ShieldCheck, Sparkles } from "lucide-react";
import { visualAssets } from "@/lib/visual-assets";
import styles from "./HomeExperience.module.css";

type StatusPayload = {
  services?: Array<{ status: string }>;
};

export default function HeroCore() {
  const [summary, setSummary] = useState({ ready: 0, total: 5 });

  useEffect(() => {
    let active = true;
    fetch("/api/services")
      .then((response) => response.json())
      .then((data: StatusPayload) => {
        if (!active || !data.services) return;
        setSummary({
          ready: data.services.filter((service) => service.status === "operational").length,
          total: data.services.length,
        });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const rail = [
    {
      label: "Network",
      value: summary.ready ? summary.ready + " of " + summary.total + " services ready" : "Checking live services",
      icon: Server,
    },
    { label: "Region", value: "Tokyo / Cloudflare edge", icon: Cloud },
    { label: "Access", value: "Private by design", icon: ShieldCheck },
    { label: "Stack", value: "Next.js + FastAPI", icon: Layers3 },
  ];

  return (
    <>
      <img
        className={styles.heroBackdrop}
        src={visualAssets.hero.primary}
        alt=""
        aria-hidden="true"
      />
      <div className={styles.heroShade} aria-hidden="true" />

      <div className={styles.heroInner}>
        <motion.div
          className={styles.heroCopy}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: "easeOut" }}
        >
          <p className={styles.eyebrow}>Anime cyber portal / Tokyo node online</p>
          <h1 className={styles.heroTitle}>Luomo Cloud</h1>
          <p className={styles.heroLead}>
            在现实之外，构筑属于自己的云端世界。
            <span>
              个人主页、云服务入口、API、文件、终端、运维与看板娘，在同一片星空下安静运转。
            </span>
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="#services">
              探索云端
              <ArrowDown size={16} />
            </a>
            <a
              className={styles.secondaryAction}
              href="https://ops.luomo.moe"
              target="_blank"
              rel="noopener noreferrer"
            >
              访问控制台
              <ArrowUpRight size={16} />
            </a>
          </div>
          <div className={styles.heroSigils} aria-label="Luomo Cloud keywords">
            {["Cloud Services", "Live2D Companion", "API Gateway", "Build Log"].map((item) => (
              <span key={item}>
                <Sparkles size={12} aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className={styles.statusRail} aria-label="Cloud summary">
        <div className={styles.statusRailInner}>
          {rail.map((item, index) => {
            const Icon = item.icon;
            return (
              <div className={styles.statusRailItem} key={item.label}>
                {index === 0 ? <span className={styles.liveDot} aria-hidden="true" /> : <Icon size={15} aria-hidden="true" />}
                <div>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
