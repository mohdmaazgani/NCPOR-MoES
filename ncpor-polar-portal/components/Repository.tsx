"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Copy,
  Download,
  FileText,
  LayoutGrid,
  Database,
  Lock,
  Rows3,
  Search,
  Unlock,
  X,
  BookOpen,
  Clock,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  CATEGORIES,
  KINDS,
  RECORDS,
  REGIONS,
  type Access,
  type Category,
  type Kind,
  type Region,
  type RepoRecord,
} from "@/lib/data";
import { useEscape, useEvent, useLockScroll } from "@/lib/hooks";
import { cn, downloadBlob, formatNumber } from "@/lib/utils";
import Spark from "./Spark";
import TiltCard from "./TiltCard";

const KIND_ICON: Record<Kind, React.ReactNode> = {
  Dataset: <Database size={14} />,
  Report: <FileText size={14} />,
  Publication: <BookOpen size={14} />,
};

function AccessBadge({ access }: { access: Access }) {
  const map = {
    Open: { icon: <Unlock size={11} />, cls: "bg-aurora/15 text-aurora" },
    Registered: { icon: <Lock size={11} />, cls: "bg-glacier/15 text-glacier" },
    Embargoed: {
      icon: <Clock size={11} />,
      cls: "bg-amber-400/15 text-amber-400",
    },
  }[access];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold",
        map.cls,
      )}
    >
      {map.icon}
      {access === "Open" ? "Open access" : access}
    </span>
  );
}

function CopyButton({
  text,
  label,
  className,
}: {
  text: string;
  label: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        });
      }}
      className={cn(
        "inline-flex items-center gap-1.5 transition hover:text-fg",
        className,
      )}
      aria-label={label}
    >
      {done ? <Check size={12} className="text-aurora" /> : <Copy size={12} />}
      {done ? "Copied" : text}
    </button>
  );
}

function sampleCsv(r: RepoRecord) {
  const rows = r.series.values.map((v, i) => `${i + 1},${v}`).join("\n");
  return `# ${r.title}\n# DOI: ${r.doi}\n# Illustrative preview extract, not the full dataset\nperiod,${r.series.label} (${r.series.unit})\n${rows}\n`;
}

function citation(r: RepoRecord) {
  return `NCPOR, ${r.pi} (${r.year}). ${r.title}. National Centre for Polar and Ocean Research, Ministry of Earth Sciences. https://doi.org/${r.doi}`;
}

function RecordCard({
  r,
  onOpen,
  big,
}: {
  r: RepoRecord;
  onOpen: () => void;
  big?: boolean;
}) {
  return (
    <TiltCard
      onClick={onOpen}
      label={`Preview ${r.title}`}
      className={cn(
        "shard flex h-full flex-col p-5 sm:p-6",
        big && "md:col-span-2",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="tag">
          {KIND_ICON[r.kind]}
          {r.kind}
        </span>
        <span className="tag">{r.region}</span>
        <span className="ml-auto text-xs tabular-nums text-muted">
          {r.year}
        </span>
      </div>
      <h3
        className={cn(
          "mt-4 font-bold leading-snug tracking-tight text-fg",
          big ? "text-xl sm:text-2xl" : "text-base",
        )}
      >
        {r.title}
      </h3>
      <p
        className={cn(
          "mt-2 text-sm leading-relaxed text-muted",
          big ? "line-clamp-3" : "line-clamp-2",
        )}
      >
        {r.summary}
      </p>

      <div
        className={cn(
          "mt-4 overflow-hidden rounded-lg border border-line/10 bg-bg/40 px-2 pt-2",
          big && "sm:mt-5",
        )}
      >
        <Spark
          values={r.series.values}
          height={big ? 84 : 52}
          className="h-auto w-full"
          unit={r.series.unit}
        />
        <div className="truncate pb-1.5 pt-1 text-[11px] text-muted">
          {r.series.label}
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-2 pt-4">
        <AccessBadge access={r.access} />
        {r.formats.map((f) => (
          <span
            key={f}
            className="inline-flex items-center gap-1 rounded-md border border-line/20 px-2 py-0.5 text-[11px] font-semibold text-fg/85"
          >
            <Download size={10} />
            {f}
          </span>
        ))}
        <span className="ml-auto text-[11px] text-muted">{r.size}</span>
      </div>
      <div className="mt-3 flex items-center gap-2 border-t border-line/10 pt-3 text-[11px] text-muted">
        <span className="rounded bg-glacier/10 px-1.5 py-0.5 font-semibold text-glacier">
          DOI
        </span>
        <CopyButton
          text={r.doi}
          label={`Copy DOI ${r.doi}`}
          className="truncate"
        />
      </div>
    </TiltCard>
  );
}

function PreviewModal({ r, onClose }: { r: RepoRecord; onClose: () => void }) {
  useLockScroll(true);
  useEscape(true, onClose);

  const canDownload = r.access !== "Embargoed";
  const isFile = r.kind !== "Dataset";

  return (
    <motion.div
      className="fixed inset-0 z-[80] grid place-items-center bg-bg/85 px-3 pb-4 pt-24 backdrop-blur-md sm:px-6 sm:pb-6 sm:pt-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={r.title}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="glass shard relative w-[calc(100vw-1.5rem)] max-w-[800px] overflow-hidden"
        style={{
          background: "rgb(var(--surface) / 0.98)",
          maxHeight: "calc(100dvh - 7rem)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close preview"
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full border border-line/25 bg-bg/40 text-muted transition hover:text-fg active:scale-90 sm:right-4 sm:top-4"
        >
          <X size={15} />
        </button>

        {/* Scrollable content */}
        <div
          data-lenis-prevent
          className="thin-scroll overflow-y-auto overscroll-contain p-4 sm:p-6"
          style={{
            maxHeight: "calc(100dvh - 7rem)",
          }}
        >
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pr-10">
            <span className="tag">
              {KIND_ICON[r.kind]}
              {r.kind}
            </span>

            <span className="tag">{r.category}</span>

            <span className="tag">{r.region}</span>

            <AccessBadge access={r.access} />
          </div>

          {/* Title */}
          <h3 className="mt-3 max-w-2xl text-xl font-bold leading-tight tracking-tight text-fg sm:text-2xl">
            {r.title}
          </h3>

          {/* Description */}
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {r.summary}
          </p>

          {/* Graph + information */}
          <div className="mt-4 grid gap-4 lg:grid-cols-5">
            {/* Graph */}
            <div className="lg:col-span-3">
              <div className="rounded-xl border border-line/15 bg-bg/50 p-3 sm:p-3.5">
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="text-xs font-semibold text-fg sm:text-sm">
                    {r.series.label}
                  </span>

                  <span className="text-[11px] text-muted">
                    {r.series.unit}
                  </span>
                </div>

                <Spark
                  values={r.series.values}
                  height={135}
                  axes
                  unit={r.series.unit}
                  className="h-auto w-full"
                />

                <p className="mt-1.5 text-[10px] leading-relaxed text-muted">
                  Preview of the first {r.series.values.length} periods. The
                  full record has {r.extent}.
                </p>
              </div>
            </div>

            {/* Metadata */}
            <dl className="grid content-start gap-2 text-xs lg:col-span-2 sm:text-sm">
              {[
                ["Station or platform", r.station],
                ["Group", r.pi],
                ["Extent", r.extent],
                ["Formats", r.formats.join(", ")],
                ["Size", r.size],
                [
                  "Licence",
                  r.access === "Open"
                    ? "CC BY 4.0"
                    : r.access === "Registered"
                      ? "NCPOR data policy, free registration"
                      : `Embargoed until ${r.embargoUntil}`,
                ],
                ["Downloads", formatNumber(r.downloads)],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-3 border-b border-line/10 pb-1.5"
                >
                  <dt className="text-muted">{k}</dt>

                  <dd className="max-w-[65%] text-right font-medium text-fg">
                    {v}
                  </dd>
                </div>
              ))}

              {/* DOI */}
              <div className="flex items-center justify-between gap-3 pt-0.5">
                <dt className="text-muted">DOI</dt>

                <dd className="text-xs font-semibold text-glacier">
                  <CopyButton text={r.doi} label="Copy DOI" />
                </dd>
              </div>
            </dl>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              disabled={!canDownload}
              className={cn(
                "btn-primary",
                !canDownload && "pointer-events-none opacity-40",
              )}
              onClick={() =>
                downloadBlob(`${r.id}-preview.csv`, sampleCsv(r), "text/csv")
              }
            >
              <Download size={15} />

              {isFile
                ? "Download usage sample (CSV)"
                : "Download preview extract (CSV)"}
            </button>

            <button
              className="btn-ghost"
              onClick={() => navigator.clipboard?.writeText(citation(r))}
            >
              <Copy size={15} /> Copy citation
            </button>
          </div>

          {/* Embargo notice */}
          {!canDownload && (
            <p className="mt-2.5 text-[11px] leading-relaxed text-amber-400">
              This record is embargoed until {r.embargoUntil}. Metadata is
              public now, files unlock on that date.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Facet<T extends string | number>({
  title,
  value,
  options,
  onChange,
  counter,
}: {
  title: string;
  value: T | "All";
  options: T[];
  onChange: (v: T | "All") => void;
  counter: (o: T) => number;
}) {
  return (
    <fieldset className="border-t border-line/10 pt-4">
      <legend className="mb-2.5 text-sm font-semibold text-fg">{title}</legend>
      <div className="flex flex-wrap gap-1.5">
        <button
          className="chip"
          aria-pressed={value === "All"}
          onClick={() => onChange("All")}
        >
          All
        </button>
        {options.map((o) => (
          <button
            key={String(o)}
            className="chip"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
          >
            {o}
            <span className="tabular-nums opacity-60">{counter(o)}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function Repository() {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<Kind | "All">("All");
  const [region, setRegion] = useState<Region | "All">("All");
  const [category, setCategory] = useState<Category | "All">("All");
  const [year, setYear] = useState<number | "All">("All");
  const [sort, setSort] = useState<"newest" | "popular">("newest");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [openId, setOpenId] = useState<string | null>(null);

  useEvent<{ kind?: Kind | "All" }>(
    "portal:filter",
    (d) => d.kind && setKind(d.kind),
  );
  useEvent<{ id: string }>("portal:open-record", (d) => setOpenId(d.id));

  const years = useMemo(
    () => Array.from(new Set(RECORDS.map((r) => r.year))).sort((a, b) => b - a),
    [],
  );

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = RECORDS.filter(
      (r) =>
        (kind === "All" || r.kind === kind) &&
        (region === "All" || r.region === region) &&
        (category === "All" || r.category === category) &&
        (year === "All" || r.year === year) &&
        (!t ||
          `${r.title} ${r.summary} ${r.doi} ${r.station} ${r.pi}`
            .toLowerCase()
            .includes(t)),
    );
    return [...list].sort((a, b) =>
      sort === "newest"
        ? b.year - a.year || b.downloads - a.downloads
        : b.downloads - a.downloads,
    );
  }, [q, kind, region, category, year, sort]);

  const count = useCallback(
    (fn: (r: RepoRecord) => boolean) =>
      RECORDS.filter((r) => (kind === "All" || r.kind === kind) && fn(r))
        .length,
    [kind],
  );

  const reset = () => {
    setQ("");
    setKind("All");
    setRegion("All");
    setCategory("All");
    setYear("All");
  };
  const dirty =
    q ||
    kind !== "All" ||
    region !== "All" ||
    category !== "All" ||
    year !== "All";
  const open = RECORDS.find((r) => r.id === openId) ?? null;

  return (
    <section
      id="repository"
      className="relative mx-auto max-w-[1400px] scroll-mt-24 px-4 py-24 sm:px-6 lg:py-32"
    >
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-fg sm:text-5xl">
            Knowledge repository
          </h2>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-muted">
            Field reports, datasets and papers with persistent DOIs. Filter by
            region, year and category, preview the data, and download the files
            that are open.
          </p>

          <div className="glass shard-sm mt-8 space-y-4 p-5 lg:sticky lg:top-28">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="input pl-10"
                placeholder="Search title, DOI, station"
                aria-label="Search the repository"
              />
            </div>
            <fieldset>
              <legend className="mb-2.5 text-sm font-semibold text-fg">
                Type
              </legend>
              <div className="flex flex-wrap gap-1.5" role="tablist">
                {KINDS.map((k) => (
                  <button
                    key={k}
                    role="tab"
                    aria-selected={kind === k}
                    className="chip"
                    onClick={() => setKind(k)}
                  >
                    {k === "All" ? "All" : `${k}s`}
                  </button>
                ))}
              </div>
            </fieldset>
            <Facet
              title="Region"
              value={region}
              options={REGIONS}
              onChange={setRegion}
              counter={(o) => count((r) => r.region === o)}
            />
            <Facet
              title="Category"
              value={category}
              options={CATEGORIES}
              onChange={setCategory}
              counter={(o) => count((r) => r.category === o)}
            />
            <div className="border-t border-line/10 pt-4">
              <label
                htmlFor="year"
                className="mb-2.5 block text-sm font-semibold text-fg"
              >
                Year
              </label>
              <select
                id="year"
                value={String(year)}
                onChange={(e) =>
                  setYear(
                    e.target.value === "All" ? "All" : Number(e.target.value),
                  )
                }
                className="input bg-surface"
              >
                <option value="All">All years</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            {dirty && (
              <button
                onClick={reset}
                className="text-sm font-semibold text-glacier underline-offset-4 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted" aria-live="polite">
              <span className="font-semibold text-fg">{filtered.length}</span>{" "}
              of {RECORDS.length} records
            </p>
            <div className="flex items-center gap-2">
              <select
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value as "newest" | "popular")
                }
                className="input w-auto bg-surface py-2 text-[13px]"
                aria-label="Sort records"
              >
                <option value="newest">Newest first</option>
                <option value="popular">Most downloaded</option>
              </select>
              <div
                className="glass flex rounded-xl p-1"
                role="group"
                aria-label="Layout"
              >
                {(
                  [
                    ["grid", LayoutGrid, "Grid view"],
                    ["table", Rows3, "Table view"],
                  ] as const
                ).map(([v, Icon, l]) => (
                  <button
                    key={v}
                    aria-label={l}
                    aria-pressed={view === v}
                    onClick={() => setView(v)}
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-lg text-muted transition",
                      view === v && "bg-glacier/20 text-fg",
                    )}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="glass shard grid place-items-center px-6 py-20 text-center">
              <p className="text-lg font-semibold text-fg">
                No records match these filters
              </p>
              <p className="mt-2 max-w-xs text-sm text-muted">
                Remove a filter or search for a station name such as Bharati or
                Himadri.
              </p>
              <button className="btn-ghost mt-6" onClick={reset}>
                Clear all filters
              </button>
            </div>
          ) : view === "grid" ? (
            <motion.ul layout className="grid gap-4 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {filtered.map((r, i) => (
                  <motion.li
                    key={r.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{
                      duration: 0.25,
                      delay: Math.min(i, 5) * 0.03,
                    }}
                    className={cn(
                      i === 0 && filtered.length > 2 && "md:col-span-2",
                    )}
                  >
                    <RecordCard
                      r={r}
                      big={i === 0 && filtered.length > 2}
                      onOpen={() => setOpenId(r.id)}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <div className="glass shard-sm thin-scroll overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-line/15 text-xs text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-3 py-3 font-semibold">Type</th>
                    <th className="px-3 py-3 font-semibold">Region</th>
                    <th className="px-3 py-3 font-semibold">Year</th>
                    <th className="px-3 py-3 font-semibold">Files</th>
                    <th className="px-3 py-3 font-semibold">Access</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      tabIndex={0}
                      onClick={() => setOpenId(r.id)}
                      onKeyDown={(e) => e.key === "Enter" && setOpenId(r.id)}
                      className="cursor-pointer border-b border-line/10 transition-colors last:border-0 hover:bg-glacier/10 focus-visible:bg-glacier/10"
                    >
                      <td className="max-w-md px-4 py-3.5 font-medium text-fg">
                        {r.title}
                      </td>
                      <td className="px-3 py-3.5 text-muted">{r.kind}</td>
                      <td className="px-3 py-3.5 text-muted">{r.region}</td>
                      <td className="px-3 py-3.5 tabular-nums text-muted">
                        {r.year}
                      </td>
                      <td className="px-3 py-3.5 text-muted">
                        {r.formats.join(", ")}
                      </td>
                      <td className="px-3 py-3.5">
                        <AccessBadge access={r.access} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <PreviewModal
            key={open.id}
            r={open}
            onClose={() => setOpenId(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
