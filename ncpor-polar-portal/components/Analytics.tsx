"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { AUDIENCE, CHANNEL_REACH, RECORDS, VISITS } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

function VisitsChart() {
  const W = 560;
  const H = 200;
  const pad = { l: 40, r: 8, t: 12, b: 26 };
  const max = Math.max(...VISITS.map((v) => v.v));
  const x = (i: number) => pad.l + (i / (VISITS.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const line = VISITS.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(VISITS.length - 1)} ${H - pad.b} L${x(0)} ${H - pad.b} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Monthly portal visits, October to September, rising from 18,200 to 51,900">
      <defs>
        <linearGradient id="vis" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="rgb(var(--glacier))" stopOpacity="0.4" />
          <stop offset="1" stopColor="rgb(var(--glacier))" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={pad.t + t * (H - pad.t - pad.b)} y2={pad.t + t * (H - pad.t - pad.b)} stroke="rgb(var(--line))" strokeOpacity="0.15" strokeDasharray="3 5" />
          <text x={pad.l - 8} y={pad.t + t * (H - pad.t - pad.b) + 4} textAnchor="end" fontSize="10" fill="rgb(var(--muted))">{Math.round((max * (1 - t)) / 1000)}k</text>
        </g>
      ))}
      <path d={area} fill="url(#vis)" />
      <motion.path d={line} fill="none" stroke="rgb(var(--glacier))" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: "easeOut" }} />
      {VISITS.map((p, i) => (
        <g key={p.m}>
          <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))">{p.m}</text>
          {i === VISITS.length - 1 && <circle cx={x(i)} cy={y(p.v)} r="4.5" fill="rgb(var(--aurora))" />}
        </g>
      ))}
    </svg>
  );
}

function Bars({ rows, unit }: { rows: { label: string; v: number }[]; unit?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const inView = useInView(ref, { once: true });
  const max = Math.max(...rows.map((r) => r.v));
  return (
    <ul ref={ref} className="space-y-3.5">
      {rows.map((r, i) => (
        <li key={r.label}>
          <div className="mb-1.5 flex justify-between gap-3 text-sm">
            <span className="truncate text-fg/90">{r.label}</span>
            <span className="shrink-0 tabular-nums text-muted">{formatNumber(r.v)}{unit}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-line/10">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-glacier to-aurora" initial={{ width: 0 }} animate={{ width: inView ? `${(r.v / max) * 100}%` : 0 }} transition={{ duration: 0.9, delay: i * 0.08, ease: "easeOut" }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Analytics() {
  const top = [...RECORDS].sort((a, b) => b.downloads - a.downloads).slice(0, 5).map((r) => ({ label: r.title, v: r.downloads }));
  const total = VISITS.reduce((a, b) => a + b.v, 0);
  const growth = Math.round(((VISITS[11].v - VISITS[0].v) / VISITS[0].v) * 100);

  return (
    <section id="analytics" className="relative mx-auto max-w-[1400px] scroll-mt-24 px-4 py-24 sm:px-6 lg:py-32">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-xl">
          <h2 className="text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-fg sm:text-5xl">Portal analytics</h2>
          <p className="mt-5 text-base leading-relaxed text-muted">Who is using the repository, what they download, and where outreach lands. Figures shown here are sample data for the prototype.</p>
        </div>
        <div className="flex gap-8">
          <div>
            <div className="text-4xl font-bold tabular-nums tracking-tight text-fg">{formatNumber(total)}</div>
            <div className="text-sm text-muted">visits in 12 months</div>
          </div>
          <div>
            <div className="text-4xl font-bold tabular-nums tracking-tight text-aurora">+{growth}%</div>
            <div className="text-sm text-muted">Oct to Sep</div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-12">
        <div className="glass shard p-6 lg:col-span-7">
          <h3 className="mb-4 text-base font-bold text-fg">Monthly visits</h3>
          <VisitsChart />
        </div>
        <div className="glass shard-sm p-6 lg:col-span-5">
          <h3 className="mb-5 text-base font-bold text-fg">Most downloaded records</h3>
          <Bars rows={top} />
        </div>
        <div className="glass shard-sm p-6 lg:col-span-5">
          <h3 className="mb-5 text-base font-bold text-fg">Audience</h3>
          <div className="flex h-4 overflow-hidden rounded-full" role="img" aria-label={AUDIENCE.map((a) => `${a.label} ${a.pct} percent`).join(", ")}>
            {AUDIENCE.map((a, i) => (
              <motion.div key={a.label} initial={{ width: 0 }} whileInView={{ width: `${a.pct}%` }} viewport={{ once: true }} transition={{ duration: 0.9, delay: i * 0.1 }} style={{ background: ["rgb(var(--glacier))", "rgb(var(--aurora))", "#818cf8", "rgb(var(--muted))"][i] }} />
            ))}
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-3 text-sm">
            {AUDIENCE.map((a, i) => (
              <li key={a.label} className="flex items-center gap-2 text-muted">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: ["rgb(var(--glacier))", "rgb(var(--aurora))", "#818cf8", "rgb(var(--muted))"][i] }} />
                <span className="text-fg/90">{a.label}</span>
                <span className="ml-auto tabular-nums">{a.pct}%</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="glass shard p-6 lg:col-span-7">
          <h3 className="mb-5 text-base font-bold text-fg">Outreach reach by channel, last 90 days</h3>
          <Bars rows={CHANNEL_REACH} />
        </div>
      </div>
    </section>
  );
}
