"use client";
import { useCallback, useRef } from "react";
import type { CompanionId } from "@/lib/companions/companionRegistry";

function getVoiceConfig(companionId: CompanionId) {
  if (companionId === "atri") return { lang: "zh-CN", rate: 1.02, pitch: 1.18, volume: 0.85 };
  if (companionId === "murasame") return { lang: "zh-CN", rate: 0.92, pitch: 1.08, volume: 0.88 };
  return { lang: "zh-CN", rate: 0.98, pitch: 0.95, volume: 0.82 };
}

export function useCompanionVoice() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stop = useCallback(() => {
    try { audioRef.current?.pause(); audioRef.current = null; } catch {}
    try { window.speechSynthesis?.cancel(); } catch {}
  }, []);
  const speak = useCallback(async (companionId: CompanionId, text: string, audioSrc?: string) => {
    if (typeof window === "undefined") return;
    stop();
    if (audioSrc) {
      try { const audio = new Audio(audioSrc); audio.volume = 0.86; audioRef.current = audio; await audio.play(); return; } catch {}
    }
    if (!("speechSynthesis" in window)) return;
    const config = getVoiceConfig(companionId);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = config.lang; utterance.rate = config.rate;
    utterance.pitch = config.pitch; utterance.volume = config.volume;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [stop]);
  return { speak, stop };
}
