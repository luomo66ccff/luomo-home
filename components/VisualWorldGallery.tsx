"use client";
import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, Minus, Plus } from "lucide-react";
import { galleryItems } from "@/lib/visual-assets";
import GalleryLightbox from "./GalleryLightbox";
import styles from "./HomeExperience.module.css";

export default function VisualWorldGallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  return <div className={styles.sectionInner}>
    <header className={styles.sectionHeader}><div><p className={styles.eyebrow}>04 / SOMEWHERE ELSE</p><h2 className={styles.sectionTitle}>偶尔，也去<span>别的世界走走。</span></h2></div><div className={styles.sectionSide}><p className={styles.sectionDescription}>把月色、海风与一点点不切实际，<br />收进这本持续更新的视觉手记。</p><button className={styles.textLink} onClick={() => setExpanded(v => !v)} aria-expanded={expanded} aria-controls="world-gallery">{expanded ? "收起画廊" : "浏览全部 " + galleryItems.length + " 个世界"}{expanded ? <Minus size={15} /> : <Plus size={15} />}</button></div></header>
    <div id="world-gallery" className={styles.galleryGrid}>{(expanded ? galleryItems : galleryItems.slice(0, 3)).map((item, index) => <button className={styles.galleryCard} key={item.key} onClick={() => setSelectedIndex(index)} aria-label={"查看场景：" + item.title}>
      <Image src={item.src} alt={item.title} fill sizes="(max-width: 760px) 100vw, 50vw" />
      <span className={styles.galleryShade} /><span className={styles.galleryIndex}>WORLD / 0{index + 1}</span><span className={styles.galleryArrow}><ArrowUpRight size={19} /></span>
      <span className={styles.galleryCopy}><small>{item.tags.slice(0, 2).join(" · ")}</small><strong>{item.title}</strong><span>{item.description}</span></span>
    </button>)}</div>
    {selectedIndex !== null && <GalleryLightbox index={selectedIndex} onClose={() => setSelectedIndex(null)} />}
  </div>;
}
