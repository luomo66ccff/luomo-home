"use client";

import { getVnSettings } from "./settings";

let context: AudioContext | null = null;
const pluckCache = new Map<number, AudioBuffer>();

function audio(): AudioContext | null {
  const settings = getVnSettings();
  if (!settings.sound || typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  context ??= new Ctor();
  if (context.state === "suspended") void context.resume();
  return context;
}

function output(ctx: AudioContext, gainValue: number) {
  const gain = ctx.createGain();
  gain.gain.value = gainValue * getVnSettings().volume;
  gain.connect(ctx.destination);
  return gain;
}

/** Karplus–Strong plucked string, rendered once per frequency. */
function pluckBuffer(ctx: AudioContext, frequency: number): AudioBuffer {
  const cached = pluckCache.get(frequency);
  if (cached) return cached;
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * 2.4);
  const buffer = ctx.createBuffer(1, length, rate);
  const data = buffer.getChannelData(0);
  const period = Math.max(2, Math.round(rate / frequency));
  const ring = new Float32Array(period);
  for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1;
  let index = 0;
  for (let i = 0; i < length; i++) {
    const next = (index + 1) % period;
    const value = 0.4985 * (ring[index] + ring[next]);
    data[i] = ring[index];
    ring[index] = value;
    index = next;
  }
  pluckCache.set(frequency, buffer);
  return buffer;
}

export function pluck(frequency: number) {
  const ctx = audio();
  if (!ctx) return;
  const source = ctx.createBufferSource();
  source.buffer = pluckBuffer(ctx, frequency);
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 3200;
  source.connect(filter).connect(output(ctx, 0.55));
  source.start();
}

function tone(ctx: AudioContext, frequency: number, start: number, duration: number, level: number, type: OscillatorType = "sine") {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(level, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(output(ctx, 1));
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

export function chime(rarity: 3 | 4 | 5) {
  const ctx = audio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const scale = rarity === 5 ? [659.25, 830.61, 987.77, 1318.51] : rarity === 4 ? [587.33, 739.99, 880] : [523.25, 659.25];
  scale.forEach((frequency, i) => {
    tone(ctx, frequency, now + i * 0.11, 1.4, 0.16);
    tone(ctx, frequency * 2, now + i * 0.11, 0.6, 0.04, "triangle");
  });
}

export function blip() {
  const ctx = audio();
  if (!ctx) return;
  tone(ctx, 880, ctx.currentTime, 0.12, 0.05, "triangle");
}
