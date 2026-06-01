import { supabase } from './supabaseClient';

// ---------- AUTH ----------
export async function registrar({ email, password, name }) {
  return supabase.auth.signUp({ email, password, options: { data: { name } } });
}
export async function iniciarSesion({ email, password }) {
  return supabase.auth.signInWithPassword({ email, password });
}
export async function recuperarPassword(email) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/`,
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
  const { data, error } = await supabase.from('categories').select('*').order('created_at');
  if (error) throw error;
  return data;
}
export async function addCategoria({ slug, name, icon, color }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('categories').insert({ user_id: user.id, slug, name, icon, color })
    .select().single();
  if (error) throw error;
  return data;
}
export async function updateCategoria(id, patch) {
  const { data, error } = await supabase
    .from('categories').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCategoria(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ---------- INGRESOS ----------
export async function getIngresos(month, year) {
  const { data, error } = await supabase
    .from('incomes').select('*').eq('month', month).eq('year', year);
  if (error) throw error;
  return data;
}
export async function addIngreso({ type, label, amount, month, year }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('incomes').insert({ user_id: user.id, type, label, amount, month, year })
    .select().single();
  if (error) throw error;
  return data;
}
export async function updateIngreso(id, patch) {
  const { data, error } = await supabase
    .from('incomes').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
export async function deleteIngreso(id) {
  const { error } = await supabase.from('incomes').delete().eq('id', id);
  if (error) throw error;
}

// ---------- PRESUPUESTOS ----------
export async function getPresupuestos(month, year) {
  const { data, error } = await supabase
    .from('budgets').select('*, category:categories(*)').eq('month', month).eq('year', year);
  if (error) throw error;
  return data;
}
export async function setPresupuesto({ categoryId, amount, month, year }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('budgets')
    .upsert(
      { user_id: user.id, category_id: categoryId, amount, month, year },
      { onConflict: 'user_id,category_id,month,year' }
    ).select().single();
  if (error) throw error;
  return data;
}

// ---------- GASTOS ----------
export async function getGastos(month, year) {
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
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('expenses').insert({ user_id: user.id, ...gasto }).select().single();
  if (error) throw error;
  return data;
}
export async function addGastos(lista) {
  const { data: { user } } = await supabase.auth.getUser();
  const filas = lista.map(g => ({ user_id: user.id, source: 'yape', ...g }));
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

// ---------- RESUMEN MULTI-MES ----------
export async function getResumenMeses(meses) {
  // meses: [{ month, year }, ...]
  const results = await Promise.all(meses.map(async ({ month, year }) => {
    const desde = new Date(year, month, 1).toISOString().slice(0, 10);
    const hasta = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    const { data } = await supabase
      .from('expenses').select('amount, category_id')
      .gte('spent_at', desde).lte('spent_at', hasta);
    const total   = (data || []).reduce((s, e) => s + Number(e.amount), 0);
    return { month, year, total };
  }));
  return results;
}

// ---------- PERFIL ----------
export async function updatePerfil(patch) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('profiles').update(patch).eq('id', user.id).select().single();
  if (error) throw error;
  return data;
}

export async function uploadAvatar(file) {
  const { data: { user } } = await supabase.auth.getUser();
  const ext  = file.name.split('.').pop().toLowerCase();
  const path = `${user.id}/avatar.${ext}`;
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl + '?t=' + Date.now();
}

// ---------- CONTRASEÑA ----------
export async function cambiarPassword(email, currentPassword, newPassword) {
  const { error: authErr } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
  if (authErr) throw new Error('Contraseña actual incorrecta');
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

// ---------- LOGROS ----------
export async function getLogros() {
  const { data, error } = await supabase.from('user_achievements').select('*');
  if (error) throw error;
  return data;
}
export async function desbloquearLogro(achievement) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('user_achievements')
    .upsert({ user_id: user.id, achievement }, { onConflict: 'user_id,achievement' });
  if (error) throw error;
}
