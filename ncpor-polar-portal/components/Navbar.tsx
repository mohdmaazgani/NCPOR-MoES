"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Command, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NAV, type NavItem } from "@/lib/data";
import { cn, emit, scrollToId } from "@/lib/utils";
import ThemeSwitcher from "./ThemeSwitcher";
import WeatherTicker from "./WeatherTicker";

const SECTION_IDS = [
  "home",
  "repository",
  "expeditions",
  "media",
  "outreach",
  "analytics",
];

function BrandBadge() {
  return (
    <button
      onClick={() => scrollToId("home")}
      className="flex items-center gap-3 text-left"
      aria-label="NCPOR Ministry of Earth Sciences, SIH 2026, back to top"
    >
      <span className="glow-border relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-bg">
        <svg viewBox="0 0 40 40" className="h-7 w-7" aria-hidden>
          <circle
            cx="20"
            cy="20"
            r="13"
            fill="none"
            stroke="rgb(var(--glacier))"
            strokeWidth="1.4"
          />
          <ellipse
            cx="20"
            cy="20"
            rx="5.5"
            ry="13"
            fill="none"
            stroke="rgb(var(--glacier))"
            strokeOpacity="0.6"
            strokeWidth="1"
          />
          <path
            d="M7 20h26M9.5 13h21M9.5 27h21"
            stroke="rgb(var(--glacier))"
            strokeOpacity="0.45"
            strokeWidth="1"
          />
          <circle cx="20" cy="7" r="2.4" fill="rgb(var(--aurora))" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-extrabold tracking-tight text-fg">
          NCPOR / MoES
        </span>
        <span className="block text-[11px] font-medium text-muted"></span>
      </span>
    </button>
  );
}

export default function Navbar() {
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      Boolean,
    ) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (item: NavItem) => {
    setOpen(false);
    // let the drawer close before scrolling so offsets are correct
    setTimeout(() => {
      scrollToId(item.id);
      if (item.kind) emit("portal:filter", { kind: item.kind });
      else if (item.id === "repository") emit("portal:filter", { kind: "All" });
    }, 40);
  };

  const isActive = (item: NavItem) => (item.kind ? false : item.id === active);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="bg-black">
        <WeatherTicker />
      </div>

      <div className="bg-[#06142d] border-b border-white/10 transition-all duration-300">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6">
          <BrandBadge />

          <nav
            className="hidden items-center gap-0.5 xl:flex"
            aria-label="Primary"
          >
            {NAV.map((item) => (
              <button
                key={item.label}
                onClick={() => go(item)}
                aria-current={isActive(item) ? "page" : undefined}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors",
                  isActive(item) ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {isActive(item) && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-glacier to-aurora"
                  />
                )}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => emit("portal:palette")}
              className="glass glass-hover flex h-10 items-center gap-2.5 rounded-xl px-3 text-sm text-muted transition active:scale-95 hover:text-fg"
              aria-label="Open search and command palette"
            >
              <Search size={16} />
              <span className="hidden text-[13px] sm:inline">Search</span>
              <kbd className="hidden items-center gap-0.5 rounded-md border border-line/25 px-1.5 py-0.5 text-[11px] font-semibold sm:flex">
                {isMac ? <Command size={11} /> : "Ctrl"}
                <span>K</span>
              </kbd>
            </button>
            <ThemeSwitcher />
            <button
              onClick={() => setOpen((o) => !o)}
              className="glass grid h-10 w-10 place-items-center rounded-xl xl:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="glass mx-3 mt-2 overflow-hidden rounded-2xl p-2 xl:hidden"
            aria-label="Mobile"
          >
            {NAV.map((item) => (
              <button
                key={item.label}
                onClick={() => go(item)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition hover:bg-glacier/10",
                  isActive(item) ? "text-fg" : "text-muted",
                )}
              >
                {item.label}
                {isActive(item) && (
                  <span className="h-1.5 w-1.5 rounded-full bg-aurora" />
                )}
              </button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
