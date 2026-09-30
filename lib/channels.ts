/** A channel plays `urls[0]` and falls back through the rest, in order, when a feed fails to load. */
export type Channel = { name: string; urls: string[] };

// Public streams published specifically for testing HLS players. Used until a licensed feed is configured.
const TEST_CHANNELS: Channel[] = [
  { name: "Test · Big Buck Bunny", urls: ["https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"] },
  { name: "Test · Tears of Steel", urls: ["https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8"] },
  { name: "Test · Apple BipBop", urls: ["https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8"] },
];

const splitUrls = (s: string) => s.split(/[\s,]+/).filter(Boolean);

/**
 * Channel list for /live, in priority order:
 *   STREAM_CHANNELS  JSON array; each entry takes "url" (one feed) or "urls" (feed + fallbacks), e.g.
 *                    [{"name":"Main feed","urls":["https://a/live.m3u8","https://b/live.m3u8"]}]
 *   STREAM_URL       a single channel (named by STREAM_TITLE); several URLs separated by spaces/commas are fallbacks
 *   test streams     fallback so the player can be exercised end to end
 */
export function getChannels(): { channels: Channel[]; isTest: boolean } {
  const json = process.env.STREAM_CHANNELS?.trim();
  if (json) {
    try {
      const list = (JSON.parse(json) as { name?: string; url?: string; urls?: string[] }[])
        .map((c) => ({ name: c?.name ?? "", urls: [...(c?.urls ?? []), ...(c?.url ? [c.url] : [])].map((u) => u.trim()).filter(Boolean) }))
        .filter((c) => c.name && c.urls.length);
      if (list.length) return { channels: list, isTest: false };
    } catch {
      console.warn("STREAM_CHANNELS is not valid JSON; ignoring it.");
    }
  }
  const urls = splitUrls(process.env.STREAM_URL ?? "");
  if (urls.length) return { channels: [{ name: process.env.STREAM_TITLE?.trim() || "Live", urls }], isTest: false };
  return { channels: TEST_CHANNELS, isTest: true };
}
