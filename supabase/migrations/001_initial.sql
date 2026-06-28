-- 001_initial.sql

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  school text,
  created_at timestamptz default now()
);

create table scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  subtitle text,
  key_signature text not null default 'C-Dur',
  time_signature integer[] not null default '{4,4}',
  tempo integer not null default 80,
  data jsonb not null,
  color_scheme jsonb not null,
  show_fingerings boolean default true,
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table share_links (
  id uuid primary key default gen_random_uuid(),
  score_id uuid references scores(id) on delete cascade not null,
  token text unique not null default encode(gen_random_bytes(16), 'hex'),
  expires_at timestamptz,
  created_at timestamptz default now()
);

alter table scores enable row level security;

create policy "Users see own scores" on scores for select
  using (auth.uid() = user_id);
create policy "Users insert own scores" on scores for insert
  with check (auth.uid() = user_id);
create policy "Users update own scores" on scores for update
  using (auth.uid() = user_id);
create policy "Users delete own scores" on scores for delete
  using (auth.uid() = user_id);
create policy "Public scores visible to all" on scores for select
  using (is_public = true);

alter table share_links enable row level security;

create policy "Owners manage share links" on share_links for all
  using (
    score_id in (
      select id from scores where user_id = auth.uid()
    )
  );

create policy "Share links readable by token" on share_links for select
  using (true);
