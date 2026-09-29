"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, FileText, Pause, Play, X, Image as ImageIcon, Video, BarChart3 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MEDIA, MEDIA_TABS, type MediaItem } from "@/lib/data";
import { useEscape, useLockScroll } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import MediaArt from "./MediaArt";

const ASPECT = { tall: "aspect-[3/4]", wide: "aspect-[16/10]", square: "aspect-square" } as const;
const TYPE_ICON = {
  Photos: <ImageIcon size={13} />,
  Videos: <Video size={13} />,
  Infographics: <BarChart3 size={13} />,
  "Press Releases": <FileText size={13} />,
};

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function Tile({ m, onOpen }: { m: MediaItem; onOpen: () => void }) {
  const isDoc = m.type === "Press Releases";
  return (
    <button
      onClick={onOpen}
      className={cn("group glass-hover relative mb-4 block w-full overflow-hidden text-left [break-inside:avoid]", isDoc ? "glass shard-sm p-5" : cn("shard-sm border border-line/15", ASPECT[m.ratio]))}
      aria-label={`Open ${m.type.toLowerCase()}: ${m.title}`}
    >
      {isDoc ? (
        <>
          <span className="tag mb-4">{TYPE_ICON[m.type]} Press release</span>
          <h3 className="text-lg font-bold leading-snug text-fg">{m.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{m.caption}</p>
          <p className="mt-4 text-xs text-muted">{fmtDate(m.date)}, {m.credit}</p>
        </>
      ) : (
        <>
          <MediaArt id={m.id} scene={m.scene} hue={m.hue} className="absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          {m.stat && (
            <div className="absolute inset-x-4 top-4">
              <div className="text-3xl font-extrabold leading-none tracking-tight text-white drop-shadow sm:text-4xl">{m.stat.value}</div>
              <div className="mt-1 max-w-[16ch] text-xs font-medium text-white/85">{m.stat.label}</div>
            </div>
          )}
          {m.type === "Videos" && (
            <>
              <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-black/40 text-white backdrop-blur transition group-hover:scale-110 group-hover:bg-glacier/70">
                <Play size={22} className="ml-0.5" fill="currentColor" />
              </span>
              <span className="absolute right-3 top-3 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white">{m.duration}</span>
            </>
          )}
          <div className="absolute inset-x-0 bottom-0 p-4">
            <span className="mb-2 inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">{TYPE_ICON[m.type]} {m.type === "Photos" ? "Photo" : m.type === "Videos" ? "Video" : "Infographic"}</span>
            <div className="text-sm font-bold leading-snug text-white">{m.title}</div>
          </div>
        </>
      )}
    </button>
  );
}

function Lightbox({ items, index, setIndex, onClose }: { items: MediaItem[]; index: number; setIndex: (i: number) => void; onClose: () => void }) {
  const m = items[index];
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useLockScroll(true);
  useEscape(true, onClose);

  const step = useCallback((d: number) => setIndex((index + d + items.length) % items.length), [index, items.length, setIndex]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [step]);

  useEffect(() => {
    setPlaying(false);
    setProgress(0);
  }, [index]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setProgress((p) => (p >= 100 ? 0 : p + 0.5)), 50);
    return () => clearInterval(t);
  }, [playing]);

  return (
    <motion.div className="fixed inset-0 z-[85] flex flex-col bg-black/90 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={m.title}>
      <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
        <span className="text-sm tabular-nums text-white/70">{index + 1} of {items.length}</span>
        <button onClick={onClose} aria-label="Close viewer" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 active:scale-90"><X size={18} /></button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-16" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <button onClick={() => step(-1)} aria-label="Previous" className="absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25 active:scale-90 sm:left-5"><ChevronLeft size={20} /></button>
        <button onClick={() => step(1)} aria-label="Next" className="absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25 active:scale-90 sm:right-5"><ChevronRight size={20} /></button>

        <AnimatePresence mode="wait">
          <motion.div key={m.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }} className="flex max-h-full w-full max-w-5xl justify-center">
            {m.type === "Press Releases" ? (
              <div data-lenis-prevent className="thin-scroll max-h-[68vh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-2xl bg-white p-8 text-slate-800 sm:p-10">
                <div className="text-xs font-semibold text-sky-700">National Centre for Polar and Ocean Research, press release</div>
                <h3 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-slate-900">{m.title}</h3>
                <p className="mt-2 text-xs text-slate-500">{fmtDate(m.date)}, {m.credit}</p>
                <div className="mt-5 space-y-4 text-[15px] leading-relaxed">{m.body?.map((p, i) => <p key={i}>{p}</p>)}</div>
              </div>
            ) : (
              <div className={cn("relative w-full overflow-hidden rounded-2xl border border-white/10", m.ratio === "tall" ? "aspect-[4/5] max-h-[68vh] max-w-[55vh]" : "aspect-[16/10] max-h-[68vh]")}>
                <MediaArt id={m.id} scene={m.scene} hue={m.hue} className={cn("h-full w-full", playing && "scale-110 transition-transform duration-[20s] ease-linear")} />
                {m.stat && (
                  <div className="absolute inset-0 grid place-items-center bg-black/30 p-6 text-center">
                    <div>
                      <div className="text-6xl font-extrabold tracking-tight text-white sm:text-7xl">{m.stat.value}</div>
                      <div className="mt-2 text-base text-white/85">{m.stat.label}</div>
                    </div>
                  </div>
                )}
                {m.type === "Videos" && (
                  <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                    <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-black transition active:scale-90">
                      {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="ml-0.5" fill="currentColor" />}
                    </button>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25"><div className="h-full rounded-full bg-gradient-to-r from-glacier to-aurora" style={{ width: `${progress}%` }} /></div>
                    <span className="text-xs tabular-nums">{m.duration}</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-4 pb-5 pt-4 text-white sm:px-16">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          <div>
            <h3 className="text-lg font-bold">{m.title}</h3>
            <p className="mt-1 max-w-2xl text-sm text-white/70">{m.caption} <span className="text-white/50">Credit: {m.credit}, {fmtDate(m.date)}.</span></p>
            {m.type === "Videos" && <p className="mt-1 text-xs text-white/45">Demo player. Production builds stream the master file from the NCPOR media server.</p>}
          </div>
          <div className="thin-scroll flex gap-2 overflow-x-auto pb-1">
            {items.map((t, i) => (
              <button key={t.id} onClick={() => setIndex(i)} aria-label={`Show ${t.title}`} aria-current={i === index} className={cn("relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition", i === index ? "border-glacier" : "border-transparent opacity-60 hover:opacity-100")}>
                {t.type === "Press Releases" ? <span className="grid h-full w-full place-items-center bg-white/90 text-slate-700"><FileText size={18} /></span> : <MediaArt id={t.id} scene={t.scene} hue={t.hue} className="h-full w-full" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MediaHub() {
  const [tab, setTab] = useState<(typeof MEDIA_TABS)[number]>("All");
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const items = useMemo(() => MEDIA.filter((m) => tab === "All" || m.type === tab), [tab]);
  const counts = useMemo(() => Object.fromEntries(MEDIA_TABS.map((t) => [t, t === "All" ? MEDIA.length : MEDIA.filter((m) => m.type === t).length])), []);

  return (
    <section id="media" className="relative mx-auto max-w-[1400px] scroll-mt-24 px-4 py-24 sm:px-6 lg:py-32">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
          <h2 className="text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-fg sm:text-5xl">Media hub</h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">Photographs, film, explainers and press notes from every season, cleared for reuse in classrooms and newsrooms. Open any item for the full-screen viewer.</p>
          <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Media type">
            {MEDIA_TABS.map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className="chip">
                {t}
                <span className="tabular-nums opacity-60">{counts[t]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="lg:col-span-7">
          <motion.div layout className="columns-1 gap-4 sm:columns-2">
            <AnimatePresence mode="popLayout">
              {items.map((m, i) => (
                <motion.div key={m.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3, delay: Math.min(i, 6) * 0.04 }}>
                  <Tile m={m} onOpen={() => setOpenIdx(i)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
      <AnimatePresence>{openIdx !== null && items[openIdx] && <Lightbox items={items} index={openIdx} setIndex={setOpenIdx} onClose={() => setOpenIdx(null)} />}</AnimatePresence>
    </section>
  );
}
