"use client";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { galleryItems } from "@/lib/visual-assets";
import Modal from "./ui/Modal";
import styles from "./HomeExperience.module.css";
export default function GalleryLightbox({ index, onClose }: { index: number; onClose: () => void }) {
  const [current, setCurrent] = useState(Math.max(0, Math.min(index, galleryItems.length - 1)));
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const move = (step: number) => setCurrent(i => (i + step + galleryItems.length) % galleryItems.length);
  const item = galleryItems[current];
  return <Modal onClose={onClose} label="视觉世界画廊" className="gallery-modal">
    <div onKeyDown={event => { if (event.key === "ArrowRight") { event.preventDefault(); move(1); } if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); } }}>
      <div className="modal-heading"><span className={styles.eyebrow}>WORLD / {String(current + 1).padStart(2, "0")} OF {galleryItems.length}</span><button className={styles.iconButton} onClick={onClose} aria-label="关闭画廊"><X size={21} /></button></div>
      <div className="lightbox-image" style={{ background: item.fallback }}><Image src={item.src} alt={item.title} fill sizes="(max-width: 760px) 92vw, 900px" style={{ objectFit: "contain" }} onError={() => setFailedSrc(item.src)} />{failedSrc === item.src && <span>图片暂时无法加载</span>}</div>
      <div className="lightbox-footer"><div aria-live="polite"><h2 className="modal-title">{item.title}</h2><p className="modal-description">{item.description}</p></div><div className="lightbox-controls"><button className={styles.iconButton} onClick={() => move(-1)} aria-label="上一张图片"><ArrowLeft size={20} /></button><button className={styles.iconButton} onClick={() => move(1)} aria-label="下一张图片"><ArrowRight size={20} /></button></div></div>
    </div>
  </Modal>;
}
