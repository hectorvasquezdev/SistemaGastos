// ============================================================
//  lib/store.js  — Capa de datos con Supabase
//
//  Reemplaza al "window.Store" del prototipo (app/data.jsx).
//  Mismas operaciones, pero contra la base de datos real.
//
//  En el prototipo guardabas en localStorage; aquí cada función
//  habla con Supabase y respeta el usuario logueado (RLS).
// ============================================================
import { supabase } from './supabaseClient';

// ---------- AUTENTICACIÓN ----------
export async function registrar({ email, password, name }) {
  // El trigger handle_new_user() crea el perfil automáticamente.
  return supabase.auth.signUp({
    email, password,
    options: { data: { name } },
  });
}

export async function iniciarSesion({ email, password }) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function recuperarPassword(email) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/nueva-password`,
  });
}

export async function cerrarSesion() {
  return supabase.auth.signOut();
}

export async function usuarioActual() {
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

// ---------- CATEGORÍAS ----------
export async function getCategorias() {
  const { data, error } = await supabase
    .from('categories').select('*').order('created_at');
  if (error) throw error;
  return data;
}

// ---------- INGRESOS ----------
export async function getIngresos(month, year) {
  const { data, error } = await supabase
    .from('incomes').select('*')
    .eq('month', month).eq('year', year);
  if (error) throw error;
  return data;
}

export async function addIngreso({ type, label, amount, month, year }) {
  const user = await usuarioActual();
  const { data, error } = await supabase
    .from('incomes')
    .insert({ user_id: user.id, type, label, amount, month, year })
    .select().single();
  if (error) throw error;
  return data;
}

// ---------- PRESUPUESTOS ----------
export async function getPresupuestos(month, year) {
  const { data, error } = await supabase
    .from('budgets').select('*, category:categories(*)')
    .eq('month', month).eq('year', year);
  if (error) throw error;
  return data;
}

export async function setPresupuesto({ categoryId, amount, month, year }) {
  const user = await usuarioActual();
  const { data, error } = await supabase
    .from('budgets')
    .upsert(
      { user_id: user.id, category_id: categoryId, amount, month, year },
      { onConflict: 'user_id,category_id,month,year' }
    )
    .select().single();
  if (error) throw error;
  return data;
}

// ---------- GASTOS ----------
export async function getGastos(month, year) {
  // primer y último día del mes
  const desde = new Date(year, month, 1).toISOString().slice(0, 10);
  const hasta = new Date(year, month + 1, 0).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('expenses').select('*')
    .gte('spent_at', desde).lte('spent_at', hasta)
    .order('spent_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addGasto(gasto) {
  const user = await usuarioActual();
  const { data, error } = await supabase
    .from('expenses')
    .insert({ user_id: user.id, ...gasto })
    .select().single();
  if (error) throw error;
  return data;
}

// Importar varios gastos de Yape de una sola vez
export async function addGastos(lista) {
  const user = await usuarioActual();
  const filas = lista.map((g) => ({ user_id: user.id, source: 'yape', ...g }));
  const { data, error } = await supabase.from('expenses').insert(filas).select();
  if (error) throw error;
  return data;
}

export async function updateGasto(id, patch) {
  const { data, error } = await supabase
    .from('expenses').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteGasto(id) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

// ---------- LOGROS ----------
export async function getLogros() {
  const { data, error } = await supabase.from('user_achievements').select('*');
  if (error) throw error;
  return data;
}

export async function desbloquearLogro(achievement) {
  const user = await usuarioActual();
  const { error } = await supabase
    .from('user_achievements')
    .upsert(
      { user_id: user.id, achievement },
      { onConflict: 'user_id,achievement' }
    );
  if (error) throw error;
}

// ============================================================
//  NOTA SOBRE CÁLCULOS (stats, alerts, recommendations)
//  Toda la lógica de stats()/alerts()/recommendations() del
//  prototipo (app/data.jsx) es JavaScript puro: recibe la lista
//  de gastos + presupuestos + ingresos y devuelve los totales.
//
//  Cópiala tal cual a  lib/calculos.js  y aliméntala con los
//  datos que devuelven getGastos() / getPresupuestos() / getIngresos().
//  No necesita cambios: solo cambia DE DÓNDE vienen los datos.
// ============================================================
