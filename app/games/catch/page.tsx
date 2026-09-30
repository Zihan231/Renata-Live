import Header from "@/components/Header";
import PageTitle from "@/components/PageTitle";
import CatchGame from "@/components/games/CatchGame";
import { requireViewer } from "@/lib/session";

export const metadata = { title: "Catch the Capsule — Renata Live" };

export default async function Page() {
  const viewer = await requireViewer();
  return (
    <>
      <Header name={viewer.name} />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6">
        <PageTitle back="/games" eyebrow="💊 Arcade" title="Catch the Capsule" subtitle="Catch Renata capsules, grab golden 100s, dodge the viruses." />
        <CatchGame />
      </main>
    </>
  );
}
