"use client";

import { useState } from "react";
import { ChevronUp, LayoutGrid } from "lucide-react";
import { galleryItems } from "@/lib/visual-assets";
import GalleryLightbox from "./GalleryLightbox";
import styles from "./HomeExperience.module.css";

export default function VisualWorldGallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? galleryItems : galleryItems.slice(0, 3);

  return (
    <div className={styles.sectionInner}>
      <div className={styles.galleryToolbar}>
        <header className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Visual worlds</p>
            <h2 className={styles.sectionTitle}>The atmosphere behind the interface.</h2>
          </div>
          <p className={styles.sectionDescription}>
            Original Luomo Cloud scenes give each utility a shared place to belong,
            without turning the dashboard into a wall of effects.
          </p>
        </header>
        <button
          className={styles.galleryToggle}
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          {expanded ? <ChevronUp size={14} /> : <LayoutGrid size={14} />}
          {expanded ? "Show less" : "View all worlds"}
        </button>
      </div>

      <div className={styles.galleryGrid} aria-label="Luomo Cloud visual gallery">
        {visibleItems.map((item, index) => (
          <button
            className={styles.galleryCard}
            type="button"
            key={item.key}
            onClick={() => setSelectedIndex(index)}
            aria-label={"Open gallery image: " + item.title}
          >
            <div className={styles.galleryImageWrap}>
              <img
                className={styles.galleryImage}
                src={item.src}
                alt={item.title}
                loading="lazy"
                decoding="async"
              />
              <span className={styles.galleryIndex}>
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div className={styles.galleryCopy}>
              <div className={styles.galleryTags}>
                {item.tags.slice(0, 3).map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <GalleryLightbox index={selectedIndex} onClose={() => setSelectedIndex(null)} />
      )}
    </div>
  );
}
