import type { Metadata, Viewport } from "next";
import { Sora, Plus_Jakarta_Sans } from "next/font/google";
import Background from "@/components/Background";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", weight: ["400", "600", "700", "800"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "Renata Live — 100+ Bioequivalent Products",
  description: "Celebrate Renata's 100+ bioequivalent products. Take the quiz, play games and watch the Cricket World Cup live.",
};

export const viewport: Viewport = { themeColor: "#0b2a6b" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${jakarta.variable}`}>
      <body className="antialiased">
        <Background />
        {children}
      </body>
    </html>
  );
}
