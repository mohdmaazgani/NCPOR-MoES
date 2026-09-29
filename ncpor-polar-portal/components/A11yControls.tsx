"use client";
import { Contrast, Minus, Plus, Wind } from "lucide-react";
import { useEffect, useState } from "react";

const store = (k: string, v: string | null) => {
  try {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
};

export default function A11yControls() {
  const [scale, setScale] = useState(100);
  const [contrast, setContrast] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const d = document.documentElement;
    setScale(parseInt(d.style.fontSize) || 100);
    setContrast(d.dataset.contrast === "high");
    setReduced(d.dataset.motion === "reduced");
  }, []);

  const applyScale = (n: number) => {
    const v = Math.min(130, Math.max(85, n));
    document.documentElement.style.fontSize = `${v}%`;
    store("ncpor-fontscale", String(v));
    setScale(v);
  };
  const toggleContrast = () => {
    const d = document.documentElement;
    if (contrast) delete d.dataset.contrast;
    else d.dataset.contrast = "high";
    store("ncpor-contrast", contrast ? null : "high");
    setContrast(!contrast);
  };
  const toggleMotion = () => {
    const d = document.documentElement;
    if (reduced) delete d.dataset.motion;
    else d.dataset.motion = "reduced";
    store("ncpor-motion", reduced ? null : "reduced");
    setReduced(!reduced);
  };

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Accessibility controls">
      <div className="glass flex items-center rounded-xl">
        <button onClick={() => applyScale(scale - 5)} aria-label="Decrease text size" className="grid h-9 w-9 place-items-center transition active:scale-90"><Minus size={14} /></button>
        <span className="w-12 text-center text-xs font-semibold tabular-nums" aria-live="polite">{scale}%</span>
        <button onClick={() => applyScale(scale + 5)} aria-label="Increase text size" className="grid h-9 w-9 place-items-center transition active:scale-90"><Plus size={14} /></button>
      </div>
      <button onClick={toggleContrast} aria-pressed={contrast} className="chip !py-2"><Contrast size={14} /> High contrast</button>
      <button onClick={toggleMotion} aria-pressed={reduced} className="chip !py-2"><Wind size={14} /> Reduce motion</button>
    </div>
  );
}
