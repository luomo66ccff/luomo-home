"use client";

let isModelReplying = false;
let activeLockToken: symbol | null = null;

export type ModelChatLockToken = symbol;

export function isModelChatLocked() {
  return isModelReplying;
}

export function setModelChatDisabled(disabled: boolean) {
  if (typeof document === "undefined") return;

  const sendButtons = document.querySelectorAll<HTMLButtonElement>(
    "[data-model-chat-send], [data-model-chat-option]"
  );
  const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    "[data-model-chat-input]"
  );

  sendButtons.forEach((button) => {
    button.disabled = disabled;
    button.classList.toggle("is-disabled", disabled);
    button.style.pointerEvents = disabled ? "none" : "";
    button.style.opacity = disabled ? "0.55" : "";
    button.style.cursor = disabled ? "not-allowed" : "";
  });

  inputs.forEach((input) => {
    input.readOnly = disabled;
    input.classList.toggle("is-disabled", disabled);
  });
}

export function acquireModelChatLock(): ModelChatLockToken | null {
  if (isModelReplying || typeof window === "undefined") return null;
  const token = Symbol("model-chat-lock");
  isModelReplying = true;
  activeLockToken = token;
  setModelChatDisabled(true);
  window.dispatchEvent(new CustomEvent("model-chat:lock-change", { detail: { locked: true } }));
  return token;
}

export function tryAcquireModelChatLock() {
  return acquireModelChatLock() !== null;
}

export function releaseModelChatLock(token?: ModelChatLockToken) {
  if (!isModelReplying || (token && activeLockToken !== token)) return false;
  isModelReplying = false;
  activeLockToken = null;
  setModelChatDisabled(false);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("model-chat:lock-change", { detail: { locked: false } }));
  }
  return true;
}
