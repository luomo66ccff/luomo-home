import styles from "./HomeExperience.module.css";
import { FOOTER_LINKS } from "@/lib/home-content";

export default function SoftFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div>
          <p className={styles.footerBrand}>
            Luomo <span>/ personal digital universe</span>
          </p>
          <p className={styles.footerQuote}>愿每一次连接，都通往更辽阔的世界。</p>
        </div>
        <nav className={styles.footerLinks} aria-label="Footer service links">
          {FOOTER_LINKS.map((link) => (
            <a href={link.href} target="_blank" rel="noopener noreferrer" key={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <p className={styles.footerCopy}>© {year} LUOMO · Systems Online</p>
      </div>
    </footer>
  );
}
