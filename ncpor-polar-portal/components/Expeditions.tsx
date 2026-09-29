"use client";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Crosshair, Rows3, GalleryHorizontal } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { EXPEDITIONS, EXPEDITION_FILTERS, type Expedition } from "@/lib/data";
import { useEvent } from "@/lib/hooks";
import { cn, emit, scrollToId } from "@/lib/utils";

function StatusDot({ status }: { status: Expedition["status"] }) {
  if (status === "Active")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-aurora">
        <span className="relative flex h-2 w-2">
          <span className="absolute h-full w-full animate-ping2 rounded-full bg-aurora" />
          <span className="h-2 w-2 rounded-full bg-aurora" />
        </span>
        Active now
      </span>
    );
  return <span className={cn("text-xs font-semibold", status === "Planned" ? "text-amber-400" : "text-muted")}>{status}</span>;
}

function Entry({ e, highlight, offset }: { e: Expedition; highlight: boolean; offset?: boolean }) {
  return (
    <article
      id={`exp-${e.id}`}
      className={cn(
        "glass glass-hover shard-sm relative flex h-full w-[300px] shrink-0 snap-start flex-col p-5 transition-transform",
        offset && "md:translate-y-10",
        highlight && "!border-aurora shadow-[0_0_40px_-6px_rgb(var(--aurora)/0.6)]"
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-4xl font-extrabold tracking-[-0.04em] tabular-nums text-fg">{e.year}</span>
        <StatusDot status={e.status} />
      </div>
      <h3 className="mt-3 text-base font-bold leading-snug text-fg">{e.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{e.detail}</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="tag">{e.where}</span>
        <button
          onClick={() => {
            scrollToId("home");
            emit("portal:focus", { focus: e.focus });
          }}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-glacier transition hover:bg-glacier/10 active:scale-95"
        >
          <Crosshair size={13} /> Show on globe
        </button>
      </div>
    </article>
  );
}

export default function Expeditions() {
  const [filter, setFilter] = useState<(typeof EXPEDITION_FILTERS)[number]>("All");
  const [layout, setLayout] = useState<"horizontal" | "vertical">("horizontal");
  const [hl, setHl] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const list = useMemo(() => EXPEDITIONS.filter((e) => filter === "All" || e.where === filter), [filter]);

  useEvent<{ id: string }>("portal:expedition", ({ id }) => {
    setFilter("All");
    setHl(id);
    setTimeout(() => {
      const el = document.getElementById(`exp-${id}`);
      el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }, 350);
    setTimeout(() => setHl(null), 3200);
  });

  const nudge = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * 620, behavior: "smooth" });

  return (
    <section id="expeditions" className="relative scroll-mt-24 py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <h2 className="text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-fg sm:text-5xl">Forty-five years on the ice, the fjords and the glaciers</h2>
            <p className="mt-5 text-base leading-relaxed text-muted">
              From a 21-member party in 1981 to year-round stations at both poles and in the Himalaya. Select any entry to fly the globe to where it happened.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by region">
              {EXPEDITION_FILTERS.map((f) => (
                <button key={f} className="chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
            <div className="glass flex rounded-xl p-1" role="group" aria-label="Timeline layout">
              <button aria-label="Horizontal timeline" aria-pressed={layout === "horizontal"} onClick={() => setLayout("horizontal")} className={cn("grid h-8 w-8 place-items-center rounded-lg text-muted", layout === "horizontal" && "bg-glacier/20 text-fg")}>
                <GalleryHorizontal size={16} />
              </button>
              <button aria-label="Vertical timeline" aria-pressed={layout === "vertical"} onClick={() => setLayout("vertical")} className={cn("grid h-8 w-8 place-items-center rounded-lg text-muted", layout === "vertical" && "bg-glacier/20 text-fg")}>
                <Rows3 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {layout === "horizontal" ? (
        <div className="relative mt-14">
          <div ref={scroller} data-lenis-prevent-wheel className="thin-scroll flex snap-x snap-proximity gap-5 overflow-x-auto px-4 pb-16 pt-2 sm:px-6 md:pb-24 lg:px-[max(1.5rem,calc((100vw-1400px)/2+1.5rem))]">
            {/* latitude ruler running behind the cards */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[calc(50%-1.5rem)] hidden h-px bg-gradient-to-r from-transparent via-glacier/50 to-transparent md:block" />
            {list.map((e, i) => (
              <motion.div key={e.id} initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: Math.min(i, 4) * 0.05, duration: 0.5 }}>
                <Entry e={e} highlight={hl === e.id} offset={i % 2 === 1} />
              </motion.div>
            ))}
          </div>
          <div className="mx-auto mt-2 flex max-w-[1400px] justify-end gap-2 px-4 sm:px-6">
            <button onClick={() => nudge(-1)} aria-label="Earlier expeditions" className="glass glass-hover grid h-11 w-11 place-items-center rounded-full active:scale-90"><ChevronLeft size={18} /></button>
            <button onClick={() => nudge(1)} aria-label="Later expeditions" className="glass glass-hover grid h-11 w-11 place-items-center rounded-full active:scale-90"><ChevronRight size={18} /></button>
          </div>
        </div>
      ) : (
        <div className="relative mx-auto mt-14 max-w-3xl px-4 sm:px-6">
          <div aria-hidden className="absolute bottom-0 left-[1.6rem] top-0 w-px bg-gradient-to-b from-glacier/60 via-line/20 to-transparent sm:left-[2.35rem]" />
          <ol className="space-y-6">
            {list.map((e) => (
              <li key={e.id} className="relative pl-10 sm:pl-14">
                <span aria-hidden className={cn("absolute left-[0.6rem] top-7 h-3 w-3 rounded-full border-2 border-glacier bg-bg sm:left-[1.35rem]", e.status === "Active" && "bg-aurora border-aurora")} />
                <div className="[&>article]:w-full">
                  <Entry e={e} highlight={hl === e.id} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
