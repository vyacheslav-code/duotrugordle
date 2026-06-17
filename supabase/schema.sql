-- Run this once in the Supabase SQL editor for your project.

create table if not exists streaks (
  discord_user_id text primary key,
  current_streak integer not null default 0,
  max_streak integer not null default 0,
  total_played integer not null default 0,
  total_won integer not null default 0,
  last_completed_date text,
  updated_at timestamptz not null default now()
);

-- All access goes through Netlify Functions using the service role key,
-- which bypasses RLS by design. Keep RLS enabled with no policies so the
-- table is unreachable by anon/public keys if one is ever exposed.
alter table streaks enable row level security;
