"use client";

import { useState } from "react";
import { Bot, Code2, Files, Gauge, Terminal } from "lucide-react";
import { TECH_STACK } from "@/lib/services";
import styles from "./HomeExperience.module.css";

const phases = [
  {
    phase: "PHASE 01",
    title: "LuomoOps",
    subtitle: "Cloud status cockpit",
    body: "The first shared control surface: status, DailyOps, incidents and the small signals that keep infrastructure understandable.",
    icon: Gauge,
  },
  {
    phase: "PHASE 02",
    title: "LuomoFile",
    subtitle: "Private file constellation",
    body: "Storage routes, private uploads and temporary shares gathered behind a focused interface.",
    icon: Files,
  },
  {
    phase: "PHASE 03",
    title: "LuomoAPI",
    subtitle: "Developer gateway",
    body: "Keys, scopes and application routes exposed through one consistent developer entry point.",
    icon: Code2,
  },
  {
    phase: "PHASE 04",
    title: "LuomoTerminal",
    subtitle: "Operations bridge",
    body: "SSH, SFTP and project operations connected to the same cloud without hiding the tools underneath.",
    icon: Terminal,
  },
  {
    phase: "PHASE 05",
    title: "AstrBot API",
    subtitle: "Automation interface",
    body: "Agent and companion signals extended the network from utilities into a living automation layer.",
    icon: Bot,
  },
];

export default function BuildTimeline() {
  const [activePhase, setActivePhase] = useState(0);
  const active = phases[activePhase];

  return (
    <div className={styles.sectionInner}>
      <header className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Build log</p>
          <h2 className={styles.sectionTitle}>Small services, deliberately connected.</h2>
        </div>
        <p className={styles.sectionDescription}>
          Luomo Cloud grew one useful surface at a time. The shared system now stays
          recognizable even as new routes and companions are added.
        </p>
      </header>

      <div className={styles.timelineLayout}>
        <div className={styles.timelineTabs} role="tablist" aria-label="Build phases">
          {phases.map((phase, index) => {
            const Icon = phase.icon;
            const selected = index === activePhase;
            return (
              <button
                className={
                  styles.timelineTab + (selected ? " " + styles.timelineTabActive : "")
                }
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActivePhase(index)}
                key={phase.phase}
              >
                <span className={styles.timelineTabIcon}>
                  <Icon size={14} />
                </span>
                <span>
                  {phase.title}
                  <small>{phase.phase}</small>
                </span>
              </button>
            );
          })}
        </div>

        <div className={styles.timelineDetail} role="tabpanel">
          <div>
            <span className={styles.timelinePhase}>{active.phase}</span>
            <h3>{active.title}</h3>
            <p className={styles.timelineSubtitle}>{active.subtitle}</p>
            <p className={styles.timelineBody}>{active.body}</p>
          </div>
          <div className={styles.stackList} aria-label="Technology stack">
            {TECH_STACK.map((item) => (
              <span className={styles.stackItem} key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
