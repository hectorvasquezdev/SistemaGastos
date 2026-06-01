-- ============================================================
--  GASTOS — Datos de ejemplo (opcional)
--  Ejecútalo DESPUÉS de schema.sql y DESPUÉS de registrarte una
--  vez en la app, para tener categorías e ingresos iniciales.
--
--  IMPORTANTE: reemplaza 'TU-USER-ID' por tu UUID real.
--  Lo encuentras en:  Supabase → Authentication → Users → (tu fila) → User UID
-- ============================================================

-- Categorías base
insert into categories (user_id, slug, name, icon, color) values
  ('TU-USER-ID', 'alim',   'Alimentación',       '🍽️', '#e0792b'),
  ('TU-USER-ID', 'alq',    'Alquiler',           '🏠', '#0f766e'),
  ('TU-USER-ID', 'trans',  'Transporte',         '🚌', '#2563eb'),
  ('TU-USER-ID', 'serv',   'Servicios',          '💡', '#b56a09'),
  ('TU-USER-ID', 'comp',   'Compras personales', '🛍️', '#9333ea'),
  ('TU-USER-ID', 'ahorro', 'Ahorro',             '🐷', '#4d7c0f'),
  ('TU-USER-ID', 'otros',  'Otros gastos',       '✨', '#64748b')
on conflict (user_id, slug) do nothing;

-- Presupuestos del mes actual (ajusta month/year)
-- month: 0=Enero … 11=Diciembre
insert into budgets (user_id, category_id, amount, month, year)
select c.user_id, c.id,
       case c.slug
         when 'alim' then 500 when 'alq' then 700 when 'trans' then 150
         when 'serv' then 200 when 'comp' then 250 when 'ahorro' then 400
         else 100 end,
       extract(month from current_date)::int - 1,
       extract(year  from current_date)::int
from categories c where c.user_id = 'TU-USER-ID'
on conflict do nothing;

-- Ingresos del mes actual
insert into incomes (user_id, type, label, amount, month, year) values
  ('TU-USER-ID', 'Sueldo',    'Sueldo mensual',     2500,
     extract(month from current_date)::int - 1, extract(year from current_date)::int),
  ('TU-USER-ID', 'Adicional', 'Clases particulares', 280,
     extract(month from current_date)::int - 1, extract(year from current_date)::int);
