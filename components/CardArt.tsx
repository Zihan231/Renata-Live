import Image from "next/image";

/** Illustrated covers for the home experience cards, all in the Renata navy / electric-blue palette. */

export function QuizArt() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_50%_60%,#1f6bff_0%,#0b2a6b_45%,#04112e_100%)]">
      <div aria-hidden className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:16px_16px]" />
      <div aria-hidden className="absolute left-1/2 top-1/2 aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan/40 animate-spin-slow" />
      <Image
        src="/brand/hero-100.webp"
        alt=""
        aria-hidden
        width={1689}
        height={1107}
        className="absolute left-1/2 top-[54%] w-[78%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-110"
      />
      {["A", "B", "C", "D"].map((l, i) => (
        <span
          key={l}
          className="absolute grid h-8 w-8 place-items-center rounded-lg border border-white/30 bg-white/15 font-display text-sm font-bold text-white shadow-lg backdrop-blur-sm animate-float"
          style={{ left: `${[8, 82, 12, 80][i]}%`, top: `${[14, 16, 66, 64][i]}%`, animationDelay: `${-i * 1.3}s` }}
        >
          {l}
        </span>
      ))}
      <span className="absolute right-[18%] top-[38%] font-display text-4xl font-extrabold text-cyan/80 animate-float [animation-delay:-2s]">?</span>
    </div>
  );
}

export function GamesArt() {
  const capsules = [
    { x: 12, y: 22, r: -30, c: "#1f6bff", d: 0 },
    { x: 70, y: 14, r: 25, c: "#38d6ff", d: -1.5 },
    { x: 20, y: 68, r: 40, c: "#064da1", d: -3 },
    { x: 80, y: 62, r: -15, c: "#1f6bff", d: -4.2 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_50%_100%,#1f6bff_0%,#0b2a6b_40%,#04112e_100%)]">
      {/* spin wheel peeking from the bottom */}
      <svg viewBox="0 0 200 200" className="absolute -bottom-[45%] left-1/2 w-[70%] -translate-x-1/2 animate-spin-slow opacity-90">
        {Array.from({ length: 8 }).map((_, i) => {
          const a1 = (i * 45 * Math.PI) / 180, a2 = ((i + 1) * 45 * Math.PI) / 180;
          return (
            <path
              key={i}
              d={`M100,100 L${100 + 96 * Math.cos(a1)},${100 + 96 * Math.sin(a1)} A96,96 0 0 1 ${100 + 96 * Math.cos(a2)},${100 + 96 * Math.sin(a2)} Z`}
              fill={["#1f6bff", "#0b2a6b", "#38d6ff", "#064da1"][i % 4]}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1.5"
            />
          );
        })}
        <circle cx="100" cy="100" r="98" fill="none" stroke="#e7eef9" strokeWidth="4" />
        <circle cx="100" cy="100" r="18" fill="#04112e" stroke="#fff" strokeWidth="3" />
      </svg>
      {/* cricket ball */}
      <div className="absolute left-1/2 top-[34%] h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff,#c7d6ee_60%,#8aa3c8)] shadow-[0_0_40px_rgba(56,214,255,0.6)] transition-transform duration-700 group-hover:-translate-y-[70%] group-hover:rotate-180">
        <div className="absolute inset-y-1 left-1/2 w-2 -translate-x-1/2 rounded-full border-x-2 border-dashed border-electric/80" />
      </div>
      {capsules.map((c, i) => (
        <div key={i} className="absolute animate-float" style={{ left: `${c.x}%`, top: `${c.y}%`, animationDelay: `${c.d}s` }}>
          <div className="flex h-5 w-12 overflow-hidden rounded-full shadow-[0_0_18px_rgba(56,214,255,0.5)]" style={{ transform: `rotate(${c.r}deg)` }}>
            <span className="w-1/2" style={{ background: c.c }} />
            <span className="w-1/2 bg-silver" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LiveArt() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[linear-gradient(180deg,#020817_0%,#0b2a6b_55%,#04112e_100%)]">
      {/* floodlight beams */}
      <div aria-hidden className="absolute -left-6 -top-4 h-[130%] w-24 origin-top rotate-[-28deg] bg-gradient-to-b from-white/35 to-transparent blur-md" />
      <div aria-hidden className="absolute -right-6 -top-4 h-[130%] w-24 origin-top rotate-[28deg] bg-gradient-to-b from-white/35 to-transparent blur-md" />
      <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        {/* floodlight towers */}
        {[18, 382].map((x) => (
          <g key={x}>
            <rect x={x - 1.5} y="22" width="3" height="80" fill="#1e3a8a" />
            <rect x={x - 12} y="12" width="24" height="12" rx="2" fill="#e7eef9" />
            <circle cx={x} cy="18" r="22" fill="url(#flood)" />
          </g>
        ))}
        {/* stands */}
        <path d="M0 110 Q200 60 400 110 L400 180 L0 180Z" fill="#071c4a" />
        {Array.from({ length: 90 }).map((_, i) => (
          <circle key={i} cx={(i * 37) % 400} cy={92 + ((i * 13) % 22)} r="1.2" fill={["#38d6ff", "#fff", "#1f6bff"][i % 3]} opacity="0.7" />
        ))}
        {/* ground + pitch */}
        <ellipse cx="200" cy="175" rx="230" ry="62" fill="#15803d" />
        <ellipse cx="200" cy="175" rx="170" ry="44" fill="#166534" />
        <path d="M188 128 L212 128 L222 180 L178 180Z" fill="#c8ad73" />
        <rect x="190" y="126" width="20" height="3" fill="#ffc53d" />
        <defs>
          <radialGradient id="flood">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38d6ff" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      {/* scoreboard ticker */}
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg border border-white/15 bg-navy-950/70 px-3 py-1.5 text-xs font-bold tracking-wider backdrop-blur-sm">
        <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px]">LIVE</span>
        <span className="text-white/80">ICC CWC</span>
      </div>
    </div>
  );
}
