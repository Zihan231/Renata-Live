"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Channel } from "@/lib/channels";

type Source = { kind: "youtube"; id: string } | { kind: "hls"; url: string } | { kind: "iframe"; url: string } | { kind: "none" };

function parseSource(src: string): Source {
  if (!src) return { kind: "none" };
  const yt = src.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|live\/|shorts\/))([\w-]{11})/);
  if (yt) return { kind: "youtube", id: yt[1] };
  if (/^[\w-]{11}$/.test(src)) return { kind: "youtube", id: src };
  if (/\.m3u8(\?|$)/i.test(src)) return { kind: "hls", url: src };
  if (/^https?:\/\//i.test(src)) return { kind: "iframe", url: src };
  return { kind: "none" };
}

// A feed that hasn't delivered video by then, or stalls for this long mid-match, is treated as failed.
const LOAD_TIMEOUT_MS = 15_000;
const STALL_TIMEOUT_MS = 20_000;
const RETRY_ALL_MS = 20_000;

const REACTIONS = ["🏏", "🔥", "👏", "🇧🇩", "💙", "🎉"];

export default function LivePlayer({ channels, title, isTest }: { channels: Channel[]; title: string; isTest: boolean }) {
  const [active, setActive] = useState(0);
  const channel = channels[active];
  // Which of the channel's URLs is playing; bumps to the next one whenever a feed fails.
  const [feed, setFeed] = useState(0);
  // Once every feed has failed, wait and start over from the first (the round remounts the player).
  const [round, setRound] = useState(0);
  const exhausted = feed >= (channel?.urls.length ?? 0);
  const source = parseSource(exhausted ? "" : channel.urls[feed]);

  useEffect(() => {
    if (!exhausted || !channel?.urls.length) return;
    const t = setTimeout(() => {
      setFeed(0);
      setRound((r) => r + 1);
    }, RETRY_ALL_MS);
    return () => clearTimeout(t);
  }, [exhausted, channel]);

  const selectChannel = (i: number) => {
    setActive(i);
    setFeed(0);
  };
  const [floaters, setFloaters] = useState<{ id: number; e: string; x: number }[]>([]);

  const react = (e: string) => {
    const id = Math.random();
    setFloaters((f) => [...f.slice(-20), { id, e, x: 10 + Math.random() * 80 }]);
    setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 2200);
  };

  return (
    <section>
      {channels.length > 1 && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Channels">
          {channels.map((c, i) => (
            <button
              key={c.name}
              role="tab"
              aria-selected={i === active}
              onClick={() => selectChannel(i)}
              className={`relative shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                i === active ? "border-cyan/60 text-navy-950" : "border-white/15 bg-white/5 text-white/75 hover:bg-white/10"
              }`}
            >
              {i === active && <motion.span layoutId="channel-pill" className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan to-electric" />}
              <span className="relative">{c.name}</span>
            </button>
          ))}
        </div>
      )}
      <div className="glass ring-gradient relative overflow-hidden rounded-[1.75rem] p-2 sm:p-3">
        <div className="relative aspect-video overflow-hidden rounded-[1.25rem] bg-black">
          {source.kind === "youtube" && (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${source.id}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`}
              title={title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          )}
          {source.kind === "iframe" && (
            <iframe className="absolute inset-0 h-full w-full" src={source.url} title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
          )}
          {source.kind === "hls" && <HlsVideo key={`${round}:${feed}:${source.url}`} url={source.url} onFail={() => setFeed((f) => f + 1)} />}
          {source.kind === "none" && (exhausted && channel?.urls.length ? <Unavailable /> : <ComingSoon />)}

          {/* floating reactions */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <AnimatePresence>
              {floaters.map((f) => (
                <motion.span
                  key={f.id}
                  initial={{ y: 0, opacity: 1, scale: 0.6 }}
                  animate={{ y: -260, opacity: 0, scale: 1.4, x: [0, 12, -12, 0] }}
                  transition={{ duration: 2.2, ease: "easeOut" }}
                  className="absolute bottom-4 text-3xl"
                  style={{ left: `${f.x}%` }}
                >
                  {f.e}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          {/* Renata sponsor bug: sits in its own corner, clear of the player controls */}
          {source.kind !== "none" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="pointer-events-none absolute right-3 top-3 flex items-center gap-2 rounded-xl border border-white/20 bg-navy-950/60 px-3 py-1.5 backdrop-blur-sm"
            >
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/70">Presented by</span>
              <Image src="/brand/renata-logo-white.png" alt="Renata PLC" width={573} height={115} className="h-4 w-auto sm:h-5" />
            </motion.div>
          )}

          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold tracking-widest shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-white animate-pulse-ring" />
              <span className="relative h-2 w-2 rounded-full bg-white" />
            </span>
            LIVE
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1 pt-4">
          <div>
            <h2 className="font-display text-lg font-bold sm:text-xl">
              {title}
              {channels.length > 1 && <span className="text-white/50"> · {channel.name}</span>}
            </h2>
            {channel.urls.length > 1 && !exhausted && (
              <p className="text-xs text-white/50">
                Feed {feed + 1} of {channel.urls.length}
                {feed > 0 && " · switched to a backup feed"} ·{" "}
                <button onClick={() => setFeed((f) => (f + 1) % channel.urls.length)} className="font-semibold text-cyan hover:underline">
                  Try next feed
                </button>
              </p>
            )}
            {isTest && <p className="text-xs font-semibold text-gold">Test streams — set STREAM_URL or STREAM_CHANNELS for the real feed.</p>}
            <p className="text-xs text-white/50">Presented by Renata PLC · Young Minds, Global Impact</p>
          </div>
          <div className="flex gap-1.5">
            {REACTIONS.map((e) => (
              <motion.button
                key={e}
                whileTap={{ scale: 1.5 }}
                whileHover={{ y: -3 }}
                onClick={() => react(e)}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-lg hover:bg-white/10"
                aria-label={`React ${e}`}
              >
                {e}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HlsVideo({ url, onFail }: { url: string; onFail: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const onFailRef = useRef(onFail);
  onFailRef.current = onFail;

  useEffect(() => {
    const video = ref.current!;
    let destroy: (() => void) | undefined;
    let cancelled = false;
    let stallTimer: ReturnType<typeof setTimeout> | undefined;
    const fail = () => {
      if (cancelled) return;
      cancelled = true;
      onFailRef.current();
    };

    let loadTimer: ReturnType<typeof setTimeout> | undefined = setTimeout(fail, LOAD_TIMEOUT_MS);
    const onLoaded = () => {
      clearTimeout(loadTimer);
      loadTimer = undefined;
    };
    const onWaiting = () => {
      clearTimeout(stallTimer);
      stallTimer = setTimeout(fail, STALL_TIMEOUT_MS);
    };
    const onPlaying = () => clearTimeout(stallTimer);
    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("timeupdate", onPlaying);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.addEventListener("error", fail);
      video.src = url;
      video.play().catch(() => {});
    } else {
      import("hls.js").then(({ default: Hls }) => {
        if (cancelled) return;
        if (!Hls.isSupported()) return fail();
        const hls = new Hls({ lowLatencyMode: true });
        let recoveredMedia = false;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
        hls.on(Hls.Events.ERROR, (_, d) => {
          if (!d.fatal) return;
          // A decode hiccup is usually recoverable in place; anything else means this feed is gone.
          if (d.type === Hls.ErrorTypes.MEDIA_ERROR && !recoveredMedia) {
            recoveredMedia = true;
            hls.recoverMediaError();
          } else fail();
        });
        destroy = () => hls.destroy();
      });
    }
    return () => {
      cancelled = true;
      clearTimeout(loadTimer);
      clearTimeout(stallTimer);
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("timeupdate", onPlaying);
      video.removeEventListener("error", fail);
      destroy?.();
      video.removeAttribute("src");
      video.load();
    };
  }, [url]);

  return <video ref={ref} className="absolute inset-0 h-full w-full" controls autoPlay muted playsInline />;
}

function Unavailable() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-black/80 p-6 text-center text-white/70">
      <div>
        <p>The stream is unavailable right now.</p>
        <p className="mt-1 text-xs text-white/50">Retrying all feeds automatically…</p>
      </div>
    </div>
  );
}

function ComingSoon() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_bottom,#15803d_0%,#064e3b_30%,#04112e_70%)]">
      {/* floodlight beams */}
      <div aria-hidden className="absolute -left-10 -top-10 h-[140%] w-40 origin-top-left rotate-[-25deg] bg-gradient-to-b from-white/30 to-transparent blur-xl" />
      <div aria-hidden className="absolute -right-10 -top-10 h-[140%] w-40 origin-top-right rotate-[25deg] bg-gradient-to-b from-white/30 to-transparent blur-xl" />
      <div className="relative flex h-full flex-col items-center justify-center p-6 text-center">
        <motion.div animate={{ rotate: [0, -12, 12, 0] }} transition={{ repeat: Infinity, duration: 2.4 }} className="text-6xl sm:text-7xl">
          🏏
        </motion.div>
        <p className="mt-4 font-display text-2xl font-bold sm:text-3xl">The stream starts soon</p>
        <p className="mt-2 max-w-sm text-sm text-white/70">Stay on this page — the match will appear here as soon as the broadcast goes live.</p>
        <div className="mt-5 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span key={i} className="h-2 w-2 rounded-full bg-cyan" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
