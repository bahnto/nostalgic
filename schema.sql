-- TURBINA · schema (correr en el SQL Editor de Supabase, proyecto NUEVO)
-- Mismas mecánicas que contest-app: fases gateadas por admin,
-- una entrada por persona, un voto por persona por categoría.

create table contests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  phase text not null default 'draft', -- draft | submissions | voting | results
  created_at timestamptz default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid references contests(id) on delete cascade,
  name text not null
);

create table entries (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid references contests(id) on delete cascade,
  participant_name text not null,
  media_url text not null,
  media_type text not null default 'image', -- image | video
  created_at timestamptz default now(),
  unique (contest_id, participant_name)
);

create table votes (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid references contests(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  entry_id uuid references entries(id) on delete cascade,
  voter_name text not null,
  created_at timestamptz default now(),
  unique (contest_id, category_id, voter_name)
);

alter table contests enable row level security;
alter table categories enable row level security;
alter table entries enable row level security;
alter table votes enable row level security;

-- App de amigos sin cuentas: políticas abiertas (como el contest-app original).
create policy "Public select" on contests for select using (true);
create policy "Public insert" on contests for insert with check (true);
create policy "Public update" on contests for update using (true);
create policy "Public delete" on contests for delete using (true); -- la famosa que faltaba

create policy "Public select" on categories for select using (true);
create policy "Public insert" on categories for insert with check (true);
create policy "Public delete" on categories for delete using (true);

create policy "Public select" on entries for select using (true);
create policy "Public insert" on entries for insert with check (true);
create policy "Public delete" on entries for delete using (true);

create policy "Public select" on votes for select using (true);
create policy "Public insert" on votes for insert with check (true);

-- STORAGE: crear bucket "entries" como PÚBLICO desde el dashboard,
-- y agregarle policies de insert/select públicas (Storage > entries > Policies).
