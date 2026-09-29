export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/** Deterministic PRNG so generated artwork is stable between renders. */
export function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function hashStr(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

type LenisLike = {
  scrollTo: (t: number | HTMLElement, o?: { offset?: number }) => void;
  stop: () => void;
  start: () => void;
};

export function getLenis(): LenisLike | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { __lenis?: LenisLike }).__lenis;
}

export function scrollToId(id: string) {
  const l = getLenis();
  if (id === "home") {
    if (l) l.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  if (l) l.scrollTo(el, { offset: -88 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function emit<T>(name: string, detail?: T) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function downloadBlob(filename: string, content: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-IN").format(n);
}
