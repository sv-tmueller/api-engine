-- Collections and saved requests schema for api-engine
-- Single-user: no RLS, no auth. Cloudflare Zero Trust gates access.

create extension if not exists pgcrypto;

create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists saved_requests (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references collections(id) on delete cascade,
  name text not null,
  method text not null,
  url text not null,
  headers jsonb not null default '[]',
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_saved_requests_collection_id
  on saved_requests(collection_id);
