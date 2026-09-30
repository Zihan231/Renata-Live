import Header from "@/components/Header";
import QuizClient from "@/components/QuizClient";
import { requireViewer } from "@/lib/session";

export default async function QuizPage() {
  const viewer = await requireViewer();
  return (
    <>
      <Header name={viewer.name} />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6">
        <QuizClient name={viewer.name} />
      </main>
    </>
  );
}
