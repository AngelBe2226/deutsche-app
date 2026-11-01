-- Progreso por usuario del Índice de Alemán.
-- Pégalo en Supabase → SQL Editor → Run. Es idempotente.

create table if not exists public.progress (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  key        text        not null,
  value      text        not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.progress enable row level security;

-- Permisos explícitos: en proyectos nuevos las tablas creadas por SQL no
-- siempre se exponen solas a la API. Solo para usuarios con sesión; las
-- políticas de abajo limitan a cada uno a sus propias filas.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.progress to authenticated;
revoke all on public.progress from anon;

-- Cada usuario solo ve y toca sus propias filas.
drop policy if exists "progress_select_own" on public.progress;
drop policy if exists "progress_insert_own" on public.progress;
drop policy if exists "progress_update_own" on public.progress;
drop policy if exists "progress_delete_own" on public.progress;

create policy "progress_select_own" on public.progress
  for select using (auth.uid() = user_id);
create policy "progress_insert_own" on public.progress
  for insert with check (auth.uid() = user_id);
create policy "progress_update_own" on public.progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress_delete_own" on public.progress
  for delete using (auth.uid() = user_id);
