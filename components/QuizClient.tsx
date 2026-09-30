"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QUIZ, SECONDS_PER_QUESTION } from "@/lib/quiz";
import { celebrate } from "@/lib/confetti";
import { QuizIcon } from "./Icons";

type Phase = "intro" | "playing" | "result";
const LETTERS = ["A", "B", "C", "D"];

export default function QuizClient({ name }: { name: string }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);

  const q = QUIZ[idx];
  const locked = picked !== null;

  const start = () => {
    setIdx(0);
    setAnswers([]);
    setPicked(null);
    setTimeLeft(SECONDS_PER_QUESTION);
    setPhase("playing");
  };

  const choose = useCallback(
    (i: number) => {
      if (locked) return;
      setPicked(i);
      const next = [...answers, i];
      setAnswers(next);
      setTimeout(() => {
        if (idx + 1 < QUIZ.length) {
          setIdx(idx + 1);
          setPicked(null);
          setTimeLeft(SECONDS_PER_QUESTION);
        } else {
          setPhase("result");
          fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers: next }) }).catch(() => {});
        }
      }, 1400);
    },
    [answers, idx, locked],
  );

  // countdown; -1 marks a timed-out question
  useEffect(() => {
    if (phase !== "playing" || locked) return;
    if (timeLeft <= 0) {
      choose(-1);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, locked, timeLeft, choose]);

  // keyboard: A-D or 1-4
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();
      const i = LETTERS.indexOf(k) >= 0 ? LETTERS.indexOf(k) : ["1", "2", "3", "4"].indexOf(k);
      if (i >= 0 && i < q.options.length) choose(i);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, q, choose]);

  const score = answers.reduce((s, a, i) => s + (a === QUIZ[i].answer ? 1 : 0), 0);

  useEffect(() => {
    if (phase === "result" && score >= Math.ceil(QUIZ.length * 0.66)) celebrate();
  }, [phase, score]);

  return (
    <AnimatePresence mode="wait">
      {phase === "intro" && (
        <motion.section key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass ring-gradient rounded-[2rem] p-8 text-center sm:p-12">
          <Link href="/home" className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
            ← Back
          </Link>
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
            className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-cyan to-electric shadow-[0_20px_50px_-10px_rgba(56,214,255,0.7)]"
          >
            <QuizIcon className="h-12 w-12" />
          </motion.div>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Renata 100+ BE Quiz</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">
            Ready, <span className="text-electric">{name.split(" ")[0]}</span>?
          </h1>
          <p className="mx-auto mt-4 max-w-md text-white/65">Test what you know about bioequivalence and Renata&apos;s bioequivalent brands.</p>
          <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-3">
            {[
              [QUIZ.length, "Questions"],
              [`${SECONDS_PER_QUESTION}s`, "Per question"],
              ["A–D", "Keys work"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-2xl border border-white/10 bg-white/5 py-4">
                <p className="font-display text-2xl font-bold">{v}</p>
                <p className="text-[11px] uppercase tracking-wider text-white/50">{l}</p>
              </div>
            ))}
          </div>
          <button onClick={start} className="btn-primary mt-10 px-10 py-4 font-display text-lg font-semibold">
            Start Quiz →
          </button>
        </motion.section>
      )}

      {phase === "playing" && (
        <motion.section key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {/* progress */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex flex-1 gap-1.5">
              {QUIZ.map((_, i) => (
                <div key={i} className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className={`h-full rounded-full ${
                      i < answers.length ? (answers[i] === QUIZ[i].answer ? "bg-emerald-400" : "bg-red-400") : "bg-gradient-to-r from-cyan to-electric"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: i < answers.length || i === idx ? "100%" : 0 }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              ))}
            </div>
            <Timer left={timeLeft} total={SECONDS_PER_QUESTION} paused={locked} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={idx} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.35 }}>
              <div className="glass ring-gradient rounded-[2rem] p-6 sm:p-9">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
                  Question {idx + 1} / {QUIZ.length}
                </p>
                <h2 className="mt-3 font-display text-xl font-bold leading-snug sm:text-2xl">{q.q}</h2>
              </div>

              <div className="mt-5 grid gap-3">
                {q.options.map((opt, i) => {
                  const isCorrect = i === q.answer;
                  const isPicked = i === picked;
                  const state = !locked ? "idle" : isCorrect ? "correct" : isPicked ? "wrong" : "dim";
                  return (
                    <motion.button
                      key={i}
                      onClick={() => choose(i)}
                      disabled={locked}
                      initial={{ opacity: 0, y: 16 }}
                      animate={
                        state === "wrong"
                          ? { opacity: 1, y: 0, x: [0, -10, 10, -6, 6, 0] }
                          : state === "correct"
                            ? { opacity: 1, y: 0, scale: [1, 1.03, 1] }
                            : { opacity: state === "dim" ? 0.45 : 1, y: 0 }
                      }
                      transition={{ delay: locked ? 0 : 0.08 * i, duration: locked ? 0.45 : 0.3 }}
                      whileHover={!locked ? { x: 6 } : undefined}
                      className={`group flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-colors sm:px-5 ${
                        state === "correct"
                          ? "border-emerald-400/70 bg-emerald-500/15 shadow-[0_0_30px_-5px_rgba(52,211,153,0.6)]"
                          : state === "wrong"
                            ? "border-red-400/70 bg-red-500/15"
                            : "border-white/10 bg-white/[0.04] hover:border-cyan/50 hover:bg-cyan/10"
                      }`}
                    >
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display font-bold ${
                          state === "correct" ? "bg-emerald-400 text-navy-950" : state === "wrong" ? "bg-red-400 text-navy-950" : "bg-white/10 group-hover:bg-cyan group-hover:text-navy-950"
                        }`}
                      >
                        {state === "correct" ? "✓" : state === "wrong" ? "✕" : LETTERS[i]}
                      </span>
                      <span className="text-[15px] sm:text-base">{opt}</span>
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {locked && (
                  <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 text-center font-display font-semibold">
                    {picked === q.answer ? (
                      <span className="text-emerald-300">Correct! 🎉</span>
                    ) : picked === -1 ? (
                      <span className="text-amber-300">Time&apos;s up! ⏰</span>
                    ) : (
                      <span className="text-red-300">Not quite — the right answer is highlighted.</span>
                    )}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </motion.section>
      )}

      {phase === "result" && <Result key="result" score={score} answers={answers} onRetry={start} />}
    </AnimatePresence>
  );
}

function Timer({ left, total, paused }: { left: number; total: number; paused: boolean }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const urgent = left <= 5 && !paused;
  return (
    <div className={`relative grid h-14 w-14 place-items-center ${urgent ? "animate-pulse" : ""}`}>
      <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90">
        <circle cx="24" cy="24" r={r} stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
        <motion.circle
          cx="24"
          cy="24"
          r={r}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          stroke={urgent ? "#f87171" : "#38d6ff"}
          strokeDasharray={c}
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: c * (1 - left / total) }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </svg>
      <span className={`font-display text-lg font-bold tabular-nums ${urgent ? "text-red-300" : ""}`}>{left}</span>
    </div>
  );
}

function Result({ score, answers, onRetry }: { score: number; answers: number[]; onRetry: () => void }) {
  const pct = score / QUIZ.length;
  const r = 70;
  const c = 2 * Math.PI * r;
  const headline = pct === 1 ? "Perfect score! 🏆" : pct >= 0.66 ? "Brilliant work! 🌟" : pct >= 0.33 ? "Good effort! 💪" : "Keep learning! 📚";

  return (
    <motion.section initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass ring-gradient rounded-[2rem] p-7 text-center sm:p-12">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Your result</p>
      <div className="relative mx-auto mt-6 h-44 w-44">
        <svg viewBox="0 0 160 160" className="-rotate-90">
          <defs>
            <linearGradient id="scoreGrad" x1="0" x2="1">
              <stop offset="0%" stopColor="#38d6ff" />
              <stop offset="100%" stopColor="#1f6bff" />
            </linearGradient>
          </defs>
          <circle cx="80" cy="80" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" />
          <motion.circle
            cx="80"
            cy="80"
            r={r}
            stroke="url(#scoreGrad)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - pct) }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <p className="font-display text-5xl font-extrabold">
            {score}
            <span className="text-2xl text-white/50">/{QUIZ.length}</span>
          </p>
        </div>
      </div>
      <h2 className="mt-6 font-display text-3xl font-bold">{headline}</h2>

      <ol className="mx-auto mt-8 max-w-xl space-y-2 text-left">
        {QUIZ.map((q, i) => {
          const ok = answers[i] === q.answer;
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
              className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 text-sm"
            >
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${ok ? "bg-emerald-400 text-navy-950" : "bg-red-400 text-navy-950"}`}>
                {ok ? "✓" : "✕"}
              </span>
              <span>
                <span className="text-white/80">{q.q}</span>
                <span className="mt-1 block font-semibold text-cyan">{q.options[q.answer]}</span>
              </span>
            </motion.li>
          );
        })}
      </ol>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <button onClick={onRetry} className="btn-primary px-8 py-3.5 font-display font-semibold">
          Play again
        </button>
        <Link href="/games" className="rounded-full border border-white/15 bg-white/5 px-8 py-3.5 font-display font-semibold hover:bg-white/10">
          Game Zone
        </Link>
        <Link href="/live" className="rounded-full border border-red-400/40 bg-red-500/10 px-8 py-3.5 font-display font-semibold hover:bg-red-500/20">
          ● Watch Live
        </Link>
      </div>
    </motion.section>
  );
}
