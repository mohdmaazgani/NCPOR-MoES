import { Code2 } from "lucide-react";
import { TEAM_NAME } from "@/lib/data";
import A11yControls from "./A11yControls";

const LINKS = {
  Explore: [
    ["Knowledge repository", "#repository"],
    ["Expedition timeline", "#expeditions"],
    ["Media hub", "#media"],
    ["Outreach and events", "#outreach"],
  ],
  Institution: [
    ["About NCPOR", "#home"],
    ["Data policy", "#repository"],
    ["Portal analytics", "#analytics"],
    ["Contact the outreach desk", "#outreach"],
  ],
} as const;

export default function Footer() {
  return (
    <footer className="relative mt-10 border-t border-line/15 bg-surface/60">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="text-xl font-extrabold tracking-tight text-fg">
            National Centre for Polar and Ocean Research
          </div>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
            An institution of the Ministry of Earth Sciences, Government of
            India. Headland Sada, Vasco da Gama, Goa 403 804.
          </p>
          <p className="mt-6 max-w-md text-xs leading-relaxed text-muted/80">
            This portal is a prototype built for Smart India Hackathon 2026,
            problem statement 26063. Records, counts and media shown are
            illustrative until connected to NCPOR&apos;s archive.
          </p>
        </div>
        {Object.entries(LINKS).map(([title, links]) => (
          <nav key={title} aria-label={title} className="lg:col-span-2">
            <div className="mb-4 text-sm font-semibold text-fg">{title}</div>
            <ul className="space-y-2.5 text-sm">
              {links.map(([l, h]) => (
                <li key={l}>
                  <a
                    href={h}
                    className="text-muted transition hover:text-glacier"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div className="lg:col-span-3">
          <div className="mb-4 text-sm font-semibold text-fg">
            Accessibility
          </div>
          <A11yControls />
        </div>
      </div>
      <div className="border-t border-line/10">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-3 px-4 py-5 text-xs text-muted sm:flex-row sm:items-center sm:px-6">
          <span>
            &copy; 2026 NCPOR, Ministry of Earth Sciences, Government of India.
          </span>
          <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-medium text-fg/90">
            <Code2 size={13} className="text-glacier" /> Built by {TEAM_NAME}
          </span>
        </div>
      </div>
    </footer>
  );
}
