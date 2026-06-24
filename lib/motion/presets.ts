export const motionPresets = {
  dreamUp: {
    hidden: { opacity: 0, y: 32, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.7, ease: [0.25, 0.8, 0.25, 1] },
  },
  softFade: {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
    transition: { duration: 0.5 },
  },
  cardStagger: {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.92 },
    show: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: [0.25, 0.8, 0.25, 1] },
  },
} as const;
