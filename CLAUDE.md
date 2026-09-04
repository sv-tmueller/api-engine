# CLAUDE.md

Orientation for Claude Code sessions in this repo. Read this first.

## What this repo is

`api-engine` is a personal REST API playground hosted on Vercel at
api.strueller.de. It combines a Postman-like request builder with a
serverless proxy and Supabase-backed collections persistence. Long-term
goal: an endpoint builder for defining and testing small serverless API
functions inline.

Deployed on Vercel via the Git integration (push to main triggers
production deploy). Access gating planned via Cloudflare Zero Trust,
consistent with other strueller.de subdomains.

## Tech stack

- Next.js 15 (App Router) + React 19 + TypeScript (strict)
- Tailwind CSS v4 (@theme tokens in app/globals.css)
- Supabase for persistence (service role key, server-side only)
- ESLint 9 + eslint-config-next

## Design system

Inherited from home-pager (strueller.de). Canonical tokens live in
`app/globals.css` under the `@theme inline` block. Do not diverge from
these tokens:

- Colors: bg #0c0b0a, bg-glow #1a1713, fg #e8eae6, fg-2 #bdb8af,
  muted #8a847a, accent #e8b05a, accent-border #3a3025, border #211e1a
- Fonts: Space Grotesk (display), JetBrains Mono (body/mono)
- Radial gradient glow background on body

## Architecture decisions

- Proxy route (`/api/proxy`): serverless function that forwards requests
  to avoid CORS and allow header manipulation. Browser talks to Vercel,
  Vercel talks to the target API.
- Single-user: no auth or RLS. Cloudflare Zero Trust gates access
  externally. Service role key used directly server-side.
- Future endpoint builder: stored-handler pattern. Catch-all route
  `/api/e/[slug]` loads function body from Supabase, executes via
  `new Function()` with a req/res shim. No redeploy needed.

## Working principles

- Simplicity first, surgical changes, goal-driven execution.
- Think before coding. Explore the codebase before proposing changes.

## Issues and branches

- Branch from main: `feat/<short-slug>` or `fix/<short-slug>`
- Merge via PR referencing the issue with `Closes #N`
- One topic per PR. No direct pushes to main.

## Commits

Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`,
`build:`, `ci:`. Imperative mood, lowercase, no period. Body explains
why, not what.

## Writing style

- No em dashes. Use regular hyphens, commas, or parentheses.
- No AI-cliche phrases ("leverage", "robust", "seamless", "comprehensive",
  "elevate", "delve", "it's worth noting", "moreover", "furthermore").
  Plain, direct English. Short sentences.
- Comments only when the why is non-obvious. Do not restate the code.

## Useful commands

```bash
npm install      # install dependencies
npm run dev      # dev server at http://localhost:3000
npm run build    # production build (run before pushing)
npm run lint     # Next.js / ESLint checks
npm run start    # serve the production build
```

## What not to do

- Don't push directly to main. Open a PR.
- Don't commit secrets. Env goes in `.env.local` (gitignored).
- Don't drift from the Tailwind @theme token block in globals.css.
- Don't add auth or RLS policies (single-user, Cloudflare gates access).
