"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";

const NAV = [
  { href: "/home", label: "Home" },
  { href: "/quiz", label: "Quiz" },
  { href: "/games", label: "Games" },
  { href: "/live", label: "Live" },
];

export default function Header({ name }: { name?: string }) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  // Hide while scrolling down, reveal on scroll up or near the top.
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (y < 80) setHidden(false);
    else if (y > prev + 4) setHidden(true);
    else if (y < prev - 4) setHidden(false);
  });

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b border-white/5 bg-navy-950/40 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={name ? "/home" : "/"} className="shrink-0" aria-label="Renata PLC home">
          <Image src="/brand/renata-logo-white.png" alt="Renata PLC" width={573} height={115} priority className="h-7 w-auto sm:h-8" />
        </Link>
        {name && (
          <>
            <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 md:flex">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-full px-4 py-1.5 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  {n.label === "Live" ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                      {n.label}
                    </span>
                  ) : (
                    n.label
                  )}
                </Link>
              ))}
            </nav>
            <form action="/api/logout" method="post" className="flex items-center gap-3">
              <span className="hidden text-sm text-white/70 sm:inline">
                Hi, <span className="font-semibold text-white">{name.split(" ")[0]}</span>
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-cyan to-electric font-display text-sm font-bold uppercase shadow-lg shadow-electric/40">
                {name.charAt(0)}
              </span>
              <button className="text-xs text-white/50 underline-offset-4 hover:text-white hover:underline" title="Sign out">
                Not you?
              </button>
            </form>
          </>
        )}
      </div>
      {name && (
        <nav className="flex justify-around border-t border-white/5 px-2 py-1.5 md:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-full px-3 py-1 text-xs font-medium text-white/75 active:bg-white/10">
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </motion.header>
  );
}
