"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Hud from "./Hud";
import GameOver from "./GameOver";
import { useBest } from "@/lib/useBest";
import { celebrate } from "@/lib/confetti";
import { PRODUCTS } from "@/lib/products";

type Card = { id: number; slug: string; logo: string; brand: string };

const DECK = PRODUCTS.filter((p) => p.logo);

function shuffle(): Card[] {
  const cards = DECK.flatMap((p, i) => [0, 1].map((k) => ({ id: i * 2 + k, slug: p.slug, logo: p.logo!, brand: p.brand })));
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export default function MemoryGame() {
  const { best, submit } = useBest("memory", true);
  const [cards, setCards] = useState<Card[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [newBest, setNewBest] = useState(false);

  const reset = useCallback(() => {
    setCards(shuffle());
    setOpen([]);
    setMatched(new Set());
    setMoves(0);
    setSeconds(0);
    setStarted(false);
    setDone(false);
    setNewBest(false);
  }, []);

  useEffect(reset, [reset]);

  useEffect(() => {
    if (!started || done) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [started, done]);

  const flip = (idx: number) => {
    if (done || open.length === 2 || open.includes(idx) || matched.has(cards[idx].slug)) return;
    setStarted(true);
    const next = [...open, idx];
    setOpen(next);
    if (next.length < 2) return;

    const m = moves + 1;
    setMoves(m);
    const [a, b] = next.map((i) => cards[i]);
    if (a.slug === b.slug) {
      const nm = new Set(matched).add(a.slug);
      setTimeout(() => {
        setMatched(nm);
        setOpen([]);
        if (nm.size === DECK.length) {
          setDone(true);
          setNewBest(submit(m));
          celebrate();
        }
      }, 450);
    } else {
      setTimeout(() => setOpen([]), 900);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Hud
        items={[
          { label: "Moves", value: moves, accent: true },
          { label: "Pairs", value: `${matched.size}/${DECK.length}` },
          { label: "Time", value: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` },
          { label: "Best", value: best ?? "–" },
        ]}
      />
      <div className="glass relative rounded-[1.75rem] p-3 sm:p-5">
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-4">
          {cards.map((c, i) => {
            const faceUp = open.includes(i) || matched.has(c.slug);
            const isMatched = matched.has(c.slug);
            return (
              <motion.button
                key={c.id}
                onClick={() => flip(i)}
                initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.03, type: "spring", stiffness: 260, damping: 18 }}
                whileHover={!faceUp ? { y: -4 } : undefined}
                aria-label={faceUp ? c.brand : "Hidden card"}
                className="relative aspect-[4/5] [perspective:800px]"
              >
                <motion.div
                  className="absolute inset-0 [transform-style:preserve-3d]"
                  animate={{ rotateY: faceUp ? 180 : 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* back */}
                  <div className="absolute inset-0 grid place-items-center overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-electric via-renata to-navy-800 shadow-lg [backface-visibility:hidden]">
                    <div aria-hidden className="absolute inset-0 opacity-25 [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:12px_12px]" />
                    <div className="relative grid h-12 w-12 place-items-center rounded-xl border-2 border-white/80 font-display text-2xl font-extrabold sm:h-14 sm:w-14">R</div>
                  </div>
                  {/* front */}
                  <div
                    className={`absolute inset-0 grid place-items-center rounded-2xl bg-white p-3 [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                      isMatched ? "shadow-[0_0_0_3px_#34d399,0_0_30px_-4px_#34d399]" : "shadow-lg"
                    }`}
                  >
                    <Image src={c.logo} alt={c.brand} width={480} height={160} className="h-auto max-h-[70%] w-full object-contain" />
                  </div>
                </motion.div>
              </motion.button>
            );
          })}
        </div>
        <GameOver open={done} title="All matched! 🎉" score={moves} scoreLabel="Moves" best={best} isNewBest={newBest} onRestart={reset} />
      </div>
      <p className="mt-4 text-center text-sm text-white/50">Fewer moves = better score.</p>
    </div>
  );
}
