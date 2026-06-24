// lib/visual-assets.ts
// Central asset index for Luomo Cloud Homepage

export type GalleryItem = {
  key: string;
  title: string;
  description: string;
  src: string;
  fallback: string;
  tags: string[];
};

export const galleryItems: GalleryItem[] = [
  {
    key: "sakura-shrine",
    title: "Sakura Shrine",
    description: "A moonlit gate where petals and data streams cross.",
    src: "/assets/gallery/gallery-sakura-shrine-generated.webp",
    fallback: "linear-gradient(135deg, #1e1b4b, #831843, #020617)",
    tags: ["sakura", "shrine", "moon gate"],
  },
  {
    key: "cyber-stage",
    title: "Cyber Stage",
    description: "Neon waveforms echo through the livehouse of the cloud.",
    src: "/assets/gallery/gallery-cyber-stage-generated.webp",
    fallback: "linear-gradient(135deg, #020617, #4c1d95, #0f172a)",
    tags: ["livehouse", "neon", "waveform"],
  },
  {
    key: "ocean-memory",
    title: "Ocean Memory",
    description: "Blue reflections where machines dream under a digital sea.",
    src: "/assets/gallery/gallery-ocean-memory-generated.webp",
    fallback: "linear-gradient(135deg, #020617, #0c4a6e, #020617)",
    tags: ["ocean", "memory", "ATRI"],
  },
  {
    key: "starry-constellation",
    title: "Starry Constellation",
    description: "A star map of services, routes, and magic circuits.",
    src: "/assets/gallery/gallery-starry-constellation-generated.webp",
    fallback: "linear-gradient(135deg, #020617, #312e81, #020617)",
    tags: ["constellation", "star rail", "magic"],
  },
  {
    key: "witch-sunset",
    title: "Witch Sunset",
    description: "A quiet magical journey written in twilight.",
    src: "/assets/gallery/gallery-witch-sunset-generated.webp",
    fallback: "linear-gradient(135deg, #1e1b4b, #7c2d12, #020617)",
    tags: ["witch", "journey", "frieren"],
  },
  {
    key: "sci-fi-cockpit",
    title: "Sci-fi Cockpit",
    description: "A cloud control room floating between stars.",
    src: "/assets/gallery/gallery-sci-fi-cockpit-generated.webp",
    fallback: "linear-gradient(135deg, #020617, #0e7490, #312e81)",
    tags: ["cockpit", "HUD", "cloud"],
  },
];

export const visualAssets = {
  hero: {
    primary: "/assets/hero/hero-starry-control-room-generated.webp",
    fallback: "/assets/hero/hero-witch-journey-generated.webp",
  },

  backgrounds: {
    starfield: "/assets/backgrounds/oga-night-sky-stars-cc0.webp",
    constellation: "/assets/backgrounds/constellation-overlay-luomo.svg",
  },

  particles: {
    sakura01: "/assets/particles/sakura-petal-01.svg",
    sakura02: "/assets/particles/sakura-petal-02.svg",
    dataStar: "/assets/particles/data-star-01.svg",
  },

  magic: {
    circle: "/assets/magic/magic-circle-luomo.svg",
  },

  hud: {
    frame: "/assets/hud/hud-frame-cyber.svg",
    blueArchiveInspired: "/assets/hud/blue-archive-inspired-campus-hud.svg",
  },

  ui: {
    accessPass: "/assets/ui/access-pass-button.svg",
    blueStatusCard: "/assets/ui/blue-white-status-card.svg",
  },

  vn: {
    dialogFrame: "/assets/vn/vn-dialog-frame-luomo.svg",
  },
} as const;
