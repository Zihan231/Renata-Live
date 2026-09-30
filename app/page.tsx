import Image from "next/image";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import RegisterForm from "@/components/RegisterForm";
import { getViewer } from "@/lib/session";

const PERKS = [
  { icon: "🧠", label: "100+ BE Quiz" },
  { icon: "🎮", label: "4 Mini Games" },
  { icon: "🏏", label: "Cricket World Cup Live" },
];

export default async function Landing() {
  if (await getViewer()) redirect("/home");

  return (
    <>
      <Header />
      <main className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <section className="relative text-center lg:text-left">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" />
            Young Minds, Global Impact
          </p>

          <div className="relative mx-auto max-w-2xl">
            {/* glow + orbit rings behind the emblem */}
            <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric/40 blur-[90px]" />
            <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan/25 animate-spin-slow" />
            <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 animate-spin-rev">
              <span className="absolute -top-1.5 left-1/2 h-3 w-3 rounded-full bg-cyan shadow-[0_0_20px_4px_#38d6ff]" />
            </div>
            <Image
              src="/brand/hero-100.webp"
              alt="Renata's young scientists have developed 100 bioequivalent products — Young Minds, Global Impact"
              width={1689}
              height={1107}
              priority
              className="w-full animate-float drop-shadow-[0_30px_60px_rgba(31,107,255,0.45)]"
            />
          </div>

          <ul className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3 lg:justify-start">
            {PERKS.map((p) => (
              <li key={p.label} className="glass rounded-full px-4 py-2 text-sm font-medium text-white/90">
                <span className="mr-1.5">{p.icon}</span>
                {p.label}
              </li>
            ))}
          </ul>
        </section>

        <section className="w-full">
          <RegisterForm />
        </section>
      </main>
    </>
  );
}
