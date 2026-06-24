
"use client";

import { useEffect, useCallback, useState } from "react";
import { galleryItems, type GalleryItem } from "@/lib/visual-assets";

interface Props {
  index: number;
  onClose: () => void;
}

export default function GalleryLightbox({ index, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(index);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % galleryItems.length);
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + galleryItems.length) % galleryItems.length);
  }, []);

  const item = galleryItems[currentIndex];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, goNext, goPrev]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white/60 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full bg-black/40" aria-label="Close">&times;</button>
      <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white text-3xl w-12 h-12 flex items-center justify-center rounded-full bg-black/40" aria-label="Previous image">&#8249;</button>
      <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white text-3xl w-12 h-12 flex items-center justify-center rounded-full bg-black/40" aria-label="Next image">&#8250;</button>
      <div className="relative max-w-4xl max-h-[85vh] w-full">
        <img
          src={item.src}
          alt={item.title}
          className="w-full h-full object-contain rounded-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).style.background = item.fallback;
            (e.target as HTMLImageElement).style.minHeight = "300px";
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-white font-semibold">{item.title}</p>
          <p className="text-white/60 text-sm">{item.description}</p>
        </div>
        <div className="absolute top-4 left-4 text-white/40 text-sm">
          {currentIndex + 1} / {galleryItems.length}
        </div>
      </div>
    </div>
  );
}
