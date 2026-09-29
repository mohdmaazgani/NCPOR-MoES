"use client";
import { useId } from "react";

interface Props {
  values: number[];
  height?: number;
  axes?: boolean;
  unit?: string;
  className?: string;
}

/** Small smooth area chart used for dataset previews. */
export default function Spark({ values, height = 56, axes = false, unit, className }: Props) {
  const id = useId().replace(/:/g, "");
  const W = 320;
  const padL = axes ? 34 : 2;
  const padB = axes ? 18 : 2;
  const padT = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [
    padL + (i / (values.length - 1)) * (W - padL - 2),
    padT + (1 - (v - min) / span) * (height - padT - padB),
  ]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]} ${height - padB} L${pts[0][0]} ${height - padB} Z`;
  const fmt = (n: number) => (Math.abs(n) >= 100 ? Math.round(n).toString() : n.toFixed(1));

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className={className} role="img" aria-label={`Preview chart${unit ? ` in ${unit}` : ""}`} preserveAspectRatio={axes ? "xMidYMid meet" : "none"}>
      <defs>
        <linearGradient id={`g${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="rgb(var(--glacier))" stopOpacity="0.45" />
          <stop offset="1" stopColor="rgb(var(--glacier))" stopOpacity="0" />
        </linearGradient>
      </defs>
      {axes &&
        [0, 0.5, 1].map((t) => {
          const y = padT + t * (height - padT - padB);
          return (
            <g key={t}>
              <line x1={padL} x2={W} y1={y} y2={y} stroke="rgb(var(--line))" strokeOpacity="0.18" strokeDasharray="3 4" />
              <text x={padL - 5} y={y + 3} textAnchor="end" fontSize="9" fill="rgb(var(--muted))">
                {fmt(max - t * span)}
              </text>
            </g>
          );
        })}
      <path d={area} fill={`url(#g${id})`} />
      <path d={line} fill="none" stroke="rgb(var(--glacier))" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {axes && (
        <text x={W} y={height - 3} textAnchor="end" fontSize="9" fill="rgb(var(--muted))">
          {values.length} periods
        </text>
      )}
    </svg>
  );
}
