"use client";

import { useState } from "react";
import { Activity, Command, Menu, X } from "lucide-react";
import styles from "./HomeExperience.module.css";

const links = [
  { label: "Home", href: "#hero" },
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Operations", href: "#operations" },
  { label: "Build", href: "#build" },
];

export default function HomeNavigation() {
  const [open, setOpen] = useState(false);

  const openCommandPalette = () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
  };

  return (
    <div className={styles.navWrap}>
      <nav className={styles.nav} aria-label="Primary navigation">
        <a className={styles.brand} href="#hero" aria-label="Luomo Cloud home">
          <span className={styles.brandMark}>洛</span>
          <span className={styles.brandText}>
            <strong>Luomo</strong>
            <span>DIGITAL BASE</span>
          </span>
        </a>

        <div className={styles.navLinks}>
          {links.map((link) => (
            <a className={styles.navLink} href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </div>

        <div className={styles.navActions}>
          <span className={styles.liveLabel}>
            <Activity size={13} />
            LIVE
          </span>
          <a
            className={styles.navCta}
            href="https://ops.luomo.moe"
            target="_blank"
            rel="noopener noreferrer"
          >
            进入云端
          </a>
          <button
            className={styles.commandButton}
            type="button"
            onClick={openCommandPalette}
            aria-label="Open command palette"
            title="Open command palette"
          >
            <Command size={16} />
          </button>
          <button
            className={styles.menuButton}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? "Close navigation" : "Open navigation"}
            title={open ? "Close navigation" : "Open navigation"}
          >
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>

        {open && (
          <div className={styles.mobileMenu}>
            {links.map((link) => (
              <a
                className={styles.navLink}
                href={link.href}
                key={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a className={styles.navLink} href="#enter" onClick={() => setOpen(false)}>
              进入云端
            </a>
          </div>
        )}
      </nav>
    </div>
  );
}
