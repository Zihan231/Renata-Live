import Header from "@/components/Header";
import PageTitle from "@/components/PageTitle";
import MemoryGame from "@/components/games/MemoryGame";
import { requireViewer } from "@/lib/session";

export const metadata = { title: "Brand Match — Renata Live" };

export default async function Page() {
  const viewer = await requireViewer();
  return (
    <>
      <Header name={viewer.name} />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6">
        <PageTitle back="/games" eyebrow="🧩 Memory" title="Brand Match" subtitle="Match the pairs of Renata bioequivalent brands." />
        <MemoryGame />
      </main>
    </>
  );
}
