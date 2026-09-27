# api-engine

REST API playground hosted on Vercel. Postman-inspired interface for composing
and testing HTTP requests. Requests go through a serverless proxy. Nothing is
stored.

Design system inherited from strueller.de (home-pager): dark theme, Tailwind v4
tokens, Space Grotesk + JetBrains Mono.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (@theme tokens)
- Deployed on Vercel via Git integration

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Environment

No environment variables are needed.

Access is gated externally via Cloudflare Zero Trust (planned).
