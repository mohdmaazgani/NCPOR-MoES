"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { STATIONS, type Wx } from "@/lib/data";

type WxMap = Record<string, Wx>;

const initial = (): WxMap =>
  Object.fromEntries(STATIONS.map((s) => [s.id, { temp: s.baseline.temp, wind: s.baseline.wind, live: false }]));

const Ctx = createContext<WxMap>(initial());
export const useWeather = () => useContext(Ctx);

interface OpenMeteoPoint {
  current?: { temperature_2m?: number; wind_speed_10m?: number; time?: string };
}

/**
 * Pulls current conditions for every station from Open-Meteo (free, no key).
 * If the request fails the baseline seasonal values are shown and flagged as not live.
 */
export default function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [wx, setWx] = useState<WxMap>(initial);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const lat = STATIONS.map((s) => s.lat).join(",");
        const lon = STATIONS.map((s) => s.lon).join(",");
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&wind_speed_unit=ms`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as OpenMeteoPoint | OpenMeteoPoint[];
        const arr = Array.isArray(json) ? json : [json];
        if (cancelled) return;
        setWx((prev) => {
          const next = { ...prev };
          STATIONS.forEach((s, i) => {
            const c = arr[i]?.current;
            if (c && typeof c.temperature_2m === "number" && typeof c.wind_speed_10m === "number") {
              next[s.id] = {
                temp: Math.round(c.temperature_2m * 10) / 10,
                wind: Math.round(c.wind_speed_10m * 10) / 10,
                live: true,
                updated: c.time,
              };
            }
          });
          return next;
        });
      } catch {
        /* keep baseline values */
      }
    }
    load();
    const t = setInterval(load, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return <Ctx.Provider value={wx}>{children}</Ctx.Provider>;
}
