"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { galleryItems } from "@/lib/visual-assets";
import GalleryLightbox from "./GalleryLightbox";
import MotionSection from "./MotionSection";

export default function VisualWorldGallery() {
  const items = galleryItems;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <MotionSection id="gallery" className="gallery-scene">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
      <div className="section-heading">
        <p className="section-eyebrow">Visual World // Anime Cyber Gallery</p>
        <h2>The constellation behind the interface.</h2>
        <p>Original artworks shape the Luomo Cloud universe. Each frame is a gateway into the cyber-magic dream.</p>
      </div>

      <div className="gallery-masonry" aria-label="Luomo Cloud visual gallery">
        {items.map((item, index) => (
          <motion.button
            type="button"
            key={item.key}
            className="gallery-card glass-card"
            aria-label={`Open gallery image: ${item.title}`}
            onClick={() => setSelectedIndex(index)}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6, rotateX: 1.2, rotateY: index % 2 === 0 ? -1.4 : 1.4 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="gallery-img-wrap" style={{ background: item.fallback }}>
              <img
                src={item.src}
                alt={item.title}
                loading="lazy"
                decoding="async"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              <div className="gallery-glint" />
            </div>
            <div className="gallery-info">
              <span className="gallery-tags">
                {item.tags.map((tag) => (<span key={tag}>{tag}</span>))}
              </span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="gallery-footer-note">
        <span>Original Luomo Cloud visual concepts // click any frame to inspect</span>
      </div>
      </div>

      {selectedIndex !== null && (
        <GalleryLightbox index={selectedIndex} onClose={() => setSelectedIndex(null)} />
      )}
    </MotionSection>
  );
}