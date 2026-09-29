"use client";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { EXPEDITIONS, METRICS } from "@/lib/data";
import { useCountUp } from "@/lib/hooks";
import { formatNumber } from "@/lib/utils";

function Trend({ seed }: { seed: number }) {
  const pts = Array.from({ length: 12 }, (_, i) => 10 - i * 0.55 + Math.sin(i * 1.7 + seed) * 2.2);
  const d = pts.map((y, i) => `${i ? "L" : "M"}${i * 6} ${Math.max(1, y).toFixed(1)}`).join(" ");
  return (
    <svg viewBox="0 0 66 12" className="h-3 w-16" aria-hidden>
      <path d={d} fill="none" stroke="rgb(var(--aurora))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stat({ value, label, delta, seed, run }: { value: number; label: string; delta: string; seed: number; run: boolean }) {
  const n = useCountUp(value, run);
  return (
    <div className="flex flex-col gap-1 px-5 py-4 sm:px-7">
      <div className="text-3xl font-bold tabular-nums tracking-tight text-fg sm:text-4xl">{formatNumber(n)}</div>
      <div className="text-sm font-medium text-fg/85">{label}</div>
      <div className="flex items-center gap-2 text-xs text-muted">
        <Trend seed={seed} />
        {delta}
      </div>
    </div>
  );
}

export default function MetricsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const active = EXPEDITIONS.filter((e) => e.status === "Active").length;

  return (
    <div ref={ref} className="glass shard relative z-10 mx-auto grid max-w-[1400px] grid-cols-2 divide-line/15 lg:grid-cols-4 lg:divide-x [&>*:nth-child(odd)]:border-r [&>*:nth-child(odd)]:border-line/15 lg:[&>*]:border-r-0 [&>*:nth-child(n+3)]:border-t [&>*:nth-child(n+3)]:border-line/15 lg:[&>*:nth-child(n+3)]:border-t-0">
      <Stat value={active} label="Active expeditions" delta="across 3 regions" seed={1} run={inView} />
      <Stat value={METRICS.datasets} label="Datasets published" delta="38 added this quarter" seed={2} run={inView} />
      <Stat value={METRICS.papers} label="Research papers archived" delta="112 added this quarter" seed={3} run={inView} />
      <Stat value={METRICS.media} label="High-res media assets" delta="640 added this quarter" seed={4} run={inView} />
    </div>
  );
}
