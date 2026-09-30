"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

export default function GameOver({
  open,
  title,
  score,
  scoreLabel = "Score",
  best,
  isNewBest,
  onRestart,
}: {
  open: boolean;
  title: string;
  score: React.ReactNode;
  scoreLabel?: string;
  best: number | null;
  isNewBest?: boolean;
  onRestart: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 grid place-items-center rounded-[inherit] bg-navy-950/75 p-6 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="glass ring-gradient w-full max-w-xs rounded-3xl p-7 text-center"
          >
            <p className="font-display text-2xl font-bold">{title}</p>
            <p className="mt-5 text-xs uppercase tracking-[0.25em] text-white/50">{scoreLabel}</p>
            <p className="font-display text-6xl font-extrabold text-electric">{score}</p>
            {isNewBest ? (
              <motion.p initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} className="mt-2 font-semibold text-gold">
                ★ New personal best!
              </motion.p>
            ) : (
              best !== null && <p className="mt-2 text-sm text-white/60">Best: {best}</p>
            )}
            <button onClick={onRestart} className="btn-primary mt-6 w-full py-3.5 font-display font-semibold">
              Play again
            </button>
            <Link href="/games" className="mt-3 block text-sm text-white/60 hover:text-white">
              More games
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
