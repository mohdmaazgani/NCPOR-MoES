"use client";
import { STATIONS } from "@/lib/data";
import { useWeather } from "./WeatherContext";

export default function WeatherTicker() {
  const wx = useWeather();
  const items = STATIONS.map((s) => ({ s, w: wx[s.id] }));
  const row = (suffix: string) =>
    items.map(({ s, w }) => (
      <span key={s.id + suffix} className="flex shrink-0 items-center gap-2 px-6 text-xs">
        <span className={`h-1.5 w-1.5 rounded-full ${w.live ? "bg-aurora" : "bg-amber-400"}`} />
        <span className="font-semibold text-fg">{s.name}</span>
        <span className="tabular-nums text-muted">
          {w.temp.toFixed(1)}°C, wind {w.wind.toFixed(1)} m/s
        </span>
        <span className="text-muted/70">{s.place.split(",")[0]}</span>
      </span>
    ));

  return (
    <div className="marquee relative flex h-8 items-center overflow-hidden border-b border-line/10 bg-surface/60" role="region" aria-label="Weather at Indian polar research stations">
      <div className="marquee-track flex w-max">
        {row("a")}
        {row("b")}
        {row("c")}
        {row("d")}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-bg to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-bg to-transparent" />
    </div>
  );
}
