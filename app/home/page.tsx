import Header from "@/components/Header";
import HomeClient from "@/components/HomeClient";
import { requireViewer } from "@/lib/session";

export default async function HomePage() {
  const viewer = await requireViewer();
  return (
    <>
      <Header name={viewer.name} />
      <HomeClient name={viewer.name} />
    </>
  );
}
