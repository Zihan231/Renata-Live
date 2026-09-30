import Image from "next/image";
import Link from "next/link";
import { PRODUCTS, STATS } from "@/lib/products";
import { GameIcon, QuizIcon } from "./Icons";

export default function LiveSidebar() {
  return (
    <aside className="space-y-4">
      <div className="glass rounded-3xl p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan">During the break</p>
        <div className="mt-4 space-y-3">
          <Link href="/quiz" className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-cyan/50 hover:bg-cyan/10">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-cyan to-electric">
              <QuizIcon className="h-7 w-7" />
            </span>
            <span className="flex-1">
              <span className="block font-display font-semibold">100+ BE Quiz</span>
              <span className="text-xs text-white/55">6 questions · beat the clock</span>
            </span>
            <span className="text-cyan transition group-hover:translate-x-1">→</span>
          </Link>
          <Link href="/games/cricket" className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-gold/50 hover:bg-gold/10">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-gold to-orange-500">
              <GameIcon className="h-7 w-7" />
            </span>
            <span className="flex-1">
              <span className="block font-display font-semibold">Super Sixes</span>
              <span className="text-xs text-white/55">Your turn to bat</span>
            </span>
            <span className="text-gold transition group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>

      <div className="glass rounded-3xl p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan">Renata at a glance</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/5 py-3">
              <p className="font-display text-2xl font-extrabold text-chrome">
                {s.value}
                {s.suffix}
              </p>
              <p className="px-1 text-[10px] leading-tight text-white/55">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white p-4">
        <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Brought to you by</p>
        <Image src="/brand/renata-logo.png" alt="Renata PLC" width={573} height={115} className="mx-auto h-9 w-auto" />
        <div className="mt-4 grid grid-cols-3 gap-3">
          {PRODUCTS.filter((p) => p.logo).map((p) => (
            <Image key={p.slug} src={p.logo!} alt={p.brand} width={480} height={160} className="h-8 w-full object-contain" />
          ))}
        </div>
      </div>
    </aside>
  );
}
