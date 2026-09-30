"use client";

import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

/** Link card with a cursor-following glow and a gentle 3D tilt. */
export default function SpotlightCard({
  href,
  glow,
  className = "",
  children,
}: {
  href: string;
  glow: string;
  className?: string;
  children: React.ReactNode;
}) {
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const rx = useSpring(0, { stiffness: 200, damping: 20 });
  const ry = useSpring(0, { stiffness: 200, damping: 20 });
  const bg = useMotionTemplate`radial-gradient(420px circle at ${mx}% ${my}%, ${glow}, transparent 60%)`;

  function onMove(e: React.PointerEvent<HTMLAnchorElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 100;
    const py = ((e.clientY - r.top) / r.height) * 100;
    mx.set(px);
    my.set(py);
    ry.set((px - 50) / 8);
    rx.set(-(py - 50) / 8);
  }

  return (
    <motion.div style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }} whileTap={{ scale: 0.98 }} className="h-full">
      <Link
        href={href}
        onPointerMove={onMove}
        onPointerLeave={() => {
          rx.set(0);
          ry.set(0);
        }}
        className={`glass ring-gradient group relative block h-full overflow-hidden rounded-[1.75rem] transition-shadow duration-300 hover:shadow-[0_30px_80px_-20px_rgba(31,107,255,0.6)] ${className}`}
      >
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: bg }} />
        <div className="relative h-full">{children}</div>
      </Link>
    </motion.div>
  );
}
