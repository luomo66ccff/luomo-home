"use client";

import { useEffect } from "react";

const visibleSections = new Map<string, boolean>();
const listeners = new Set<() => void>();

/** Canvas consumers share the section observer instead of measuring their own bounds. */
export function homeActivityActive(section?: string) {
  return !document.hidden && document.documentElement.dataset.boot !== "1"
    && (!section || (document.documentElement.dataset.homeScrolling !== "true"
      && visibleSections.get(section) !== false));
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
    const mobile = window.matchMedia("(max-width: 767px)");
    let scrollIdle: ReturnType<typeof setTimeout> | undefined;
    let warmIdle: number | undefined;
    let warmTimer: ReturnType<typeof setTimeout> | undefined;
    let warmFrame = 0;
    let disposed = false;
    let touching = false;
    // Browsers realize auto sections several screens ahead of the viewport.
    // Prepare only those two scenes before the hero-to-route gesture, one per
    // idle frame; keep the more distant sections deferred.
    const warmQueue = sections.filter(section => ["operations", "projects"].includes(section.id));
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

    // Keep the last rendered scene during a phone gesture. Resume its existing
    // CSS/SMIL/canvas timelines after scrolling settles, including inertia.
    const finishScroll = () => {
      clearTimeout(scrollIdle);
      scrollIdle = undefined;
      if (touching) return;
      if (root.dataset.homeScrolling !== "true") return;
      delete root.dataset.homeScrolling;
      sync();
      scheduleWarm();
    };
    const onScroll = () => {
      if (!mobile.matches || document.hidden) return;
      clearTimeout(scrollIdle);
      cancelWarm();
      if (root.dataset.homeScrolling !== "true") {
        root.dataset.homeScrolling = "true";
        sync();
      }
      if (!touching) scrollIdle = setTimeout(finishScroll, 200);
    };
    const onTouchStart = (event: TouchEvent) => {
      touching = event.touches.length > 0;
      onScroll();
    };
    const onTouchEnd = (event: TouchEvent) => {
      touching = event.touches.length > 0;
      if (!touching) onScroll();
    };

    const cancelWarm = () => {
      if (warmIdle !== undefined) window.cancelIdleCallback(warmIdle);
      clearTimeout(warmTimer);
      cancelAnimationFrame(warmFrame);
      warmIdle = warmTimer = undefined;
      warmFrame = 0;
    };
    const scheduleWarm = () => {
      if (disposed || !warmQueue.length || !mobile.matches || document.hidden
        || root.dataset.homeScrolling === "true" || warmIdle !== undefined
        || warmTimer !== undefined || warmFrame) return;
      // Continuous decorative animation can otherwise starve idle work. The
      // bounded callback is still cancelled on touch/scroll and handles one scene.
      if ("requestIdleCallback" in window) warmIdle = window.requestIdleCallback(warmNext, { timeout: 750 });
      else warmTimer = setTimeout(warmNext, 300);
    };
    const warmNext = () => {
      warmIdle = undefined;
      warmTimer = undefined;
      if (disposed) return;
      if (!mobile.matches || document.hidden || root.dataset.homeScrolling === "true") return;
      const section = warmQueue.shift();
      if (section) {
        section.dataset.homeWarmed = "true";
        // Complete this one layout in the idle task instead of leaving it for
        // the next touch event. A separate rendered frame precedes the next task.
        void section.offsetHeight;
      }
      warmFrame = requestAnimationFrame(() => {
        warmFrame = 0;
        warmTimer = setTimeout(() => { warmTimer = undefined; scheduleWarm(); }, 300);
      });
    };
    const onVisibilityChange = () => {
      sync();
      if (document.hidden) { cancelWarm(); touching = false; finishScroll(); }
      else scheduleWarm();
    };
    const onMobileChange = () => {
      cancelWarm();
      touching = false;
      finishScroll();
      scheduleWarm();
    };
    void document.fonts.ready.then(scheduleWarm);

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
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    mobile.addEventListener("change", onMobileChange);
    reduce.addEventListener("change", sync);
    desktopMap.addEventListener("change", sync);
    sync();
    // Start under the opening gate when possible; waiting for every font can
    // push both preparations into the already animated, visible first scene.
    scheduleWarm();

    return () => {
      observer?.disconnect();
      mutations.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("scroll", onScroll);
      mobile.removeEventListener("change", onMobileChange);
      clearTimeout(scrollIdle);
      disposed = true;
      cancelWarm();
      reduce.removeEventListener("change", sync);
      desktopMap.removeEventListener("change", sync);
      svgs.flat().forEach(svg => svg.unpauseAnimations?.());
      sections.forEach(section => { delete section.dataset.homeActive; delete section.dataset.homeWarmed; });
      visibleSections.clear();
      delete root.dataset.homePaused;
      delete root.dataset.homeHidden;
      delete root.dataset.homeScrolling;
    };
  }, []);
  return null;
}
