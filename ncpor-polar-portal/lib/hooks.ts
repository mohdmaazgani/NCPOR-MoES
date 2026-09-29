"use client";
import { useEffect, useRef, useState } from "react";
import { getLenis } from "./utils";

/** Subscribe to a window CustomEvent for cross-section communication. */
export function useEvent<T>(name: string, handler: (detail: T) => void) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const fn = (e: Event) => ref.current((e as CustomEvent<T>).detail);
    window.addEventListener(name, fn);
    return () => window.removeEventListener(name, fn);
  }, [name]);
}

/** Freeze page scroll (and Lenis) while a modal is open. */
export function useLockScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const l = getLenis();
    l?.stop();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
      l?.start();
    };
  }, [active]);
}

export function useEscape(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onEscape();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [active, onEscape]);
}

export function useCountUp(target: number, run: boolean, ms = 1700) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, ms]);
  return v;
}
