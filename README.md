# Renata Live

Campaign site for Renata PLC's **100+ Bioequivalent Products** — registration, welcome page, quiz, games and a live Cricket World Cup stream.

Built with Next.js 16 (App Router), React 19, Tailwind CSS v4 and Framer Motion.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

## Pages

| Route | What it is |
| --- | --- |
| `/` | Registration (name + Bangladeshi mobile number) |
| `/home` | Welcome, 100+ / 69 / 22 stats, experience cards, product portfolio |
| `/quiz` | 6-question timed quiz (questions in `lib/quiz.ts`) |
| `/games` | Game hub → `/games/cricket`, `/games/catch`, `/games/memory`, `/games/spin` |
| `/live` | Live stream player |

All pages except `/` require registration (an httpOnly `rl_session` cookie).

## Configuration

Copy `.env.example` to `.env.local`:

- `STREAM_URL` — a YouTube URL/ID, an HLS `.m3u8` URL, or any embeddable player URL. List several (space/comma separated) to get automatic failover between HLS feeds.
- `STREAM_CHANNELS` — JSON list of channels with tabs; each takes `url` or `urls` (fallback feeds, tried in order).
- `STREAM_TITLE` — label under the player.

## Data

Registrations and quiz results are appended to `data/registrations.json` and `data/quiz-results.json` (see `lib/store.ts`).
This works on a normal Node server/VPS. On serverless hosts (e.g. Vercel) the filesystem is not persistent — swap `appendRecord` for a database.

## Editing content

- Quiz questions: `lib/quiz.ts`
- Products, stats: `lib/products.ts`
- Brand/product images: `public/brand`, `public/products`
