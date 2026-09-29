"use client";
import { Bell, BellRing, CalendarDays, Check, Copy, Download, MapPin, Send, Sparkles, Video } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { CHANNELS, EVENTS, EXPEDITIONS, POST_QUEUE, RECORDS, type Channel, type QueuedPost, type Scene } from "@/lib/data";
import { cn, downloadBlob } from "@/lib/utils";
import MediaArt from "./MediaArt";

type Tone = "Explainer" | "Student-friendly" | "Press-ready";
type Format = "square" | "story" | "banner";
const TONES: Tone[] = ["Explainer", "Student-friendly", "Press-ready"];
const FORMATS: { key: Format; label: string; w: number; h: number }[] = [
  { key: "square", label: "Square 1:1", w: 1080, h: 1080 },
  { key: "story", label: "Story 9:16", w: 1080, h: 1920 },
  { key: "banner", label: "Web banner 16:9", w: 1600, h: 900 },
];

interface Source {
  id: string;
  group: "Expedition" | "Dataset" | "Report" | "Publication";
  headline: string;
  stat: string;
  statLabel: string;
  scene: Scene;
  hue: number;
  region: string;
  link: string;
}

const SOURCES: Source[] = [
  ...EXPEDITIONS.filter((e) => e.status !== "Planned").map<Source>((e) => ({
    id: e.id,
    group: "Expedition",
    headline: e.title,
    stat: e.year,
    statLabel: e.where === "Himalaya" ? "Himalaya" : e.where,
    scene: e.where === "Arctic" ? "station" : e.where === "Southern Ocean" ? "ocean" : "iceberg",
    hue: e.where === "Arctic" ? 170 : e.where === "Southern Ocean" ? 205 : 198,
    region: e.where,
    link: "Timeline",
  })),
  ...RECORDS.map<Source>((r) => ({
    id: r.id,
    group: r.kind,
    headline: r.title,
    stat: r.extent,
    statLabel: r.kind === "Dataset" ? "in the open archive" : r.kind === "Report" ? "field report" : "peer-reviewed study",
    scene: r.region === "Southern Ocean" ? "ocean" : r.category === "Glaciology" ? "iceberg" : "aurora",
    hue: r.region === "Arctic" ? 170 : r.region === "Southern Ocean" ? 205 : 195,
    region: r.region,
    link: `doi.org/${r.doi}`,
  })),
];

function wrap(text: string, max: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

function buildCaption(s: Source, tone: Tone, channel: Channel) {
  const tags = ["#PolarScience", "#NCPOR", s.region === "Arctic" ? "#Arctic" : s.region === "Himalaya" ? "#Himalaya" : "#Antarctica", "#IndiaInPolar"];
  const isExp = s.group === "Expedition";
  const subject = isExp ? `${s.stat}: ${s.headline}` : s.headline;
  let body: string;
  if (tone === "Explainer") {
    body = isExp
      ? `${subject}. It is one step in India's long record of research in the ${s.region === "Himalaya" ? "Himalaya" : s.region.toLowerCase() + " region"}.`
      : `New in the open archive: ${subject}. ${s.stat}, free to cite with a DOI.`;
  } else if (tone === "Student-friendly") {
    body = isExp
      ? `Did you know? ${subject}. Scroll the timeline to see how it fits with everything else we have done at the poles.`
      : `Want real data for a class project? ${subject} has ${s.stat} you can explore and download.`;
  } else {
    body = isExp
      ? `NCPOR notes: ${subject}. Background and media are available on the portal.`
      : `NCPOR has made available: ${subject}. Access and citation details are on the portal.`;
  }
  const cta = channel === "Website" ? "Read more on the portal." : `Explore it on the portal. ${s.link.startsWith("doi") ? s.link : ""}`.trim();
  const full = `${body} ${cta}\n\n${tags.join(" ")}`;
  return channel === "X" && full.length > 280 ? `${full.slice(0, 270).trim()}...` : full;
}

function PostCard({ s, format, svgRef }: { s: Source; format: (typeof FORMATS)[number]; svgRef: React.RefObject<SVGSVGElement> }) {
  const { w, h } = format;
  const pad = w * 0.07;
  const fs = format.key === "banner" ? 62 : format.key === "story" ? 78 : 74;
  const lines = wrap(s.headline, format.key === "banner" ? 30 : 22).slice(0, 5);
  const statSize = format.key === "banner" ? 84 : 110;
  const statY = h - pad - (format.key === "banner" ? 90 : 130);
  const headY = statY - 70 - (lines.length - 1) * fs * 1.12 - (format.key === "banner" ? 30 : 60);
  return (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${w} ${h}`} className="h-auto w-full rounded-2xl" role="img" aria-label={`Outreach card: ${s.headline}`}>
      <rect width={w} height={h} fill="#030712" />
      <MediaArt id={s.id} scene={s.scene} hue={s.hue} />
      <defs>
        <linearGradient id="fade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#030712" stopOpacity="0.1" />
          <stop offset="0.45" stopColor="#030712" stopOpacity="0.35" />
          <stop offset="1" stopColor="#030712" stopOpacity="0.92" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#fade)" />
      <rect x={pad} y={pad} width="300" height="64" rx="12" fill="#030712" fillOpacity="0.6" stroke="#38BDF8" strokeOpacity="0.7" />
      <text x={pad + 24} y={pad + 42} fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontSize="28" fontWeight="800" fill="#F8FAFC">NCPOR / MoES</text>
      {lines.map((l, i) => (
        <text key={i} x={pad} y={headY + i * fs * 1.12} fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontSize={fs} fontWeight="800" letterSpacing="-2" fill="#F8FAFC">{l}</text>
      ))}
      <text x={pad} y={statY + 60} fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontSize={statSize > 90 && s.stat.length > 14 ? 54 : statSize} fontWeight="800" fill="#34D399">{s.stat}</text>
      <text x={pad} y={statY + 108} fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontSize="34" fontWeight="500" fill="#CBD5E1">{s.statLabel}</text>
    </svg>
  );
}

export default function Outreach() {
  const [sourceId, setSourceId] = useState(SOURCES[Math.max(0, SOURCES.findIndex((x) => x.id === "ds-seaice-composite"))].id);
  const [tone, setTone] = useState<Tone>("Explainer");
  const [channel, setChannel] = useState<Channel>("Instagram");
  const [format, setFormat] = useState<Format>("square");
  const [copied, setCopied] = useState(false);
  const [auto, setAuto] = useState(true);
  const [queue, setQueue] = useState<QueuedPost[]>(POST_QUEUE);
  const [remind, setRemind] = useState<Record<string, boolean>>({});
  const svgRef = useRef<SVGSVGElement>(null);

  const source = SOURCES.find((s) => s.id === sourceId) ?? SOURCES[0];
  const fmt = FORMATS.find((f) => f.key === format)!;
  const caption = useMemo(() => buildCaption(source, tone, channel), [source, tone, channel]);

  const exportSvg = () => {
    if (!svgRef.current) return;
    downloadBlob(`ncpor-${source.id}-${format}.svg`, new XMLSerializer().serializeToString(svgRef.current), "image/svg+xml");
  };

  const exportPng = () => {
    if (!svgRef.current) return;
    const xml = new XMLSerializer().serializeToString(svgRef.current);
    const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = fmt.w;
      c.height = fmt.h;
      c.getContext("2d")?.drawImage(img, 0, 0, fmt.w, fmt.h);
      c.toBlob((b) => b && downloadBlob(`ncpor-${source.id}-${format}.png`, b, "image/png"));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const groups = ["Expedition", "Dataset", "Report", "Publication"] as const;

  return (
    <section id="outreach" className="relative mx-auto max-w-[1400px] scroll-mt-24 px-4 py-24 sm:px-6 lg:py-32">
      <div className="max-w-2xl">
        <h2 className="text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-fg sm:text-5xl">Outreach and events</h2>
        <p className="mt-5 text-base leading-relaxed text-muted">
          Pick a record or expedition and the portal drafts a share-ready card and caption for each channel. Approve what goes out, and see what is coming up.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-12">
        {/* Generator */}
        <div className="glass shard p-5 sm:p-7 lg:col-span-7">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-5">
              <div>
                <label htmlFor="src" className="mb-2 block text-sm font-semibold text-fg">Source</label>
                <select id="src" value={sourceId} onChange={(e) => setSourceId(e.target.value)} className="input bg-surface">
                  {groups.map((g) => (
                    <optgroup key={g} label={g === "Expedition" ? "Expeditions" : `${g}s`}>
                      {SOURCES.filter((s) => s.group === g).map((s) => (
                        <option key={s.id} value={s.id}>{s.headline.length > 62 ? s.headline.slice(0, 60) + "..." : s.headline}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-fg">Channel</legend>
                <div className="flex flex-wrap gap-1.5">{CHANNELS.map((c) => <button key={c} className="chip" aria-pressed={channel === c} onClick={() => setChannel(c)}>{c}</button>)}</div>
              </fieldset>
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-fg">Voice</legend>
                <div className="flex flex-wrap gap-1.5">{TONES.map((t) => <button key={t} className="chip" aria-pressed={tone === t} onClick={() => setTone(t)}>{t}</button>)}</div>
              </fieldset>
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-fg">Card size</legend>
                <div className="flex flex-wrap gap-1.5">{FORMATS.map((f) => <button key={f.key} className="chip" aria-pressed={format === f.key} onClick={() => setFormat(f.key)}>{f.label}</button>)}</div>
              </fieldset>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-fg">Caption for {channel}</span>
                  {channel === "X" && <span className={cn("text-xs tabular-nums", caption.length > 260 ? "text-amber-400" : "text-muted")}>{caption.length}/280</span>}
                </div>
                <textarea readOnly value={caption} rows={7} className="input resize-none leading-relaxed" aria-label="Generated caption" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn-primary !px-4 !py-2.5" onClick={() => navigator.clipboard?.writeText(caption).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}>
                    {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy caption"}
                  </button>
                  <button className="btn-ghost !px-4 !py-2.5" onClick={exportPng}><Download size={16} /> PNG</button>
                  <button className="btn-ghost !px-4 !py-2.5" onClick={exportSvg}><Download size={16} /> SVG</button>
                </div>
              </div>
            </div>

            <div className="flex items-start justify-center">
              <div className={cn("w-full", format === "story" ? "max-w-[260px]" : "max-w-full")}>
                <PostCard s={source} format={fmt} svgRef={svgRef} />
              </div>
            </div>
          </div>
        </div>

        {/* Queue + events */}
        <div className="space-y-8 lg:col-span-5">
          <div className="glass shard-sm p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-fg">Publishing queue</h3>
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted">
                <Sparkles size={14} className={auto ? "text-aurora" : ""} />
                Draft from new records
                <button role="switch" aria-checked={auto} onClick={() => setAuto((a) => !a)} className={cn("relative h-5 w-9 rounded-full transition", auto ? "bg-aurora" : "bg-line/30")}>
                  <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all", auto ? "left-[18px]" : "left-0.5")} />
                </button>
              </label>
            </div>
            <ul className="mt-4 divide-y divide-line/10">
              {queue.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <span className="tag shrink-0 !w-[76px] justify-center">{p.channel}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-fg">{p.title}</div>
                    <div className="text-xs text-muted">{p.when}</div>
                  </div>
                  {p.status === "Needs review" ? (
                    <button onClick={() => setQueue((q) => q.map((x) => (x.id === p.id ? { ...x, status: "Scheduled" } : x)))} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-400/15 px-2.5 py-1.5 text-xs font-semibold text-amber-400 transition hover:bg-amber-400/25 active:scale-95">
                      <Send size={12} /> Approve
                    </button>
                  ) : (
                    <span className={cn("shrink-0 text-xs font-semibold", p.status === "Published" ? "text-muted" : "text-aurora")}>{p.status}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-fg">Coming up</h3>
            <ul className="space-y-3">
              {EVENTS.map((e) => {
                const d = new Date(e.date);
                const on = remind[e.id];
                return (
                  <li key={e.id} className="glass glass-hover shard-sm flex gap-4 p-4">
                    <div className="grid h-16 w-14 shrink-0 place-items-center rounded-xl border border-line/15 bg-bg/50 text-center leading-none">
                      <div>
                        <div className="text-2xl font-extrabold tabular-nums text-fg">{d.getDate()}</div>
                        <div className="mt-1 text-[11px] font-semibold text-glacier">{d.toLocaleDateString("en-IN", { month: "short" })}</div>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold leading-snug text-fg">{e.title}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                        <span className="inline-flex items-center gap-1">{e.mode === "Online" ? <Video size={12} /> : <MapPin size={12} />}{e.place}</span>
                        <span className="inline-flex items-center gap-1"><CalendarDays size={12} />{e.audience}</span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted">{e.blurb}</p>
                    </div>
                    <button onClick={() => setRemind((r) => ({ ...r, [e.id]: !r[e.id] }))} aria-pressed={on} aria-label={on ? `Remove reminder for ${e.title}` : `Remind me about ${e.title}`} className={cn("grid h-9 w-9 shrink-0 place-items-center self-start rounded-lg transition active:scale-90", on ? "bg-aurora/20 text-aurora" : "text-muted hover:bg-glacier/10 hover:text-fg")}>
                      {on ? <BellRing size={16} /> : <Bell size={16} />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
