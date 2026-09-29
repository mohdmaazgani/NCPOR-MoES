"use client";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Database, FileText, Globe, Moon, Navigation, Search, Ship } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EXPEDITIONS, NAV, RECORDS, type FocusKey, type Kind } from "@/lib/data";
import { useEscape, useEvent, useLockScroll } from "@/lib/hooks";
import { emit, scrollToId } from "@/lib/utils";

interface Cmd {
  id: string;
  group: "Go to" | "Records" | "Expeditions" | "Actions";
  label: string;
  hint?: string;
  icon: React.ReactNode;
  run: () => void;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useEscape(open, close);
  useLockScroll(open);
  useEvent("portal:palette", () => setOpen(true));

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const commands = useMemo<Cmd[]>(() => {
    const focus = (f: FocusKey) => () => {
      scrollToId("home");
      emit("portal:focus", { focus: f });
    };
    const nav: Cmd[] = NAV.map((n) => ({
      id: `nav-${n.label}`,
      group: "Go to",
      label: n.label,
      icon: <Navigation size={16} />,
      run: () => {
        scrollToId(n.id);
        if (n.kind) emit("portal:filter", { kind: n.kind as Kind });
      },
    }));
    const recs: Cmd[] = RECORDS.map((r) => ({
      id: r.id,
      group: "Records",
      label: r.title,
      hint: `${r.kind}, ${r.region}, ${r.year}`,
      icon: r.kind === "Dataset" ? <Database size={16} /> : <FileText size={16} />,
      run: () => {
        scrollToId("repository");
        emit("portal:open-record", { id: r.id });
      },
    }));
    const exps: Cmd[] = EXPEDITIONS.map((e) => ({
      id: e.id,
      group: "Expeditions",
      label: e.title,
      hint: `${e.year}, ${e.where}`,
      icon: <Ship size={16} />,
      run: () => {
        scrollToId("expeditions");
        emit("portal:expedition", { id: e.id });
      },
    }));
    const actions: Cmd[] = [
      { id: "a-ant", group: "Actions", label: "Show Antarctica on the globe", icon: <Globe size={16} />, run: focus("antarctic") },
      { id: "a-arc", group: "Actions", label: "Show the Arctic on the globe", icon: <Globe size={16} />, run: focus("arctic") },
      { id: "a-him", group: "Actions", label: "Show the Himalaya on the globe", icon: <Globe size={16} />, run: focus("himalaya") },
      {
        id: "a-theme",
        group: "Actions",
        label: "Switch between deep ocean and glacial theme",
        icon: <Moon size={16} />,
        run: () => {
          const d = document.documentElement;
          const next = d.dataset.theme === "glacial" ? "dark" : "glacial";
          d.dataset.theme = next;
          try {
            localStorage.setItem("ncpor-theme", next);
          } catch {
            /* ignore */
          }
        },
      },
    ];
    return [...actions, ...nav, ...recs, ...exps];
  }, []);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return commands.filter((c) => c.group === "Go to" || c.group === "Actions");
    const words = t.split(/\s+/);
    return commands
      .filter((c) => {
        const hay = `${c.label} ${c.hint ?? ""} ${c.group}`.toLowerCase();
        return words.every((w) => hay.includes(w));
      })
      .slice(0, 30);
  }, [q, commands]);

  useEffect(() => setIdx(0), [q]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-i="${idx}"]`)?.scrollIntoView({ block: "nearest" });
  }, [idx]);

  const choose = (c: Cmd | undefined) => {
    if (!c) return;
    setOpen(false);
    setTimeout(c.run, 80);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[idx]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center bg-bg/70 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search and commands"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="glass w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl"
            style={{ background: "rgb(var(--surface) / 0.92)" }}
          >
            <div className="flex items-center gap-3 border-b border-line/15 px-4">
              <Search size={18} className="text-muted" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKey}
                placeholder="Search datasets, reports, expeditions, or jump to a section"
                className="h-14 w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted/70"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={results[idx] ? `pal-${results[idx].id}` : undefined}
              />
              <kbd className="rounded-md border border-line/25 px-1.5 py-0.5 text-[11px] font-semibold text-muted">Esc</kbd>
            </div>
            <ul ref={listRef} id="palette-list" role="listbox" data-lenis-prevent className="thin-scroll max-h-[50vh] overflow-y-auto overscroll-contain p-2">
              {results.length === 0 && (
                <li className="px-4 py-10 text-center text-sm text-muted">
                  Nothing matches &ldquo;{q}&rdquo;. Try a station name, a year or a region.
                </li>
              )}
              {results.map((c, i) => {
                const newGroup = i === 0 || results[i - 1].group !== c.group;
                return (
                  <li key={c.id} role="presentation">
                    {newGroup && <div className="px-3 pb-1 pt-3 text-xs font-semibold text-muted">{c.group}</div>}
                    <button
                      id={`pal-${c.id}`}
                      data-i={i}
                      role="option"
                      aria-selected={i === idx}
                      onMouseMove={() => setIdx(i)}
                      onClick={() => choose(c)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                        i === idx ? "bg-glacier/15 text-fg" : "text-fg/80"
                      }`}
                    >
                      <span className={i === idx ? "text-glacier" : "text-muted"}>{c.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{c.label}</span>
                        {c.hint && <span className="block truncate text-xs text-muted">{c.hint}</span>}
                      </span>
                      {i === idx && <CornerDownLeft size={14} className="text-muted" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
