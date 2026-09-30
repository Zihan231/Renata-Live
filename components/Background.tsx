"use client";

import { useEffect, useRef } from "react";

/** Full-screen animated backdrop: glowing orbs, perspective grid and a drifting particle network. */
export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let w = 0, h = 0, raf = 0, last = -Infinity;
    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let pts: P[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(55, (w * h) / 26000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.4,
      }));
    };

    const draw = (now = 0) => {
      // ~30fps is plenty for a slow drift and halves the paint cost
      raf = requestAnimationFrame(draw);
      if (now - last < 33) return;
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 140) {
            ctx.strokeStyle = `rgba(56,214,255,${0.12 * (1 - d / 140)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = "rgba(170,220,255,0.8)";
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#0b2a6b_0%,#082260_35%,#061a45_70%,#071c4a_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(31,107,255,0.45),transparent_70%)]" />
      <div className="absolute -left-[20vmax] -top-[20vmax] h-[60vmax] w-[60vmax] rounded-full bg-electric/35 blur-[100px] animate-float will-change-transform" />
      <div className="absolute -right-[18vmax] top-[30%] h-[50vmax] w-[50vmax] rounded-full bg-cyan/20 blur-[100px] animate-float will-change-transform [animation-delay:-3s]" />
      <div className="absolute -bottom-[20vmax] left-[10%] h-[55vmax] w-[55vmax] rounded-full bg-renata/50 blur-[100px] animate-float will-change-transform [animation-delay:-1.5s]" />
      {/* perspective grid floor */}
      <div className="absolute inset-x-0 bottom-0 h-[45vh] opacity-40 [perspective:600px]">
        <div
          className="absolute inset-0 origin-bottom [transform:rotateX(62deg)]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(56,214,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(56,214,255,0.35) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "linear-gradient(to top, black 10%, transparent 90%)",
            WebkitMaskImage: "linear-gradient(to top, black 10%, transparent 90%)",
          }}
        />
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(2,8,23,0.35)_100%)]" />
    </div>
  );
}
