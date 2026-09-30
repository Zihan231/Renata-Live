"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useAnimate } from "framer-motion";
import { burst } from "@/lib/confetti";

const SEGMENTS = [
  { label: "SIX!", emoji: "🏏", color: "#1f6bff", title: "Maximum!", text: "You smashed it out of the park. Now go catch the real sixes on the live stream!" },
  { label: "Fact", emoji: "🌍", color: "#0b2a6b", title: "Global reach", text: "Renata's products reach 69 global destinations, including 22 regulated markets." },
  { label: "Tip", emoji: "💧", color: "#00adad", title: "Health tip", text: "Stay hydrated while you cheer — keep a bottle of water close during long matches." },
  { label: "100+", emoji: "🏆", color: "#ffc53d", title: "100+ Club", text: "Renata's young scientists have developed 100+ bioequivalent products. You're in the club!" },
  { label: "Quiz", emoji: "🧠", color: "#6a3767", title: "Quiz time", text: "Think you know bioequivalence? Take the 100+ BE Quiz and prove it." },
  { label: "FOUR!", emoji: "4️⃣", color: "#064da1", title: "Boundary!", text: "Crisp timing! A cracking shot racing to the rope." },
  { label: "Fact", emoji: "🔬", color: "#9f76b4", title: "Science fact", text: "Bioequivalence compares the rate and extent of absorption, commonly using AUC and Cmax." },
  { label: "Again", emoji: "🔄", color: "#145960", title: "So close!", text: "The wheel wants another go. Spin again!" },
];
const N = SEGMENTS.length;
const SEG = 360 / N;
const DAILY_SPINS = 3;

function todayKey() {
  return `rl_spins_${new Date().toISOString().slice(0, 10)}`;
}

export default function SpinWheel() {
  const [scope, animate] = useAnimate();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [used, setUsed] = useState(0);

  useEffect(() => {
    try {
      setUsed(Number(localStorage.getItem(todayKey()) ?? 0));
    } catch {}
  }, []);

  const left = DAILY_SPINS - used;

  async function spin() {
    if (spinning || left <= 0) return;
    setSpinning(true);
    setResult(null);
    const pick = Math.floor(Math.random() * N);
    const center = pick * SEG + SEG / 2;
    // land the picked segment under the top pointer, with a little jitter inside the slice
    const jitter = (Math.random() - 0.5) * SEG * 0.6;
    const base = Math.ceil(rotation / 360) * 360;
    const target = base + 360 * 6 + (360 - center) + jitter;
    await animate(scope.current, { rotate: target }, { duration: 5, ease: [0.15, 0.85, 0.2, 1] });
    setRotation(target);
    setSpinning(false);
    setResult(pick);
    // "Again" gives the spin back
    if (SEGMENTS[pick].label !== "Again") {
      const u = used + 1;
      setUsed(u);
      try {
        localStorage.setItem(todayKey(), String(u));
      } catch {}
    }
    if (["SIX!", "100+", "FOUR!"].includes(SEGMENTS[pick].label)) burst(0.5, 0.45);
  }

  const R = 200;
  const polar = (deg: number, r: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [R + r * Math.cos(a), R + r * Math.sin(a)];
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center">
      <div className="relative w-full max-w-[420px]">
        {/* pointer */}
        <div className="absolute left-1/2 top-[-6px] z-10 -translate-x-1/2">
          <svg width="44" height="54" viewBox="0 0 44 54" className="drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)]">
            <path d="M22 52 4 14a18 18 0 1 1 36 0Z" fill="#fff" />
            <circle cx="22" cy="18" r="7" fill="#1f6bff" />
          </svg>
        </div>
        {/* outer ring with bulbs */}
        <div className="relative aspect-square rounded-full bg-gradient-to-br from-silver via-slate-400 to-slate-200 p-3 shadow-[0_30px_80px_-10px_rgba(31,107,255,0.6)]">
          <div className="absolute inset-0">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="absolute h-2.5 w-2.5 rounded-full bg-gold"
                style={{
                  left: `${50 + 48 * Math.cos((i / 24) * 2 * Math.PI)}%`,
                  top: `${50 + 48 * Math.sin((i / 24) * 2 * Math.PI)}%`,
                  transform: "translate(-50%,-50%)",
                  boxShadow: "0 0 10px #ffc53d",
                  animation: `pulse ${spinning ? 0.3 : 1.4}s ${i % 2 ? 0.15 : 0}s infinite`,
                }}
              />
            ))}
          </div>
          <div className="relative h-full w-full overflow-hidden rounded-full">
            <svg ref={scope} viewBox="0 0 400 400" className="h-full w-full" style={{ transform: `rotate(${rotation}deg)` }}>
              {SEGMENTS.map((s, i) => {
                const [x1, y1] = polar(i * SEG, R);
                const [x2, y2] = polar((i + 1) * SEG, R);
                const [tx, ty] = polar(i * SEG + SEG / 2, R * 0.66);
                const [ex, ey] = polar(i * SEG + SEG / 2, R * 0.86);
                return (
                  <g key={i}>
                    <path d={`M${R},${R} L${x1},${y1} A${R},${R} 0 0 1 ${x2},${y2} Z`} fill={s.color} stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                    <text
                      x={tx}
                      y={ty}
                      fill={s.color === "#ffc53d" ? "#04112e" : "#fff"}
                      fontSize="20"
                      fontWeight="800"
                      fontFamily="var(--font-sora)"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${i * SEG + SEG / 2} ${tx} ${ty})`}
                    >
                      {s.label}
                    </text>
                    <text x={ex} y={ey} fontSize="22" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${i * SEG + SEG / 2} ${ex} ${ey})`}>
                      {s.emoji}
                    </text>
                  </g>
                );
              })}
              <circle cx={R} cy={R} r="46" fill="#04112e" stroke="#fff" strokeWidth="4" />
            </svg>
          </div>
          {/* hub button */}
          <button
            onClick={spin}
            disabled={spinning || left <= 0}
            className="absolute left-1/2 top-1/2 z-10 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-cyan to-electric font-display text-lg font-extrabold shadow-[0_0_30px_rgba(56,214,255,0.7)] transition hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
          >
            {spinning ? "…" : "SPIN"}
          </button>
        </div>
      </div>

      <p className="mt-6 text-sm text-white/60">
        {left > 0 ? (
          <>
            <span className="font-semibold text-gold">{left}</span> spin{left === 1 ? "" : "s"} left today
          </>
        ) : (
          "You've used today's spins — come back tomorrow!"
        )}
      </p>

      <AnimatePresence>
        {result !== null && (
          <motion.div
            key={rotation}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass ring-gradient mt-6 w-full rounded-3xl p-6 text-center"
          >
            <p className="text-5xl">{SEGMENTS[result].emoji}</p>
            <p className="mt-3 font-display text-2xl font-bold">{SEGMENTS[result].title}</p>
            <p className="mt-2 text-white/70">{SEGMENTS[result].text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
