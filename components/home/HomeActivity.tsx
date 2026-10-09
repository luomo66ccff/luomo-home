"use client";

import { useEffect } from "react";

const visibleSections = new Map<string, boolean>();
const listeners = new Set<() => void>();

/** Canvas consumers share the section observer instead of measuring their own bounds. */
export function homeActivityActive(section?: string) {
  return !document.hidden && document.documentElement.dataset.boot !== "1"
    && (!section || visibleSections.get(section) !== false);
}

export function subscribeHomeActivity(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export default function HomeActivity() {
  useEffect(() => {
    const root = document.documentElement;
    const main = document.getElementById("main");
    const sections = Array.from(document.querySelectorAll<HTMLElement>("#main > section"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopMap = window.matchMedia("(min-width: 861px)");
    const collectSvgs = () => sections.map(section => Array.from(section.querySelectorAll<SVGSVGElement>("svg")));
    let svgs = collectSvgs();
    const paused = new Map<SVGSVGElement, boolean>();
    visibleSections.clear();
    sections.forEach(section => visibleSections.set(section.id, section.id === "hero"));

    const sync = () => {
      const globallyPaused = String(!homeActivityActive());
      const hidden = String(document.hidden);
      if (root.dataset.homePaused !== globallyPaused) root.dataset.homePaused = globallyPaused;
      if (root.dataset.homeHidden !== hidden) root.dataset.homeHidden = hidden;
      sections.forEach((section, index) => {
        const active = homeActivityActive(section.id);
        if (section.dataset.homeActive !== String(active)) section.dataset.homeActive = String(active);
        for (const svg of svgs[index]) {
          const shouldPause = !active || reduce.matches
            || (svg.dataset.homeMotion === "desktop" && !desktopMap.matches);
          if (paused.get(svg) === shouldPause) continue;
          paused.set(svg, shouldPause);
          if (shouldPause) svg.pauseAnimations?.();
          else svg.unpauseAnimations?.();
        }
      });
      listeners.forEach(listener => listener());
    };

    // A single observer covers the scene, banners and every other section.
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(entries => {
      for (const entry of entries) visibleSections.set(entry.target.id, entry.isIntersecting);
      sync();
    }, { rootMargin: "80px 0px" });
    if (observer) sections.forEach(section => observer.observe(section));
    else sections.forEach(section => visibleSections.set(section.id, true));
    const mutations = new MutationObserver(records => {
      // Text/dialog updates do not rescan the page. Newly inserted SVG roots must
      // inherit the current paused timeline just like late-mounted canvas consumers.
      const svgChanged = records.some(record => record.type === "childList"
        && [...record.addedNodes, ...record.removedNodes].some(node => node instanceof Element
          && (node.matches("svg") || node.querySelector("svg"))));
      if (svgChanged) {
        svgs = collectSvgs();
        for (const svg of paused.keys()) if (!svg.isConnected) paused.delete(svg);
      }
      if (svgChanged || records.some(record => record.type === "attributes")) sync();
    });
    mutations.observe(root, { attributes: true, attributeFilter: ["data-boot", "data-theme"] });
    if (main) mutations.observe(main, { childList: true, subtree: true });
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", sync);
    desktopMap.addEventListener("change", sync);
    sync();

    return () => {
      observer?.disconnect();
      mutations.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", sync);
      desktopMap.removeEventListener("change", sync);
      svgs.flat().forEach(svg => svg.unpauseAnimations?.());
      sections.forEach(section => { delete section.dataset.homeActive; });
      visibleSections.clear();
      delete root.dataset.homePaused;
      delete root.dataset.homeHidden;
    };
  }, []);
  return null;
}
