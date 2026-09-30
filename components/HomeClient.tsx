"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import CountUp from "./CountUp";
import SpotlightCard from "./SpotlightCard";
import { ArrowIcon, CricketIcon, GameIcon, QuizIcon } from "./Icons";
import { GamesArt, LiveArt, QuizArt } from "./CardArt";
import { PRODUCTS, STATS } from "@/lib/products";

const rise = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } }),
};

export default function HomeClient({ name }: { name: string }) {
  const first = name.split(" ")[0];

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <Hero first={first} />
      <Stats />
      <Experiences />
      <Portfolio />
      <footer className="mt-24 flex flex-col items-center gap-3 border-t border-white/10 pt-10 text-center">
        <p className="font-display text-lg font-semibold tracking-[0.3em] text-chrome uppercase">Young Minds, Global Impact</p>
        <p className="text-xs text-white/40">© {new Date().getFullYear()} Renata PLC. All rights reserved.</p>
      </footer>
    </main>
  );
}

function Hero({ first }: { first: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotY = useSpring(useTransform(x, [-1, 1], [-10, 10]), { stiffness: 120, damping: 15 });
  const rotX = useSpring(useTransform(y, [-1, 1], [8, -8]), { stiffness: 120, damping: 15 });

  return (
    <section
      className="grid items-center gap-8 pt-10 sm:pt-14 lg:grid-cols-[1fr_1.2fr] lg:gap-4"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(((e.clientX - r.left) / r.width) * 2 - 1);
        y.set(((e.clientY - r.top) / r.height) * 2 - 1);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <motion.div initial="hidden" animate="show" className="order-2 text-center lg:order-1 lg:text-left">
        <motion.p variants={rise} custom={0} className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan">
          Welcome aboard
        </motion.p>
        <motion.h1 variants={rise} custom={1} className="font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">
          Hello, <span className="text-electric">{first}</span>!
          <br />
          <span className="text-chrome">Celebrate 100+</span>
          <br />
          <span className="text-chrome">bioequivalent products.</span>
        </motion.h1>
        <motion.p variants={rise} custom={2} className="mx-auto mt-5 max-w-lg text-white/70 sm:text-lg lg:mx-0">
          Renata&apos;s young scientists have developed over 100 bioequivalent products — reaching 69 global destinations and 22 regulated markets. Test
          your knowledge, play, and catch the Cricket World Cup live.
        </motion.p>
        <motion.div variants={rise} custom={3} className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
          <Link href="/quiz" className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 font-display font-semibold">
            Take the Quiz <ArrowIcon className="h-5 w-5" />
          </Link>
          <Link
            href="/live"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 font-display font-semibold transition hover:border-red-400/60 hover:bg-red-500/10"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 rounded-full bg-red-500 animate-pulse-ring" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            Watch Live
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative order-1 lg:order-2"
        style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1200 }}
      >
        <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric/45 blur-[100px]" />
        <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan/25 animate-spin-slow" />
        <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[66%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 animate-spin-rev">
          <span className="absolute -top-1.5 left-1/2 h-3 w-3 rounded-full bg-cyan shadow-[0_0_20px_4px_#38d6ff]" />
          <span className="absolute -bottom-1 left-1/4 h-2 w-2 rounded-full bg-gold shadow-[0_0_16px_3px_#ffc53d]" />
        </div>
        <Image
          src="/brand/hero-100.webp"
          alt="100 Bioequivalent Products — Young Minds, Global Impact"
          width={1689}
          height={1107}
          priority
          className="w-full animate-float drop-shadow-[0_40px_60px_rgba(31,107,255,0.5)]"
        />
      </motion.div>
    </section>
  );
}

function Stats() {
  return (
    <section className="mt-12 grid grid-cols-3 gap-3 sm:gap-5">
      {STATS.map((s, i) => (
        <motion.div
          key={s.label}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={rise}
          custom={i}
          className="glass relative overflow-hidden rounded-3xl px-3 py-6 text-center sm:px-6 sm:py-8"
        >
          <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />
          <p className="font-display text-3xl font-extrabold text-chrome sm:text-6xl">
            <CountUp to={s.value} suffix={s.suffix} />
          </p>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.15em] text-white/60 sm:text-sm">{s.label}</p>
        </motion.div>
      ))}
    </section>
  );
}

const EXPERIENCES = [
  {
    href: "/quiz",
    title: "100+ BE Quiz",
    text: "6 quick questions on bioequivalence and Renata's portfolio. Beat the clock!",
    cta: "Start quiz",
    Icon: QuizIcon,
    Art: QuizArt,
    badge: "6 Questions",
  },
  {
    href: "/games",
    title: "Game Zone",
    text: "Cricket batting, memory match, spin the wheel and catch the capsule.",
    cta: "Play now",
    Icon: GameIcon,
    Art: GamesArt,
    badge: "4 Games",
  },
  {
    href: "/live",
    title: "Cricket World Cup",
    text: "Watch every ball live, brought to you by Renata PLC.",
    cta: "Watch live",
    Icon: CricketIcon,
    Art: LiveArt,
    badge: "LIVE",
  },
];

function Experiences() {
  return (
    <section className="mt-20">
      <SectionHead eyebrow="Your experience" title="Pick your adventure" />
      <div className="grid gap-5 md:grid-cols-3">
        {EXPERIENCES.map((x, i) => (
          <motion.div key={x.href} initial="hidden" whileInView="show" viewport={{ once: true }} variants={rise} custom={i}>
            <SpotlightCard href={x.href} glow="rgba(56,214,255,0.22)">
              <div className="flex h-full flex-col">
                <div className="relative h-48 overflow-hidden rounded-t-[1.75rem]">
                  <x.Art />
                  <div aria-hidden className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0c2356] to-transparent" />
                  <span
                    className={`absolute right-4 top-4 rounded-full border px-3 py-1 text-[11px] font-bold tracking-widest backdrop-blur-sm ${
                      x.badge === "LIVE" ? "border-red-400/60 bg-red-600/80 text-white" : "border-white/25 bg-navy-950/50 text-white/90"
                    }`}
                  >
                    {x.badge === "LIVE" ? "● LIVE" : x.badge}
                  </span>
                </div>
                <div className="relative flex flex-1 flex-col px-7 pb-7">
                  <div className="-mt-8 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-cyan via-electric to-renata text-white shadow-[0_12px_30px_-6px_rgba(31,107,255,0.8)] ring-4 ring-[#0c2356] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                    <x.Icon className="h-9 w-9" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold text-chrome">{x.title}</h3>
                  <p className="mt-2 flex-1 text-white/65">{x.text}</p>
                  <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-cyan/40 bg-cyan/10 px-5 py-2.5 text-sm font-semibold text-cyan transition group-hover:border-cyan group-hover:bg-cyan group-hover:text-navy-950">
                    {x.cta} <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Portfolio() {
  const logos = PRODUCTS.filter((p) => p.logo);
  return (
    <section className="mt-24">
      <SectionHead eyebrow="Bioequivalent portfolio" title="Brands built by young minds" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PRODUCTS.map((p, i) => (
          <motion.article
            key={p.slug}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={rise}
            custom={i % 4}
            whileHover={{ y: -8 }}
            className="group relative overflow-hidden rounded-3xl bg-white p-1 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]"
          >
            <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-[1.3rem] bg-gradient-to-br from-white to-slate-100 px-6">
              <div aria-hidden className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-15 blur-2xl transition-opacity group-hover:opacity-35" style={{ background: p.color }} />
              {p.logo ? (
                <Image src={p.logo} alt={`${p.brand} (${p.generic})`} width={480} height={160} className="relative max-h-24 w-auto object-contain transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="relative text-center">
                  <p className="font-display text-4xl font-extrabold" style={{ color: p.color }}>
                    {p.brand}
                  </p>
                  <p className="text-sm text-slate-700">{p.generic}</p>
                </div>
              )}
              {p.status === "upcoming" && (
                <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-electric to-cyan px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                  Coming soon
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-display font-bold text-slate-900">{p.brand}</p>
                <p className="truncate text-xs text-slate-500">{p.generic}</p>
              </div>
              <span
                className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold"
                style={{ color: p.color, borderColor: `${p.color}55`, background: `${p.color}14` }}
              >
                <span aria-hidden>{p.status === "upcoming" ? "◷" : "✓"}</span>
                {p.tag}
              </span>
            </div>
          </motion.article>
        ))}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={rise}
          custom={3}
          className="glass ring-gradient flex flex-col items-center justify-center rounded-3xl p-6 text-center"
        >
          <p className="font-display text-5xl font-extrabold text-electric">100+</p>
          <p className="mt-2 text-sm text-white/70">bioequivalent products and counting</p>
        </motion.div>
      </div>

      {/* logo marquee */}
      <div className="relative mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white py-5">
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
        <div className="flex w-max animate-marquee items-center gap-16 pr-16">
          {[...logos, ...logos, ...logos, ...logos].map((p, i) => (
            <Image key={i} src={p.logo!} alt="" aria-hidden width={480} height={160} className="h-10 w-auto object-contain" />
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={rise} className="mb-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{title}</h2>
    </motion.div>
  );
}
