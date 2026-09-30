import Header from "@/components/Header";
import PageTitle from "@/components/PageTitle";
import CricketGame from "@/components/games/CricketGame";
import { requireViewer } from "@/lib/session";

export const metadata = { title: "Super Sixes — Renata Live" };

export default async function Page() {
  const viewer = await requireViewer();
  return (
    <>
      <Header name={viewer.name} />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
        <PageTitle back="/games" eyebrow="🏏 Cricket" title="Super Sixes" subtitle="Time your shot. Tap or press Space when the ball hits the gold zone." />
        <CricketGame />
      </main>
    </>
  );
}
