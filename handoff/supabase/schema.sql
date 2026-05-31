-- ============================================================
--  GASTOS — Esquema de base de datos para Supabase (PostgreSQL)
--  Pégalo completo en:  Supabase → SQL Editor → New query → Run
-- ============================================================
--  Refleja exactamente el modelo de datos del prototipo (app/data.jsx).
--  Incluye Row Level Security (RLS): cada usuario solo ve SUS datos.
-- ============================================================

-- Limpieza (solo si quieres recrear desde cero)
-- drop table if exists expenses, budgets, incomes, categories, user_achievements, profiles cascade;

-- ------------------------------------------------------------
-- 1) PERFIL DE USUARIO
--    Supabase Auth ya crea la tabla auth.users. Aquí guardamos
--    los datos visibles (nombre, iniciales, racha, etc.)
-- ------------------------------------------------------------
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text        not null default '',
  email       text        not null default '',
  initials    text        not null default '',
  streak      integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2) CATEGORÍAS  (Alimentación, Alquiler, Transporte, …)
-- ------------------------------------------------------------
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  slug        text        not null,            -- 'alim', 'alq', 'trans', …
  name        text        not null,
  icon        text        not null default '',
  color       text        not null default '#64748b',
  created_at  timestamptz not null default now(),
  unique (user_id, slug)
);

-- ------------------------------------------------------------
-- 3) PRESUPUESTOS  (monto asignado por categoría / mes)
-- ------------------------------------------------------------
create table if not exists budgets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  category_id uuid        not null references categories(id) on delete cascade,
  amount      numeric(10,2) not null default 0,
  month       smallint    not null,            -- 0 = Enero … 11 = Diciembre
  year        smallint    not null,
  created_at  timestamptz not null default now(),
  unique (user_id, category_id, month, year)
);

-- ------------------------------------------------------------
-- 4) INGRESOS  (Sueldo, Adicional, …)
-- ------------------------------------------------------------
create table if not exists incomes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  type        text        not null,            -- 'Sueldo', 'Adicional', …
  label       text        not null default '',
  amount      numeric(10,2) not null default 0,
  month       smallint    not null,
  year        smallint    not null,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 5) GASTOS  (el corazón de la app)
-- ------------------------------------------------------------
create table if not exists expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  category_id uuid        references categories(id) on delete set null,
  amount      numeric(10,2) not null,
  method      text        not null default 'Efectivo', -- Yape, Efectivo, Tarjeta, Transferencia, Otro
  description text        not null default '',
  comment     text        not null default '',
  source      text        not null default 'manual',   -- 'manual' | 'yape'
  spent_at    date        not null default current_date,
  created_at  timestamptz not null default now()
);
create index if not exists idx_expenses_user_date on expenses (user_id, spent_at);

-- ------------------------------------------------------------
-- 6) LOGROS  (gamificación: insignias desbloqueadas)
-- ------------------------------------------------------------
create table if not exists user_achievements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  achievement text        not null,            -- 'ahorrador', 'presupuesto', 'racha7', …
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement)
);

-- ============================================================
--  SEGURIDAD: Row Level Security
--  Cada usuario SOLO puede leer/escribir filas con su propio user_id.
-- ============================================================
alter table profiles          enable row level security;
alter table categories        enable row level security;
alter table budgets           enable row level security;
alter table incomes           enable row level security;
alter table expenses          enable row level security;
alter table user_achievements enable row level security;

-- Perfil: el id ES el auth.uid()
drop policy if exists "perfil propio" on profiles;
create policy "perfil propio" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Resto de tablas: filtran por user_id
drop policy if exists "categorias propias" on categories;
create policy "categorias propias" on categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "presupuestos propios" on budgets;
create policy "presupuestos propios" on budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "ingresos propios" on incomes;
create policy "ingresos propios" on incomes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "gastos propios" on expenses;
create policy "gastos propios" on expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "logros propios" on user_achievements;
create policy "logros propios" on user_achievements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
--  AUTOMÁTICO: crear el perfil al registrarse un usuario nuevo
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, initials)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    upper(left(coalesce(new.raw_user_meta_data->>'name', new.email), 2))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
