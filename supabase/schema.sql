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

-- ---------------------------------------------------------------------
-- Lista de emails autorizados para «Crear cuenta» desde la app.
-- Solo pueden registrarse los emails que estén aquí; el resto recibe
-- «Este email no está autorizado». La tabla no es accesible desde la web.
-- ---------------------------------------------------------------------
create table if not exists public.allowed_emails (
  email text primary key
);

alter table public.allowed_emails enable row level security;
revoke all on public.allowed_emails from anon, authenticated;

create or replace function public.enforce_signup_allowlist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.allowed_emails a where lower(a.email) = lower(new.email)
  ) then
    raise exception 'signup_not_allowed: %', new.email;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_signup_allowlist on auth.users;
create trigger enforce_signup_allowlist
  before insert on auth.users
  for each row execute function public.enforce_signup_allowlist();

-- Pon aquí vuestros dos emails (cambia los de ejemplo) y ejecuta:
-- insert into public.allowed_emails (email) values
--   ('tu@email.com'),
--   ('esposa@email.com')
-- on conflict do nothing;
