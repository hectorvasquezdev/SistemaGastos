// ============================================================
//  lib/supabaseClient.js
//  Cliente único de Supabase para toda la app.
// ============================================================
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Mensaje claro en consola si faltan las variables de entorno
  console.warn('⚠️  Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local');
}

export const supabase = createClient(url, anonKey);
