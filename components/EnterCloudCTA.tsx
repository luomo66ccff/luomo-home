import Image from "next/image";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { visualAssets } from "@/lib/visual-assets";
import styles from "./HomeExperience.module.css";

export default function EnterCloudCTA() {
  return <div className={styles.ctaInner}><div className={styles.ctaCopy}><p className={styles.eyebrow}>THE JOURNEY CONTINUES</p><h2 className={styles.ctaTitle}>世界很大，<br />下一站<span>见。</span></h2><p className={styles.ctaDescription}>愿每一次连接，都通往更辽阔的世界。</p><div className={styles.heroActions}><a className={styles.primaryAction} href="#services">选一个目的地 <ArrowRight size={17} /></a><a className={styles.secondaryAction} href="https://github.com/luomo66ccff/luomo-home" target="_blank" rel="noopener noreferrer">这片云的源代码 <ArrowUpRight size={16} /></a></div></div><div className={styles.ctaArtwork}><Image src={visualAssets.hero.fallback} alt="落日下，魔女捧着书回望远方的城堡" fill sizes="(max-width: 760px) 100vw, 45vw" /><div className={styles.ctaShade} /><span>UNTIL NEXT TIME, TRAVELER.</span></div></div>;
}
