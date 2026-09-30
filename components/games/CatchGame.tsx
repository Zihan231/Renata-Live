"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Hud from "./Hud";
import GameOver from "./GameOver";
import { useBest } from "@/lib/useBest";

const W = 450;
const H = 600;
const TRAY_W = 96;
const LIVES = 3;

type Kind = "capsule" | "gold" | "virus";
type Item = { x: number; y: number; vy: number; rot: number; vr: number; kind: Kind; hue: string };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; c: string };
type Pop = { x: number; y: number; text: string; life: number; c: string };

const CAPSULE_COLORS = ["#1f6bff", "#9f76b4", "#00adad", "#ec2429", "#6a3767", "#145960"];

export default function CatchGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { best, submit } = useBest("catch");
  const [hud, setHud] = useState({ score: 0, lives: LIVES, level: 1 });
  const [phase, setPhase] = useState<"idle" | "playing" | "over">("idle");
  const [newBest, setNewBest] = useState(false);

  const s = useRef({
    playing: false,
    x: W / 2,
    target: W / 2,
    items: [] as Item[],
    sparks: [] as Spark[],
    pops: [] as Pop[],
    score: 0,
    lives: LIVES,
    lastSpawn: 0,
    startedAt: 0,
    hurt: 0,
    keys: { left: false, right: false },
  });

  const start = useCallback(() => {
    const g = s.current;
    Object.assign(g, { playing: true, items: [], sparks: [], pops: [], score: 0, lives: LIVES, lastSpawn: 0, startedAt: performance.now(), hurt: 0 });
    setHud({ score: 0, lives: LIVES, level: 1 });
    setNewBest(false);
    setPhase("playing");
  }, []);

  // pointer + keyboard control
  useEffect(() => {
    const wrap = wrapRef.current!;
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      s.current.target = ((e.clientX - r.left) / r.width) * W;
    };
    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (e.key === "ArrowLeft" || e.key === "a") s.current.keys.left = down;
      if (e.key === "ArrowRight" || e.key === "d") s.current.keys.right = down;
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerdown", onMove);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerdown", onMove);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const g = s.current;
      const dt = Math.min(2.5, (now - last) / 16.67);
      last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawBg(ctx, now);

      if (g.playing) {
        const elapsed = (now - g.startedAt) / 1000;
        const level = 1 + Math.floor(elapsed / 15);
        const speed = 1 + elapsed / 40;

        // player
        if (g.keys.left) g.target -= 9 * dt;
        if (g.keys.right) g.target += 9 * dt;
        g.target = Math.max(TRAY_W / 2, Math.min(W - TRAY_W / 2, g.target));
        g.x += (g.target - g.x) * Math.min(1, 0.25 * dt);

        // spawn
        const interval = Math.max(320, 900 - elapsed * 12);
        if (now - g.lastSpawn > interval) {
          g.lastSpawn = now;
          const r = Math.random();
          const virusChance = Math.min(0.35, 0.12 + elapsed / 300);
          const kind: Kind = r < virusChance ? "virus" : r < virusChance + 0.08 ? "gold" : "capsule";
          g.items.push({
            x: 30 + Math.random() * (W - 60),
            y: -30,
            vy: (2.2 + Math.random() * 1.6) * speed * (kind === "gold" ? 1.25 : 1),
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.08,
            kind,
            hue: CAPSULE_COLORS[Math.floor(Math.random() * CAPSULE_COLORS.length)],
          });
        }

        // update items
        const trayY = H - 70;
        for (const it of g.items) {
          it.y += it.vy * dt;
          it.rot += it.vr * dt;
          if (it.y > trayY - 14 && it.y < trayY + 14 && Math.abs(it.x - g.x) < TRAY_W / 2 + 8) {
            it.y = 9999; // consumed
            if (it.kind === "virus") {
              g.lives -= 1;
              g.hurt = now;
              burstSparks(g.sparks, it.x, trayY, "#ef4444", 22);
              g.pops.push({ x: it.x, y: trayY - 30, text: "-1 ♥", life: 1, c: "#f87171" });
            } else {
              const pts = it.kind === "gold" ? 5 : 1;
              g.score += pts;
              burstSparks(g.sparks, it.x, trayY, it.kind === "gold" ? "#ffc53d" : "#38d6ff", it.kind === "gold" ? 26 : 12);
              g.pops.push({ x: it.x, y: trayY - 30, text: `+${pts}`, life: 1, c: it.kind === "gold" ? "#ffc53d" : "#ffffff" });
            }
            setHud({ score: g.score, lives: g.lives, level });
          }
        }
        g.items = g.items.filter((it) => it.y < H + 40);
        if (g.lives <= 0) {
          g.playing = false;
          setNewBest(submit(g.score));
          setPhase("over");
        }
      }

      // draw items
      for (const it of g.items) drawItem(ctx, it, now);

      // sparks
      for (const p of g.sparks) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.15 * dt;
        p.life -= 0.025 * dt;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5 * p.life + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      g.sparks = g.sparks.filter((p) => p.life > 0);
      // score pops
      ctx.textAlign = "center";
      ctx.font = "bold 22px Sora, sans-serif";
      for (const p of g.pops) {
        p.y -= 1.2 * dt;
        p.life -= 0.02 * dt;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c;
        ctx.fillText(p.text, p.x, p.y);
      }
      g.pops = g.pops.filter((p) => p.life > 0);
      ctx.globalAlpha = 1;

      drawTray(ctx, g.x, H - 70, now - g.hurt < 300);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [submit]);

  return (
    <div className="mx-auto w-full max-w-md">
      <Hud
        items={[
          { label: "Score", value: hud.score, accent: true },
          { label: "Lives", value: <span className="text-red-400">{"♥".repeat(Math.max(0, hud.lives)) || "–"}</span> },
          { label: "Level", value: hud.level },
          { label: "Best", value: best ?? "–" },
        ]}
      />
      <div ref={wrapRef} className="relative aspect-[3/4] w-full touch-none select-none overflow-hidden rounded-[1.75rem] border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
        <canvas ref={canvasRef} className="h-full w-full" />
        {phase === "idle" && (
          <div className="absolute inset-0 grid place-items-center bg-navy-950/60 p-6 text-center backdrop-blur-sm">
            <div>
              <p className="text-6xl">💊</p>
              <p className="mt-4 font-display text-3xl font-bold">Catch the Capsule</p>
              <ul className="mx-auto mt-4 max-w-xs space-y-1.5 text-left text-sm text-white/75">
                <li>💊 Capsule = <b className="text-cyan">+1</b></li>
                <li>⭐ Golden 100 = <b className="text-gold">+5</b></li>
                <li>🦠 Virus = lose a life</li>
                <li>👆 Drag / move, or use ← → keys</li>
              </ul>
              <button onClick={start} className="btn-primary mt-6 px-8 py-3 font-display font-semibold">
                Start
              </button>
            </div>
          </div>
        )}
        <GameOver open={phase === "over"} title="Game over!" score={hud.score} best={best} isNewBest={newBest} onRestart={start} />
      </div>
    </div>
  );
}

function burstSparks(arr: Spark[], x: number, y: number, c: string, n: number) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = 1.5 + Math.random() * 3.5;
    arr.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, life: 1, c });
  }
}

function drawBg(ctx: CanvasRenderingContext2D, now: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#04112e");
  bg.addColorStop(1, "#0b2a6b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  // hex / molecule pattern drifting
  ctx.strokeStyle = "rgba(56,214,255,0.08)";
  ctx.lineWidth = 1;
  const off = (now / 60) % 52;
  for (let y = -52; y < H + 52; y += 52) {
    for (let x = 0; x < W + 60; x += 60) {
      const cx = x + ((y / 52) % 2 ? 30 : 0);
      const cy = y + off;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const px = cx + 16 * Math.cos(a), py = cy + 16 * Math.sin(a);
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
}

function drawItem(ctx: CanvasRenderingContext2D, it: Item, now: number) {
  ctx.save();
  ctx.translate(it.x, it.y);
  ctx.rotate(it.rot);
  if (it.kind === "capsule") {
    ctx.shadowColor = it.hue;
    ctx.shadowBlur = 14;
    ctx.fillStyle = it.hue;
    ctx.beginPath();
    ctx.roundRect(-22, -10, 24, 20, [10, 0, 0, 10]);
    ctx.fill();
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.roundRect(2, -10, 22, 20, [0, 10, 10, 0]);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillRect(-16, -6, 34, 3);
  } else if (it.kind === "gold") {
    const pulse = 1 + 0.08 * Math.sin(now / 120);
    ctx.scale(pulse, pulse);
    ctx.shadowColor = "#ffc53d";
    ctx.shadowBlur = 24;
    ctx.fillStyle = "#ffc53d";
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 10 : 22;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.rotate(-it.rot);
    ctx.fillStyle = "#04112e";
    ctx.font = "bold 10px Sora, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("100", 0, 1);
  } else {
    ctx.shadowColor = "#ef4444";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "#dc2626";
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI / 4) * i;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 17, Math.sin(a) * 17, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#7f1d1d";
    ctx.beginPath();
    ctx.arc(-4, -3, 3, 0, Math.PI * 2);
    ctx.arc(5, 4, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawTray(ctx: CanvasRenderingContext2D, x: number, y: number, hurt: boolean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = hurt ? "#ef4444" : "#38d6ff";
  ctx.shadowBlur = 25;
  const g = ctx.createLinearGradient(0, -10, 0, 20);
  g.addColorStop(0, hurt ? "#f87171" : "#38d6ff");
  g.addColorStop(1, hurt ? "#7f1d1d" : "#064da1");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-TRAY_W / 2, -8);
  ctx.lineTo(TRAY_W / 2, -8);
  ctx.lineTo(TRAY_W / 2 - 12, 18);
  ctx.lineTo(-TRAY_W / 2 + 12, 18);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#fff";
  ctx.font = "bold 11px Sora, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("RENATA", 0, 5);
  ctx.restore();
}
