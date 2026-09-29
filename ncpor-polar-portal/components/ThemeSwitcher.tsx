"use client";
import { Moon, Snowflake } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<"dark" | "glacial">("dark");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "glacial" ? "glacial" : "dark");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "glacial" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("ncpor-theme", next);
    } catch {
      /* storage unavailable */
    }
    setTheme(next);
  };

  return (
    <button
      onClick={toggle}
      className="glass glass-hover grid h-10 w-10 place-items-center rounded-xl text-fg transition active:scale-90"
      aria-label={theme === "dark" ? "Switch to glacial light theme" : "Switch to deep ocean dark theme"}
      title={theme === "dark" ? "Glacial theme" : "Deep ocean theme"}
    >
      {theme === "dark" ? <Snowflake size={18} /> : <Moon size={18} />}
    </button>
  );
}
