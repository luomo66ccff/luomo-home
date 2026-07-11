"use client";

let isModelReplying = false;

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

export function tryAcquireModelChatLock() {
  if (isModelReplying) return false;
  isModelReplying = true;
  setModelChatDisabled(true);
  window.dispatchEvent(new CustomEvent("model-chat:lock-change", { detail: { locked: true } }));
  return true;
}

export function releaseModelChatLock() {
  isModelReplying = false;
  setModelChatDisabled(false);
  window.dispatchEvent(new CustomEvent("model-chat:lock-change", { detail: { locked: false } }));
}
