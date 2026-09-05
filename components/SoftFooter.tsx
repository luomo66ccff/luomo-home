import styles from "./HomeExperience.module.css";
import { FOOTER_LINKS } from "@/lib/home-content";

export default function SoftFooter() {
  return <footer className={styles.footer}><div className={styles.footerInner}><div><p className={styles.footerBrand}>luomo<span>.</span></p><p className={styles.footerQuote}>A little space for things I love.</p></div><nav className={styles.footerLinks} aria-label="页脚服务导航">{FOOTER_LINKS.map(link => <a href={link.href} target="_blank" rel="noopener noreferrer" key={link.href}>{link.label}</a>)}</nav><div className={styles.footerBottom}><p>© {new Date().getFullYear()} LUOMO · 用好奇心构建</p><a href="#hero">BACK TO TOP ↑</a></div></div></footer>;
}
