export const theme = {
  colors: {
    bg: {
      deep: "#020617",
      panel: "rgba(15, 23, 42, 0.66)",
      card: "rgba(15, 32, 50, 0.78)",
    },
    accent: {
      cyan: "#67e8f9",
      pink: "#f0abfc",
      violet: "#a78bfa",
      gold: "#fde68a",
    },
    border: {
      cyan: "rgba(125, 211, 252, 0.16)",
      pink: "rgba(244, 114, 182, 0.18)",
    },
    text: {
      main: "rgba(248, 250, 252, 0.94)",
      soft: "rgba(203, 213, 225, 0.68)",
    },
  },
  glass: {
    backdrop: "blur(14px)",
    bg: "rgba(15, 23, 42, 0.66)",
    border: "rgba(125, 211, 252, 0.14)",
    shadow: "0 18px 60px rgba(2, 6, 23, 0.32)",
  },
  card: {
    radius: "28px",
    glow: "0 0 40px rgba(34, 211, 238, 0.14)",
  },
} as const;
