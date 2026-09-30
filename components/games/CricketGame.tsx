"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Hud from "./Hud";
import GameOver from "./GameOver";
import { useBest } from "@/lib/useBest";
import { burst } from "@/lib/confetti";
import { PRODUCTS } from "@/lib/products";

const W = 450;
const H = 600;
const BALLS = 12;
const WICKETS = 3;
const SWEET = 0.9; // ideal contact point along the delivery (0 = release, 1 = stumps)
const METER_MAX = 1.1; // timing bars span t = 0..1.1 so every zone (SWEET ± 0.17) fits inside
const STUMP_Y = 520;
const STUMP_X = 225;
const FIELD_TOP = 204;
const SPONSOR_LOGOS = ["/brand/renata-logo.png", ...PRODUCTS.filter((p) => p.logo).map((p) => p.logo!)];

type Phase = "idle" | "runup" | "bowling" | "flight" | "over";
type Outcome = { label: string; runs: number; out?: boolean; color: string };

function judge(dt: number): Outcome | null {
  const a = Math.abs(dt);
  if (a < 0.04) return { label: "SIX!", runs: 6, color: "#ffc53d" };
  if (a < 0.08) return { label: "FOUR!", runs: 4, color: "#38d6ff" };
  if (a < 0.12) return { label: "2 RUNS", runs: 2, color: "#ffffff" };
  if (a < 0.17) return { label: "1 RUN", runs: 1, color: "#ffffff" };
  return null;
}

export default function CricketGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { best, submit } = useBest("cricket");
  const [hud, setHud] = useState({ runs: 0, wickets: 0, balls: 0 });
  const [log, setLog] = useState<string[]>([]);
  const [flash, setFlash] = useState<{ id: number; text: string; color: string } | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [newBest, setNewBest] = useState(false);

  const g = useRef({
    phase: "idle" as Phase,
    phaseAt: 0,
    D: 1200,
    line: 0,
    swingAt: 0,
    missed: false,
    ball: { x: 0, y: 0, vx: 0, vy: 0, s: 1, lofted: false },
    trail: [] as { x: number; y: number }[],
    stumpsHit: 0,
    runs: 0,
    wickets: 0,
    balls: 0,
    shake: 0,
    excite: { at: 0, level: 0 },
    screen: { text: "", color: "#fff", until: 0 },
  });

  const setPhaseBoth = (p: Phase) => {
    g.current.phase = p;
    g.current.phaseAt = performance.now();
    setPhase(p);
  };

  const nextBall = useCallback(() => {
    const s = g.current;
    s.D = Math.max(700, 1250 - s.balls * 35 + (Math.random() - 0.5) * 220);
    s.line = (Math.random() - 0.5) * 50;
    s.swingAt = 0;
    s.missed = false;
    s.trail = [];
    setPhaseBoth("runup");
  }, []);

  const finishBall = useCallback(
    (o: Outcome, entry: string) => {
      const s = g.current;
      const now = performance.now();
      s.balls += 1;
      s.runs += o.runs;
      if (o.out) s.wickets += 1;
      s.excite = { at: now, level: o.runs === 6 ? 1.6 : o.runs === 4 ? 1 : o.out ? 0.5 : o.runs ? 0.3 : 0 };
      s.screen = { text: o.label, color: o.color, until: now + 2200 };
      setHud({ runs: s.runs, wickets: s.wickets, balls: s.balls });
      setLog((l) => [...l, entry]);
      setFlash({ id: now, text: o.label, color: o.color });
      if (o.runs === 6) burst(0.5, 0.35);
      setTimeout(() => {
        if (s.balls >= BALLS || s.wickets >= WICKETS) {
          setNewBest(submit(s.runs));
          setPhaseBoth("over");
        } else nextBall();
      }, 1300);
    },
    [nextBall, submit],
  );

  const start = useCallback(() => {
    const s = g.current;
    s.runs = s.wickets = s.balls = 0;
    s.stumpsHit = 0;
    setHud({ runs: 0, wickets: 0, balls: 0 });
    setLog([]);
    setNewBest(false);
    nextBall();
  }, [nextBall]);

  const swing = useCallback(() => {
    const s = g.current;
    const now = performance.now();
    if (s.phase === "idle" || s.phase === "over") return start();
    if (s.phase !== "bowling" || s.swingAt) return;
    s.swingAt = now;
    const t = (now - s.phaseAt) / s.D;
    const o = judge(t - SWEET);
    if (!o) {
      s.missed = true;
      return;
    }
    const dir = t < SWEET ? -1 : 1; // early = pull to leg, late = cut to off
    const ball = s.ball;
    ball.lofted = o.runs >= 4;
    ball.vx = dir * (2 + Math.random() * 4) + (Math.random() - 0.5) * 2;
    ball.vy = o.runs === 6 ? -11 : o.runs === 4 ? -8 : -5;
    s.shake = o.runs === 6 ? 10 : 4;
    setPhaseBoth("flight");
    finishBall(o, String(o.runs));
  }, [finishBall, start]);

  // input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        swing();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [swing]);

  // render loop
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const s = g.current;
    const crowdRows = buildCrowd(dpr);
    const logos = SPONSOR_LOGOS.map((src) => {
      const img = new window.Image();
      img.src = src;
      return img;
    });
    const flashes: { x: number; y: number; life: number }[] = [];
    let raf = 0;

    const pos = (t: number) => {
      const gy = 232 + (STUMP_Y - 12 - 232) * t;
      const x = STUMP_X + s.line * t * (1 - t) * 2.2 + s.line * 0.15 * t;
      const sc = 0.35 + 0.85 * t;
      const tb = 0.66;
      const h = t < tb ? 70 * (1 - t / tb) : 38 * Math.sin((Math.PI * (t - tb)) / (1.35 - tb));
      return { x, y: gy - h * sc, gy, sc };
    };

    const loop = () => {
      const now = performance.now();
      const el = now - s.phaseAt;
      const excite = s.excite.level * Math.max(0, 1 - (now - s.excite.at) / 2600);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (s.shake > 0) {
        ctx.translate((Math.random() - 0.5) * s.shake, (Math.random() - 0.5) * s.shake);
        s.shake *= 0.9;
        if (s.shake < 0.3) s.shake = 0;
      }

      drawStadium(ctx, crowdRows, now, excite);
      drawBigScreen(ctx, s, now);
      drawFlags(ctx, now, excite);

      // camera flashes in the stands, far more when the crowd is up
      if (Math.random() < 0.04 + excite * 0.5) flashes.push({ x: Math.random() * W, y: 48 + Math.random() * 125, life: 1 });
      for (const f of flashes) {
        f.life -= 0.12;
        ctx.globalAlpha = Math.max(0, f.life);
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      for (let i = flashes.length - 1; i >= 0; i--) if (flashes[i].life <= 0) flashes.splice(i, 1);

      drawBoards(ctx, logos, now);
      drawField(ctx, now);

      // far end: stumps, umpire, bowler
      drawStumps(ctx, STUMP_X, 232, 0.35, 0);
      drawPerson(ctx, 198, 240, 0.3, "#f8fafc", "#1e293b", "#111827");
      let t = 0;
      if (s.phase === "runup") {
        const p = Math.min(1, el / 900);
        drawPerson(ctx, 236, 206 + 30 * p, 0.26 + 0.06 * p, "#0f766e", "#e2e8f0", "#0f172a", p * Math.PI * 2);
        if (el > 900) setPhaseBoth("bowling");
      } else {
        drawPerson(ctx, 240, 238, 0.32, "#0f766e", "#e2e8f0", "#0f172a", Math.PI * 0.8);
      }

      if (s.phase === "bowling") {
        // Measure from phaseAt, not `el`: on the frame the run-up ends, `el` still holds the
        // ~900ms run-up time, which instantly "bowled" any delivery faster than that.
        t = Math.max(0, now - s.phaseAt) / s.D;
        const b = pos(Math.min(t, 1.25));
        s.ball.x = b.x;
        s.ball.y = b.y;
        s.ball.s = b.sc;
        s.trail.push({ x: b.x, y: b.y });
        if (s.trail.length > 8) s.trail.shift();
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath();
        ctx.ellipse(b.x, b.gy, 7 * b.sc, 3 * b.sc, 0, 0, Math.PI * 2);
        ctx.fill();
        if (t >= 1 && !s.swingAt) {
          s.stumpsHit = now;
          s.shake = 8;
          setPhaseBoth("flight");
          finishBall({ label: "BOWLED!", runs: 0, out: true, color: "#f87171" }, "W");
        } else if (s.missed && t >= 1.2) {
          setPhaseBoth("flight");
          finishBall({ label: "BEATEN!", runs: 0, color: "#94a3b8" }, "•");
        }
      }
      if (s.phase === "flight" && s.swingAt && !s.missed) {
        const b = s.ball;
        b.x += b.vx;
        b.y += b.vy;
        b.vy += b.lofted ? 0.12 : 0.2;
        b.s = Math.max(0.2, b.s * (b.lofted ? 0.985 : 0.995));
        s.trail.push({ x: b.x, y: b.y });
        if (s.trail.length > 14) s.trail.shift();
      }

      const hitAge = s.stumpsHit ? now - s.stumpsHit : 0;
      drawStumps(ctx, STUMP_X, STUMP_Y, 1, s.stumpsHit && hitAge < 1300 ? hitAge : 0);

      const showBall = s.phase === "bowling" || (s.phase === "flight" && el < 1300);
      if (showBall) {
        s.trail.forEach((p, i) => {
          ctx.fillStyle = `rgba(56,214,255,${(i / s.trail.length) * 0.35})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6 * s.ball.s * (i / s.trail.length), 0, Math.PI * 2);
          ctx.fill();
        });
        drawBall(ctx, s.ball.x, s.ball.y, 7 * s.ball.s, now);
      }

      drawBatter(ctx, s.swingAt ? now - s.swingAt : -1);

      // timing meter
      if (s.phase === "bowling" || s.phase === "runup") {
        const mx = 40, mw = W - 80, my = H - 22;
        ctx.fillStyle = "rgba(2,8,23,0.55)";
        roundRect(ctx, mx - 8, my - 8, mw + 16, 24, 12);
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        roundRect(ctx, mx, my, mw, 8, 4);
        const zone = (d: number, c: string) => {
          ctx.fillStyle = c;
          roundRect(ctx, mx + (mw * (SWEET - d)) / METER_MAX, my, (mw * d * 2) / METER_MAX, 8, 4);
        };
        zone(0.17, "rgba(255,255,255,0.35)");
        zone(0.08, "rgba(56,214,255,0.8)");
        zone(0.04, "#ffc53d");
        if (s.phase === "bowling") {
          const px = mx + (mw * Math.min(METER_MAX, t)) / METER_MAX;
          ctx.fillStyle = "#fff";
          ctx.shadowColor = "#fff";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(Math.min(px, mx + mw), my + 4, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [finishBall]);

  const count = (v: string) => log.filter((b) => b === v).length;
  const overStart = Math.floor(Math.max(0, log.length - 1) / 6) * 6;
  const runRate = hud.balls ? ((hud.runs / hud.balls) * 6).toFixed(2) : "0.00";

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_460px_minmax(0,1fr)]">
      {/* left: how to play + partner */}
      <aside className="order-2 space-y-4 lg:order-1">
        <div className="glass rounded-3xl p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan">How to play</p>
          <div className="mt-4">
            <div className="relative h-3 rounded-full bg-white/10">
              <span className="absolute inset-y-0 rounded-full bg-white/35" style={{ left: `${((SWEET - 0.17) / METER_MAX) * 100}%`, width: `${((2 * 0.17) / METER_MAX) * 100}%` }} />
              <span className="absolute inset-y-0 rounded-full bg-cyan/80" style={{ left: `${((SWEET - 0.08) / METER_MAX) * 100}%`, width: `${((2 * 0.08) / METER_MAX) * 100}%` }} />
              <span className="absolute inset-y-0 rounded-full bg-gold" style={{ left: `${((SWEET - 0.04) / METER_MAX) * 100}%`, width: `${((2 * 0.04) / METER_MAX) * 100}%` }} />
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-gold" /> Gold zone — <b className="text-gold">SIX</b></li>
              <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-cyan" /> Blue zone — <b className="text-cyan">FOUR</b></li>
              <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-white/60" /> Edges — 1 or 2 runs</li>
              <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500" /> Don&apos;t swing — <b className="text-red-300">bowled!</b></li>
            </ul>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/70">
            <span className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5">👆 Tap the pitch</span>
            <span className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5">⌨️ Space / Enter</span>
            <span className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5">2 overs · 3 wickets</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white p-5">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Official partner</p>
          <Image src="/brand/renata-logo.png" alt="Renata PLC" width={573} height={115} className="mx-auto mt-3 h-9 w-auto" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {PRODUCTS.filter((p) => p.logo).map((p) => (
              <Image key={p.slug} src={p.logo!} alt={p.brand} width={480} height={160} className="h-7 w-full object-contain" />
            ))}
          </div>
        </div>
      </aside>

      {/* centre: the game */}
      <div className="order-1 mx-auto w-full max-w-[460px] lg:order-2">
        <Hud
          items={[
            { label: "Runs", value: hud.runs, accent: true },
            { label: "Wickets", value: `${hud.wickets}/${WICKETS}` },
            { label: "Balls", value: `${hud.balls}/${BALLS}` },
            { label: "Best", value: best ?? "–" },
          ]}
        />
        <div
          className="relative aspect-[3/4] w-full cursor-pointer touch-manipulation select-none overflow-hidden rounded-[1.75rem] border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8),0_0_60px_-10px_rgba(31,107,255,0.5)]"
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest("button, a")) return; // overlay buttons handle themselves
            e.preventDefault();
            swing();
          }}
        >
          <canvas ref={canvasRef} className="h-full w-full" />

          <AnimatePresence>
            {flash && (
              <motion.p
                key={flash.id}
                initial={{ scale: 0.3, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.4 }}
                transition={{ type: "spring", stiffness: 300, damping: 14 }}
                onAnimationComplete={() => setTimeout(() => setFlash((f) => (f?.id === flash.id ? null : f)), 700)}
                className="pointer-events-none absolute inset-x-0 top-[40%] text-center font-display text-6xl font-extrabold italic"
                style={{ color: flash.color, textShadow: `0 0 30px ${flash.color}, 0 6px 0 rgba(0,0,0,0.4)` }}
              >
                {flash.text}
              </motion.p>
            )}
          </AnimatePresence>

          {phase === "idle" && (
            <div className="absolute inset-0 grid place-items-center bg-navy-950/60 p-6 text-center backdrop-blur-sm">
              <div>
                <p className="text-6xl">🏏</p>
                <p className="mt-4 font-display text-3xl font-bold">Super Sixes</p>
                <p className="mx-auto mt-2 max-w-xs text-sm text-white/70">
                  Tap (or press Space) when the ball reaches the <span className="font-semibold text-gold">gold zone</span> on the timing bar. Perfect timing = SIX!
                </p>
                <p className="btn-primary mt-6 inline-block px-8 py-3 font-display font-semibold">Tap to bat</p>
              </div>
            </div>
          )}

          <GameOver open={phase === "over"} title={hud.wickets >= WICKETS ? "All out!" : "Innings over!"} score={hud.runs} scoreLabel="Runs" best={best} isNewBest={newBest} onRestart={start} />
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-xs uppercase tracking-widest text-white/40">This over</span>
          {log.length === 0 && <span className="text-sm text-white/30">—</span>}
          {log.slice(overStart).map((b, i) => (
            <BallChip key={overStart + i} b={b} />
          ))}
        </div>
      </div>

      {/* right: scorecard */}
      <aside className="order-3 space-y-4">
        <div className="glass rounded-3xl p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan">Scorecard</p>
          <p className="mt-3 font-display text-5xl font-extrabold text-chrome">
            {hud.runs}
            <span className="text-2xl text-white/50">/{hud.wickets}</span>
          </p>
          <p className="text-sm text-white/55">
            Overs {Math.floor(hud.balls / 6)}.{hud.balls % 6} · RR {runRate}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              ["6s", count("6"), "text-gold"],
              ["4s", count("4"), "text-cyan"],
              ["Dots", count("•") + count("0"), "text-white"],
            ].map(([l, v, c]) => (
              <div key={l as string} className="rounded-2xl bg-white/5 py-2.5">
                <p className={`font-display text-2xl font-bold ${c}`}>{v}</p>
                <p className="text-[10px] uppercase tracking-wider text-white/50">{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2">
            {[0, 1].map((over) => (
              <div key={over} className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-[11px] uppercase tracking-wider text-white/45">Over {over + 1}</span>
                <div className="flex gap-1.5">
                  {Array.from({ length: 6 }).map((_, i) => {
                    const b = log[over * 6 + i];
                    return b ? <BallChip key={i} b={b} small /> : <span key={i} className="h-6 w-6 rounded-full border border-dashed border-white/15" />;
                  })}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-white/55">
            Personal best: <b className="text-white">{best ?? "–"}</b>
          </p>
        </div>

        <Link href="/live" className="glass group flex items-center gap-4 rounded-3xl p-5 transition hover:border-red-400/40">
          <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-600 text-xl">
            🏏
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-400 animate-pulse" />
          </span>
          <span className="flex-1">
            <span className="block font-display font-semibold">Watch the real thing</span>
            <span className="text-xs text-white/55">Cricket World Cup — live now</span>
          </span>
          <span className="text-cyan transition group-hover:translate-x-1">→</span>
        </Link>
      </aside>
    </div>
  );
}

function BallChip({ b, small }: { b: string; small?: boolean }) {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`grid place-items-center rounded-full font-bold ${small ? "h-6 w-6 text-[11px]" : "h-8 w-8 text-sm"} ${
        b === "W" ? "bg-red-500" : b === "6" ? "bg-gold text-navy-950" : b === "4" ? "bg-cyan text-navy-950" : "bg-white/10"
      }`}
    >
      {b === "0" ? "•" : b}
    </motion.span>
  );
}

/* ---------- drawing helpers ---------- */

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

type CrowdRow = { canvas: HTMLCanvasElement; y: number };

/** Pre-renders each crowd row to its own canvas so rows can bounce independently for almost no cost. */
function buildCrowd(dpr: number): CrowdRow[] {
  const shirts = ["#1f6bff", "#1f6bff", "#1f6bff", "#064da1", "#064da1", "#ffffff", "#e7eef9", "#006a4e", "#006a4e", "#f42a41", "#38d6ff", "#ffc53d"];
  const skins = ["#8d5524", "#a0522d", "#c68642", "#e0ac69"];
  const rows: CrowdRow[] = [];
  const ys = [52, 61, 70, 79, 88, 110, 119, 128, 137, 146, 155, 164, 173];
  for (const y of ys) {
    const sc = 0.62 + ((y - 52) / 121) * 0.55;
    const c = document.createElement("canvas");
    const RH = 22;
    c.width = W * dpr;
    c.height = RH * dpr;
    const x2 = c.getContext("2d")!;
    x2.scale(dpr, dpr);
    const step = 7.2 * sc;
    for (let x = (y % 2) * step * 0.5; x < W; x += step * (0.85 + Math.random() * 0.3)) {
      if (Math.random() < 0.06) continue; // empty seat
      const shirt = shirts[Math.floor(Math.random() * shirts.length)];
      const by = RH - 6;
      x2.fillStyle = shirt;
      x2.beginPath();
      x2.roundRect(x, by - 5 * sc, 6.2 * sc, 8 * sc, 2 * sc);
      x2.fill();
      x2.fillStyle = skins[Math.floor(Math.random() * skins.length)];
      x2.beginPath();
      x2.arc(x + 3.1 * sc, by - 7.5 * sc, 2.5 * sc, 0, Math.PI * 2);
      x2.fill();
      if (Math.random() < 0.12) {
        // raised arms
        x2.strokeStyle = shirt;
        x2.lineWidth = 1.2 * sc;
        x2.beginPath();
        x2.moveTo(x + 0.5 * sc, by - 4 * sc);
        x2.lineTo(x - 1 * sc, by - 11 * sc);
        x2.moveTo(x + 5.7 * sc, by - 4 * sc);
        x2.lineTo(x + 7.2 * sc, by - 11 * sc);
        x2.stroke();
      }
    }
    rows.push({ canvas: c, y: y - RH + 6 });
  }
  return rows;
}

function drawStadium(ctx: CanvasRenderingContext2D, rows: CrowdRow[], now: number, excite: number) {
  // night sky with stars
  const sky = ctx.createLinearGradient(0, 0, 0, 60);
  sky.addColorStop(0, "#020817");
  sky.addColorStop(1, "#0b2a6b");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, 60);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  for (let i = 0; i < 24; i++) ctx.fillRect((i * 97) % W, (i * 37) % 30, 1, 1);

  // tiers
  const upper = ctx.createLinearGradient(0, 40, 0, 96);
  upper.addColorStop(0, "#081b47");
  upper.addColorStop(1, "#0d2a66");
  ctx.fillStyle = upper;
  ctx.fillRect(0, 40, W, 56);
  const lower = ctx.createLinearGradient(0, 100, 0, 180);
  lower.addColorStop(0, "#0a2254");
  lower.addColorStop(1, "#0e3075");
  ctx.fillStyle = lower;
  ctx.fillRect(0, 100, W, 80);

  // crowd rows, bouncing harder when excited
  const amp = 0.6 + excite * 5;
  rows.forEach((r, i) => {
    const off = -Math.abs(Math.sin(now / (excite > 0.05 ? 110 : 420) + i * 0.9)) * amp;
    ctx.drawImage(r.canvas, 0, r.y + off, W, r.canvas.height / (r.canvas.width / W));
  });

  // roof with lights
  ctx.fillStyle = "#030b22";
  ctx.fillRect(0, 34, W, 8);
  for (let x = 8; x < W; x += 18) {
    ctx.fillStyle = "#e0f2fe";
    ctx.shadowColor = "#38d6ff";
    ctx.shadowBlur = 6;
    ctx.fillRect(x, 38, 6, 2);
  }
  ctx.shadowBlur = 0;

  // tier walkway with scrolling LED ribbon
  ctx.fillStyle = "#020817";
  ctx.fillRect(0, 94, W, 9);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 94, W, 9);
  ctx.clip();
  ctx.font = "bold 7px Sora, sans-serif";
  ctx.textBaseline = "middle";
  const msg = "RENATA PLC  •  100+ BIOEQUIVALENT PRODUCTS  •  YOUNG MINDS, GLOBAL IMPACT  •  ";
  const mw = ctx.measureText(msg).width;
  const off = -((now / 25) % mw);
  ctx.fillStyle = "#38d6ff";
  for (let x = off; x < W; x += mw) ctx.fillText(msg, x, 99);
  ctx.restore();

  // floodlight towers
  for (const fx of [22, W - 22]) {
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(fx - 1.5, 6, 3, 40);
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(fx - 12, 2, 24, 9);
    const gl = ctx.createRadialGradient(fx, 6, 0, fx, 6, 130);
    gl.addColorStop(0, "rgba(255,255,255,0.85)");
    gl.addColorStop(0.1, "rgba(190,230,255,0.35)");
    gl.addColorStop(1, "rgba(56,214,255,0)");
    ctx.fillStyle = gl;
    ctx.fillRect(fx - 130, 0, 260, 140);
  }
}

function drawBigScreen(ctx: CanvasRenderingContext2D, s: { runs: number; wickets: number; balls: number; screen: { text: string; color: string; until: number } }, now: number) {
  const x = 150, y = 46, w = 150, h = 46;
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(x + w / 2 - 3, y + h, 6, 6);
  ctx.fillStyle = "#020817";
  ctx.shadowColor = "#1f6bff";
  ctx.shadowBlur = 14;
  roundRect(ctx, x, y, w, h, 4);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#1f6bff";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#38d6ff";
  ctx.font = "bold 7px Sora, sans-serif";
  ctx.fillText("RENATA LIVE  •  SUPER SIXES", x + w / 2, y + 8);
  const showing = now < s.screen.until;
  ctx.font = `800 ${showing ? 18 : 17}px Sora, sans-serif`;
  ctx.fillStyle = showing ? s.screen.color : "#ffffff";
  ctx.fillText(showing ? s.screen.text : `${s.runs}/${s.wickets}`, x + w / 2, y + 24);
  ctx.font = "bold 7px Sora, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillText(`OVERS ${Math.floor(s.balls / 6)}.${s.balls % 6}  •  TARGET: BEAT YOUR BEST`, x + w / 2, y + 38);
}

function drawFlags(ctx: CanvasRenderingContext2D, now: number, excite: number) {
  const flags = [
    { x: 38, y: 150, kind: "bd" },
    { x: 118, y: 128, kind: "renata" },
    { x: 332, y: 132, kind: "bd" },
    { x: 412, y: 152, kind: "renata" },
    { x: 60, y: 74, kind: "renata" },
    { x: 392, y: 72, kind: "bd" },
  ];
  const speed = excite > 0.05 ? 90 : 220;
  for (const [i, f] of flags.entries()) {
    const lift = Math.abs(Math.sin(now / 160 + i)) * excite * 5;
    const px = f.x, py = f.y - lift;
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, py + 16);
    ctx.lineTo(px, py - 8);
    ctx.stroke();
    const fw = 18, fh = 11;
    ctx.beginPath();
    for (let k = 0; k <= 6; k++) {
      const fx = px + (fw * k) / 6;
      ctx.lineTo(fx, py - 8 + Math.sin(now / speed + k * 0.9 + i) * 1.6 * (k / 6));
    }
    for (let k = 6; k >= 0; k--) {
      const fx = px + (fw * k) / 6;
      ctx.lineTo(fx, py - 8 + fh + Math.sin(now / speed + k * 0.9 + i) * 1.6 * (k / 6));
    }
    ctx.closePath();
    ctx.fillStyle = f.kind === "bd" ? "#006a4e" : "#1f6bff";
    ctx.fill();
    const wave = Math.sin(now / speed + 3 * 0.9 + i) * 0.8;
    if (f.kind === "bd") {
      ctx.fillStyle = "#f42a41";
      ctx.beginPath();
      ctx.arc(px + fw * 0.45, py - 8 + fh / 2 + wave, 3.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 8px Sora, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("R", px + fw / 2, py - 8 + fh / 2 + wave);
    }
  }
}

/** Boundary advertising boards: scrolling panels with Renata and product logos. */
function drawBoards(ctx: CanvasRenderingContext2D, logos: HTMLImageElement[], now: number) {
  const y = 180, h = 24, pw = 96;
  ctx.fillStyle = "#020817";
  ctx.fillRect(0, y - 1, W, h + 2);
  const total = pw * logos.length;
  const off = -((now / 30) % total);
  for (let x = off, i = 0; x < W; x += pw, i++) {
    const img = logos[i % logos.length];
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 1, y, pw - 2, h);
    if (img.complete && img.naturalWidth) {
      const ih = h - 8;
      const iw = Math.min(pw - 14, (img.naturalWidth / img.naturalHeight) * ih);
      const ihh = (img.naturalHeight / img.naturalWidth) * iw;
      ctx.drawImage(img, x + (pw - iw) / 2, y + (h - ihh) / 2, iw, ihh);
    }
  }
  // LED sheen
  const sheen = ctx.createLinearGradient(0, y, 0, y + h);
  sheen.addColorStop(0, "rgba(255,255,255,0.25)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0)");
  sheen.addColorStop(1, "rgba(0,0,0,0.12)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, y, W, h);
}

function drawField(ctx: CanvasRenderingContext2D, now: number) {
  // outfield with mowing stripes
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 ? "#15803d" : "#166534";
    ctx.fillRect(0, FIELD_TOP + i * 40, W, 40);
  }
  const vig = ctx.createLinearGradient(0, FIELD_TOP, 0, H);
  vig.addColorStop(0, "rgba(2,8,23,0.4)");
  vig.addColorStop(1, "rgba(2,8,23,0)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, FIELD_TOP, W, H - FIELD_TOP);

  // painted ground sponsor logos
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.font = "800 30px Sora, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const [x, y] of [[82, 318], [368, 318]]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, 0.38);
    ctx.fillText("RENATA", 0, 0);
    ctx.restore();
  }
  ctx.font = "800 22px Sora, sans-serif";
  for (const [x, y] of [[70, 450], [380, 450]]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, 0.4);
    ctx.fillText("100+ BE", 0, 0);
    ctx.restore();
  }
  ctx.restore();

  // 30-yard circle
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.setLineDash([4, 6]);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(225, 400, 190, 150, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // pitch
  ctx.fillStyle = "#c8ad73";
  ctx.beginPath();
  ctx.moveTo(203, 214);
  ctx.lineTo(247, 214);
  ctx.lineTo(320, H);
  ctx.lineTo(130, H);
  ctx.closePath();
  ctx.fill();
  const pg = ctx.createLinearGradient(0, 214, 0, H);
  pg.addColorStop(0, "rgba(0,0,0,0.25)");
  pg.addColorStop(1, "rgba(255,255,255,0.08)");
  ctx.fillStyle = pg;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(200, 240);
  ctx.lineTo(250, 240);
  ctx.stroke();
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(140, 548);
  ctx.lineTo(310, 548);
  ctx.stroke();

  // fielders (swaying slightly)
  const fielders: [number, number, number][] = [
    [70, 262, 0.34], [382, 258, 0.34], [150, 300, 0.42], [305, 296, 0.42], [48, 380, 0.55], [405, 372, 0.55], [92, 470, 0.68], [372, 468, 0.68],
  ];
  fielders.forEach(([x, y, sc], i) => drawPerson(ctx, x + Math.sin(now / 700 + i) * 1.5, y, sc, "#0f766e", "#e2e8f0", "#0f172a"));
}

/** Small side-on player figure; `arm` rotates the bowling arm. */
function drawPerson(ctx: CanvasRenderingContext2D, x: number, y: number, sc: number, shirt: string, pants: string, cap: string, arm?: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(0, 2, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pants;
  ctx.fillRect(-7, -26, 6, 27);
  ctx.fillRect(1, -26, 6, 27);
  ctx.fillStyle = shirt;
  ctx.beginPath();
  ctx.roundRect(-9, -52, 18, 28, 5);
  ctx.fill();
  ctx.fillStyle = "#a0522d";
  ctx.beginPath();
  ctx.arc(0, -59, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = cap;
  ctx.beginPath();
  ctx.arc(0, -61, 7, Math.PI, Math.PI * 2);
  ctx.fill();
  if (arm !== undefined) {
    ctx.strokeStyle = shirt;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, -48);
    ctx.lineTo(Math.sin(arm) * 20, -48 - Math.cos(arm) * 20);
    ctx.stroke();
  }
  ctx.restore();
}

function drawStumps(ctx: CanvasRenderingContext2D, x: number, baseY: number, sc: number, hitAge: number) {
  const h = 58 * sc, gap = 9 * sc, w = 3.5 * sc;
  for (let i = -1; i <= 1; i++) {
    ctx.save();
    ctx.translate(x + i * gap, baseY);
    if (hitAge) ctx.rotate(i * 0.35 * Math.min(1, hitAge / 150) + (i === 0 ? 0.2 : 0));
    const sg = ctx.createLinearGradient(-w, 0, w, 0);
    sg.addColorStop(0, "#e2d3a8");
    sg.addColorStop(1, "#b89b5e");
    ctx.fillStyle = sg;
    ctx.fillRect(-w / 2, -h, w, h);
    ctx.restore();
  }
  const lift = hitAge ? Math.min(hitAge, 700) : 0;
  const by = baseY - h - 2 * sc - (lift ? (lift / 700) * 90 - (lift / 700) ** 2 * 40 : 0);
  ctx.fillStyle = "#ffc53d";
  ctx.save();
  ctx.translate(x, by);
  if (lift) ctx.rotate(lift / 60);
  ctx.fillRect(-gap - w / 2, -1.5 * sc, gap * 2 + w, 3 * sc);
  ctx.restore();
}

function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, now: number) {
  const bg = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
  bg.addColorStop(0, "#ffffff");
  bg.addColorStop(1, "#d8e3f5");
  ctx.fillStyle = bg;
  ctx.shadowColor = "#38d6ff";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1.5, r), 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#1f6bff";
  ctx.lineWidth = Math.max(0.6, r * 0.18);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.7, now / 90, now / 90 + Math.PI * 0.8);
  ctx.stroke();
}

function drawBatter(ctx: CanvasRenderingContext2D, swingAge: number) {
  const bx = STUMP_X + 34, by = STUMP_Y + 6;
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(bx, by + 2, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(bx - 12, by - 40, 9, 42);
  ctx.fillRect(bx + 3, by - 40, 9, 42);
  const kit = ctx.createLinearGradient(bx - 16, by - 95, bx + 16, by - 40);
  kit.addColorStop(0, "#1f6bff");
  kit.addColorStop(1, "#064da1");
  ctx.fillStyle = kit;
  ctx.beginPath();
  ctx.roundRect(bx - 16, by - 95, 32, 58, 10);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 7px Sora, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("RENATA", bx, by - 76);
  ctx.fillStyle = "#0b2a6b";
  ctx.beginPath();
  ctx.arc(bx, by - 108, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bx - 13, by - 104);
  ctx.lineTo(bx - 4, by - 96);
  ctx.stroke();
  const k = swingAge < 0 ? 0 : Math.min(1, swingAge / 160);
  const ease = 1 - (1 - k) ** 3;
  const ang = -2.3 + ease * 2.9;
  ctx.save();
  ctx.translate(bx - 10, by - 70);
  ctx.rotate(ang);
  ctx.fillStyle = "#e7c98f";
  ctx.beginPath();
  ctx.roundRect(-5, 0, 10, 62, 3);
  ctx.fill();
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(-2.5, -18, 5, 20);
  ctx.restore();
  ctx.fillStyle = "#38d6ff";
  ctx.beginPath();
  ctx.arc(bx - 10, by - 70, 6, 0, Math.PI * 2);
  ctx.fill();
}
