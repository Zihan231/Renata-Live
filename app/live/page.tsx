import Header from "@/components/Header";
import PageTitle from "@/components/PageTitle";
import LivePlayer from "@/components/LivePlayer";
import LiveSidebar from "@/components/LiveSidebar";
import { requireViewer } from "@/lib/session";
import { getChannels } from "@/lib/channels";

export const metadata = { title: "Watch Live — Renata Live" };

export default async function LivePage() {
  const viewer = await requireViewer();
  const { channels, isTest } = getChannels();
  const title = process.env.STREAM_TITLE?.trim() || "ICC Cricket World Cup — Live";

  return (
    <>
      <Header name={viewer.name} />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
        <PageTitle eyebrow="● Live now" title={<>Cricket World Cup <span className="text-electric">Live</span></>} subtitle="Every ball, every boundary — brought to you by Renata PLC." />
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <LivePlayer channels={channels} title={title} isTest={isTest} />
          <LiveSidebar />
        </div>
      </main>
    </>
  );
}
