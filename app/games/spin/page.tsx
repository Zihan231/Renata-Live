import Header from "@/components/Header";
import PageTitle from "@/components/PageTitle";
import SpinWheel from "@/components/games/SpinWheel";
import { requireViewer } from "@/lib/session";

export const metadata = { title: "Spin the Wheel — Renata Live" };

export default async function Page() {
  const viewer = await requireViewer();
  return (
    <>
      <Header name={viewer.name} />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6">
        <PageTitle back="/games" eyebrow="🎡 Daily" title="Spin the Wheel" subtitle="Three spins a day — land on facts, tips and cricket fun." />
        <SpinWheel />
      </main>
    </>
  );
}
