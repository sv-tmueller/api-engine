# api-engine

REST API playground hosted on Vercel. Postman-inspired interface for composing
and testing HTTP requests, with Supabase-backed collections persistence.

Design system inherited from strueller.de (home-pager): dark theme, Tailwind v4
tokens, Space Grotesk + JetBrains Mono.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (@theme tokens)
- Supabase (collections persistence)
- Deployed on Vercel via Git integration

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Environment

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_KEY` - Supabase service role key (server-side only)

Access is gated externally via Cloudflare Zero Trust (planned).
