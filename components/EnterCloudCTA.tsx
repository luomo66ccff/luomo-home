import { ArrowUpRight, Bot, Code2, Files, Gauge, Terminal } from "lucide-react";
import { visualAssets } from "@/lib/visual-assets";
import styles from "./HomeExperience.module.css";

const gates = [
  { name: "LuomoOps", label: "Status cockpit", href: "https://ops.luomo.moe", icon: Gauge },
  { name: "LuomoFile", label: "Private archive", href: "https://file.luomo.moe", icon: Files },
  { name: "LuomoAPI", label: "Developer gateway", href: "https://api.luomo.moe", icon: Code2 },
  { name: "Terminal", label: "Operations bridge", href: "https://terminal.luomo.moe", icon: Terminal },
  { name: "AstrBot", label: "Automation API", href: "https://atri-api.luomo.moe", icon: Bot },
];

export default function EnterCloudCTA() {
  return (
    <>
      <img
        className={styles.ctaImage}
        src={visualAssets.hero.fallback}
        alt=""
        aria-hidden="true"
        loading="lazy"
      />
      <div className={styles.ctaShade} aria-hidden="true" />
      <div className={styles.ctaInner}>
        <p className={styles.eyebrow}>Destinations</p>
        <h2 className={styles.ctaTitle}>Choose a service. Keep the rest of the cloud quiet.</h2>
        <p className={styles.ctaDescription}>
          Each tool opens in its own focused workspace, while this page remains the
          shared map back home.
        </p>

        <div className={styles.gateGrid}>
          {gates.map((gate) => {
            const Icon = gate.icon;
            return (
              <a
                className={styles.gate}
                href={gate.href}
                target="_blank"
                rel="noopener noreferrer"
                key={gate.href}
              >
                <span className={styles.gateIdentity}>
                  <Icon size={17} />
                  <span>
                    <strong>{gate.name}</strong>
                    <span>{gate.label}</span>
                  </span>
                </span>
                <ArrowUpRight size={14} />
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
}
