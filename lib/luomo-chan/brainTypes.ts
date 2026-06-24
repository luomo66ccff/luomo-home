
export type LuomoMood =
  | "idle" | "welcome" | "curious" | "focused"
  | "excited" | "sleepy" | "secret" | "system" | "warning";

export type LuomoChanBrainResponse = {
  text: string;
  mood: LuomoMood;
  form?: string;
  expression?: string;
  motion?: string;
  emotionStrength?: number;
  allowSecretForms?: boolean;
  allowDebugForms?: boolean;
};
