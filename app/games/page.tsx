import Header from "@/components/Header";
import PageTitle from "@/components/PageTitle";
import SpotlightCard from "@/components/SpotlightCard";
import { requireViewer } from "@/lib/session";

const GAMES = [
  {
    href: "/games/cricket",
    title: "Super Sixes",
    text: "Time your shot and smash the ball out of the stadium. 2 overs, 3 wickets.",
    emoji: "🏏",
    tag: "Timing",
    gradient: "from-emerald-500 via-green-600 to-emerald-900",
    glow: "rgba(52,211,153,0.25)",
  },
  {
    href: "/games/catch",
    title: "Catch the Capsule",
    text: "Catch Renata capsules, grab the golden 100s and dodge the viruses.",
    emoji: "💊",
    tag: "Arcade",
    gradient: "from-cyan via-electric to-renata",
    glow: "rgba(56,214,255,0.25)",
  },
  {
    href: "/games/memory",
    title: "Brand Match",
    text: "Flip the cards and pair up Renata's bioequivalent brands in as few moves as possible.",
    emoji: "🧩",
    tag: "Memory",
    gradient: "from-fuchsia-500 via-purple-600 to-indigo-800",
    glow: "rgba(192,132,252,0.25)",
  },
  {
    href: "/games/spin",
    title: "Spin the Wheel",
    text: "Three spins a day. Land on facts, tips and cricket fun.",
    emoji: "🎡",
    tag: "Daily",
    gradient: "from-gold via-orange-500 to-rose-600",
    glow: "rgba(255,197,61,0.25)",
  },
];

export default async function GamesPage() {
  const viewer = await requireViewer();
  return (
    <>
      <Header name={viewer.name} />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6">
        <PageTitle eyebrow="Game Zone" title={<>Play. Score. <span className="text-electric">Repeat.</span></>} subtitle="Four quick games inspired by Renata and the Cricket World Cup. Your best scores are saved on this device." />
        <div className="grid gap-5 sm:grid-cols-2">
          {GAMES.map((g) => (
            <SpotlightCard key={g.href} href={g.href} glow={g.glow}>
              <div className={`relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br ${g.gradient}`}>
                <div aria-hidden className="absolute inset-0 opacity-30 [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:18px_18px]" />
                <span className="relative text-7xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-125">{g.emoji}</span>
                <span className="absolute right-4 top-4 rounded-full bg-black/30 px-3 py-1 text-[11px] font-bold uppercase tracking-widest backdrop-blur">{g.tag}</span>
              </div>
              <div className="p-6">
                <h2 className="font-display text-2xl font-bold">{g.title}</h2>
                <p className="mt-2 text-white/65">{g.text}</p>
                <p className="mt-5 font-semibold text-cyan">Play →</p>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </main>
    </>
  );
}
