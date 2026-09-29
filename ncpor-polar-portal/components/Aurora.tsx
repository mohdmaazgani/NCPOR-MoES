"use client";
import { useEffect, useRef } from "react";

/**
 * Full-viewport aurora: three drifting curtains plus a slow field of ice crystals.
 * Rendered at half resolution (it is soft by design) and paused when reduced motion is requested.
 */
export default function Aurora() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const SCALE = 0.5;
    let w = 0;
    let h = 0;
    let raf = 0;
    const crystals = Array.from({ length: 60 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.3 + 0.3,
      s: Math.random() * 0.00004 + 0.00001,
      p: Math.random() * 6.28,
    }));
    const bands = [
      { rgb: "52,211,153", y: 0.24, amp: 0.07, f: 1.6, sp: 0.00016, hgt: 0.32, a: 0.34 },
      { rgb: "56,189,248", y: 0.32, amp: 0.09, f: 1.1, sp: -0.00011, hgt: 0.38, a: 0.28 },
      { rgb: "129,140,248", y: 0.18, amp: 0.05, f: 2.3, sp: 0.00009, hgt: 0.26, a: 0.16 },
    ];

    const resize = () => {
      w = Math.ceil(window.innerWidth * SCALE);
      h = Math.ceil(window.innerHeight * SCALE);
      cv.width = w;
      cv.height = h;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const b of bands) {
        const step = 10;
        const top: number[] = [];
        const hgt: number[] = [];
        for (let x = 0; x <= w + step; x += step) {
          const nx = x / w;
          const y =
            h * b.y +
            Math.sin(nx * Math.PI * b.f + t * b.sp * 6) * h * b.amp +
            Math.sin(nx * Math.PI * b.f * 2.7 - t * b.sp * 4) * h * b.amp * 0.4;
          top.push(y);
          hgt.push(h * b.hgt * (0.65 + 0.35 * Math.sin(nx * 6 + t * b.sp * 9)));
        }
        const grad = ctx.createLinearGradient(0, h * (b.y - b.amp), 0, h * (b.y + b.hgt + b.amp));
        grad.addColorStop(0, `rgba(${b.rgb},0)`);
        grad.addColorStop(0.35, `rgba(${b.rgb},${b.a})`);
        grad.addColorStop(1, `rgba(${b.rgb},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        top.forEach((y, i) => (i ? ctx.lineTo(i * step, y) : ctx.moveTo(0, y)));
        for (let i = top.length - 1; i >= 0; i--) ctx.lineTo(i * step, top[i] + hgt[i]);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      for (const c of crystals) {
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.0006 + c.p));
        ctx.fillStyle = `rgba(226,244,255,${0.55 * tw})`;
        ctx.beginPath();
        ctx.arc(((c.x + t * c.s) % 1) * w, c.y * h, c.r, 0, 6.283);
        ctx.fill();
      }
    };

    const loop = (t: number) => {
      const reduced =
        document.documentElement.dataset.motion === "reduced" ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduced) draw(t);
      raf = requestAnimationFrame(loop);
    };
    draw(0);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)",
        maskImage: "linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)",
      }}
    >
      <canvas ref={ref} className="aurora-canvas h-full w-full blur-[6px]" />
    </div>
  );
}
