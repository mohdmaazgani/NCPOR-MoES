"use client";
import { ArrowDown, Database, Globe } from "lucide-react";
import dynamic from "next/dynamic";
import { Component, useState } from "react";
import { STATIONS, type FocusKey } from "@/lib/data";
import { useEvent } from "@/lib/hooks";
import { cn, emit, scrollToId } from "@/lib/utils";
import { useWeather } from "./WeatherContext";
import MetricsBar from "./MetricsBar";

const PolarGlobe = dynamic(() => import("./PolarGlobe"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <div className="h-[62%] w-[62%] animate-pulse rounded-full bg-glacier/10 ring-1 ring-glacier/30" />
    </div>
  ),
});

class GlobeBoundary extends Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="grid h-full w-full place-items-center p-8 text-center text-sm text-muted">
          <div>
            <div
              className="mx-auto mb-4 h-40 w-40 rounded-full ring-1 ring-glacier/40"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, rgb(var(--glacier) / 0.35), rgb(var(--surface)))",
              }}
            />
            The 3D globe needs WebGL. Station data is still available in the
            ticker above and the expedition timeline below.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const FOCUS_CHIPS: { key: FocusKey; label: string }[] = [
  { key: "antarctic", label: "Antarctica" },
  { key: "arctic", label: "Arctic" },
  { key: "himalaya", label: "Himalaya" },
  { key: "free", label: "Free orbit" },
];

export default function Hero() {
  const [focus, setFocus] = useState<FocusKey>("free");
  const wx = useWeather();

  useEvent<{ focus: FocusKey }>("portal:focus", (d) => setFocus(d.focus));

  return (
    <section id="home" className="relative overflow-hidden pt-28 sm:pt-32">
      <div
        aria-hidden
        className="polar-grid pointer-events-none absolute left-1/2 top-[38%] h-[1300px] w-[1300px] -translate-x-1/2 -translate-y-1/2 lg:left-[68%]"
      />
      <div
        aria-hidden
        className="hairline-grid pointer-events-none absolute inset-0"
      />

      <div className="relative mx-auto grid max-w-[1400px] items-center px-4 sm:px-6 lg:min-h-[calc(100vh-13rem)] lg:grid-cols-12">
        <div className="relative z-10 py-8 lg:col-span-6 lg:py-16">
          <p className="mb-5 flex w-fit items-center gap-2 rounded-full border border-aurora/40 bg-aurora/10 px-3 py-1 text-xs font-semibold text-aurora">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping2 rounded-full bg-aurora" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-aurora" />
            </span>
            Wintering parties are on station at Bharati and Maitri
          </p>
          <h1 className="text-[2.75rem] font-extrabold leading-[0.98] tracking-[-0.045em] text-fg sm:text-6xl xl:text-[5.25rem]">
            Unveiling the Secrets of the Earth&apos;s Poles
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            Every Indian polar expedition since 1981 in one place: field
            reports, open datasets, papers, photographs and film. Explore the
            stations, read the science, and share it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className="btn-primary"
              onClick={() => {
                setFocus("antarctic");
                if (window.innerWidth < 1024)
                  document
                    .getElementById("globe-stage")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              <Globe size={18} /> Explore Interactive Globe
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                scrollToId("repository");
                emit("portal:filter", { kind: "Dataset" });
              }}
            >
              <Database size={18} /> Access Scientific Datasets
            </button>
          </div>
          <div className="mt-10 hidden items-center gap-3 text-xs text-muted lg:flex">
            <ArrowDown size={14} className="text-glacier" />
            Hover a pin on the globe for live station conditions
          </div>
        </div>

        {/* Globe: oversized and bleeding off the right edge on desktop */}
        <div
          id="globe-stage"
          className="relative z-0 mx-auto -mt-2 aspect-square w-full max-w-[560px] lg:absolute lg:-right-[2vw] lg:top-1/2 lg:mx-0 lg:mt-0 lg:w-[min(45vw,680px)] lg:max-w-none lg:-translate-y-1/2"
        >
          <GlobeBoundary>
            <PolarGlobe focus={focus} wx={wx} />
          </GlobeBoundary>

          <div
            className="glass shard-sm absolute -bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-1 p-1"
            role="group"
            aria-label="Globe focus"
          >
            {FOCUS_CHIPS.map((c) => (
              <button
                key={c.key}
                aria-pressed={focus === c.key}
                onClick={() => setFocus(c.key)}
                className={cn(
                  "chip border-transparent",
                  focus === c.key && "!border-glacier/60",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
          <span className="sr-only">
            Stations on the globe:{" "}
            {STATIONS.map((s) => `${s.name} at ${s.place}`).join("; ")}.
          </span>
        </div>
      </div>

      <div className="relative z-10 px-4 pb-10 pt-6 sm:px-6 lg:pt-12">
        <MetricsBar />
      </div>
    </section>
  );
}
