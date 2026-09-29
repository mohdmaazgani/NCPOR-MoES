import { hashStr, seeded } from "@/lib/utils";
import type { Scene } from "@/lib/data";

/**
 * Procedural stand-ins for expedition photography so the portal is fully populated offline.
 * Each item gets a stable scene from its id. In production these are replaced by real assets.
 */
export default function MediaArt({ id, scene, hue, className }: { id: string; scene: Scene; hue: number; className?: string }) {
  const rnd = seeded(hashStr(id));
  const gid = `art-${id}`;
  const sky1 = `hsl(${hue} 70% 8%)`;
  const sky2 = `hsl(${hue} 65% ${scene === "aurora" ? 16 : 26}%)`;
  const ridge = (base: number, amp: number, fill: string, seedOffset: number) => {
    const r = seeded(hashStr(id) + seedOffset);
    let d = `M0 300 L0 ${base}`;
    for (let x = 0; x <= 400; x += 25) d += ` L${x} ${(base - r() * amp).toFixed(1)}`;
    return <path d={`${d} L400 300 Z`} fill={fill} />;
  };

  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${gid}-sky`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={sky1} />
          <stop offset="1" stopColor={sky2} />
        </linearGradient>
        <linearGradient id={`${gid}-au`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#34D399" stopOpacity="0" />
          <stop offset="0.5" stopColor="#34D399" stopOpacity="0.55" />
          <stop offset="1" stopColor="#38BDF8" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${gid}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${gid}-sky)`} />
      {Array.from({ length: 28 }, (_, i) => (
        <circle key={i} cx={rnd() * 400} cy={rnd() * 150} r={rnd() * 0.9 + 0.3} fill="#fff" opacity={0.25 + rnd() * 0.5} />
      ))}

      {scene === "aurora" && (
        <g>
          <path d={`M-10 70 C 80 ${20 + rnd() * 40}, 150 ${120 + rnd() * 30}, 240 60 S 370 ${30 + rnd() * 40}, 420 90 L420 200 C 330 150, 260 190, 190 140 S 60 170, -10 130 Z`} fill={`url(#${gid}-au)`} />
          <path d={`M-10 110 C 100 60, 170 150, 260 100 S 380 80, 420 120 L420 210 C 320 170, 240 210, 160 165 S 40 190, -10 160 Z`} fill="#38BDF8" opacity="0.14" />
          {ridge(230, 30, "#04101f", 1)}
          {ridge(262, 18, "#020814", 2)}
        </g>
      )}

      {scene === "iceberg" && (
        <g>
          <ellipse cx="290" cy="70" rx="60" ry="60" fill={`url(#${gid}-glow)`} opacity="0.35" />
          <rect y="190" width="400" height="110" fill={`hsl(${hue} 60% 12%)`} />
          <path d="M70 200 L120 120 L150 150 L190 95 L250 200 Z" fill="#e0f2fe" opacity="0.95" />
          <path d="M190 95 L250 200 L205 200 Z" fill="#7dd3fc" opacity="0.8" />
          <path d="M70 200 L120 120 L135 200 Z" fill="#bae6fd" />
          <path d="M60 205 L260 205 L235 250 L95 250 Z" fill="#0ea5e9" opacity="0.35" />
          <path d="M280 200 L320 160 L350 200 Z" fill="#e0f2fe" opacity="0.85" />
        </g>
      )}

      {scene === "station" && (
        <g>
          {ridge(215, 26, "#dbeafe", 3)}
          {ridge(248, 14, "#93c5fd", 4)}
          <rect y="262" width="400" height="40" fill="#e0f2fe" />
          <rect x="150" y="205" width="70" height="34" rx="3" fill="#f97316" />
          <rect x="220" y="215" width="44" height="24" rx="3" fill="#ea580c" />
          {[160, 178, 196].map((x) => <rect key={x} x={x} y="214" width="10" height="9" fill="#fef3c7" />)}
          <path d="M330 240 V160 M318 175 H342 M322 195 H338" stroke="#e2e8f0" strokeWidth="2" />
          <path d="M110 240 h250" stroke="#94a3b8" strokeWidth="1.5" />
        </g>
      )}

      {scene === "ocean" && (
        <g>
          <rect y="120" width="400" height="180" fill={`hsl(${hue} 70% 10%)`} />
          {Array.from({ length: 7 }, (_, i) => (
            <path key={i} d={`M0 ${140 + i * 22} Q 100 ${130 + i * 22 + rnd() * 10} 200 ${140 + i * 22} T 400 ${140 + i * 22}`} stroke="#38BDF8" strokeOpacity={0.35 - i * 0.04} strokeWidth="1.2" fill="none" />
          ))}
          <path d="M120 130 L135 105 L200 105 L212 130 Z M150 105 V85 H185 V105" fill="#0b132b" stroke="#38BDF8" strokeOpacity="0.5" />
          <rect x="105" y="128" width="120" height="7" rx="2" fill="#0b132b" stroke="#38BDF8" strokeOpacity="0.5" />
          {Array.from({ length: 22 }, (_, i) => (
            <circle key={i} cx={rnd() * 400} cy={160 + rnd() * 130} r={rnd() * 1.8 + 0.6} fill="#34D399" opacity={0.3 + rnd() * 0.6} />
          ))}
        </g>
      )}
    </svg>
  );
}
