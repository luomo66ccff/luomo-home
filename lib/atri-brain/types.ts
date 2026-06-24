export type AtriMood = "idle" | "welcome" | "curious" | "focused" | "excited" | "sleepy" | "secret" | "system" | "warning";

export type AtriBrainRequest = {
  message: string;
  context?: { currentSection?: string; currentMood?: string; currentForm?: string; pageTitle?: string; servicesCount?: number; };
};

export type AtriBrainResponse = {
  ok: boolean;
  source: "scripted" | "fallback" | "ai";
  text: string;
  mood: AtriMood;
  form?: string;
  expression?: string;
  motion?: string;
  emotionStrength?: number;
  refusal?: string;
  debug?: { reason?: string; normalized?: boolean; };
};

export type AtriLive2DCommand = {
  mood?: string; form?: string; expression?: string; motion?: string; emotionStrength?: number;
};
