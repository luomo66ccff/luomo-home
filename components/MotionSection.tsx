"use client";

import { ReactNode, useRef, useEffect, useState } from "react";

interface Props {
  children: ReactNode;
  id?: string;
  className?: string;
  threshold?: number;
  delay?: number;
}

export default function MotionSection({
  children,
  id,
  className = "",
  threshold = 0.15,
  delay = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReduced = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, delay, prefersReduced]);

  return (
    <div
      ref={ref}
      id={id}
      className={"transition-all duration-1000 ease-out " + className + " " + (isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12")}
      style={{ transitionDelay: delay + "ms" }}
    >
      {children}
    </div>
  );
}
