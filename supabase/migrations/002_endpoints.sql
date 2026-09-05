-- Stored handler endpoints for api-engine
-- Single-user: no RLS, no auth. Cloudflare Zero Trust gates access.

create extension if not exists pgcrypto;

create table if not exists endpoints (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  method text not null,
  function_body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_endpoints_slug
  on endpoints(slug);
