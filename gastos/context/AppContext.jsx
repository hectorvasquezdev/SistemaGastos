'use client';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import * as store from '@/lib/store';
import { stats as calcStats, alerts as calcAlerts, recommendations as calcRecs, MONTH_NAMES, METHODS, METHOD_META, money, money0 } from '@/lib/calculos';

const AppCtx = createContext(null);

const DEFAULT_CATS = [
  { slug:'alim',   name:'Alimentación',       icon:'🍽️', color:'#e0792b', budget:500 },
  { slug:'alq',    name:'Alquiler',            icon:'🏠', color:'#0f766e', budget:700 },
  { slug:'trans',  name:'Transporte',          icon:'🚌', color:'#2563eb', budget:150 },
  { slug:'serv',   name:'Servicios',           icon:'💡', color:'#b56a09', budget:200 },
  { slug:'comp',   name:'Compras personales',  icon:'🛍️', color:'#9333ea', budget:250 },
  { slug:'ahorro', name:'Ahorro',              icon:'🐷', color:'#4d7c0f', budget:400 },
  { slug:'otros',  name:'Otros gastos',        icon:'✨', color:'#64748b', budget:100 },
];

export function AppProvider({ children }) {
  const [user,         setUser]         = useState(null);
  const [profile,      setProfile]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [dataLoading,  setDataLoading]  = useState(false);

  const now = new Date();
  const [month, setMonthState] = useState(now.getMonth());
  const [year,  setYearState]  = useState(now.getFullYear());

  const [incomes,      setIncomes]      = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [expenses,     setExpenses]     = useState([]);
  const [achievements, setAchievements] = useState([]);

  // ── helpers ────────────────────────────────────────────────────
  const slugFromId = useCallback((catId, cats) =>
    (cats.find(c => c.id === catId) || {}).slug || 'otros', []);

  // ── load data ──────────────────────────────────────────────────
  const loadData = useCallback(async (userId, m, y) => {
    setDataLoading(true);
    try {
      // 1. categories
      let cats = await store.getCategorias();

      // first-time: seed default categories + budgets
      if (!cats || cats.length === 0) {
        for (const cat of DEFAULT_CATS) {
          const { data } = await supabase
            .from('categories')
            .insert({ user_id: userId, slug: cat.slug, name: cat.name, icon: cat.icon, color: cat.color })
            .select().single();
          if (data) {
            await supabase.from('budgets').upsert({
              user_id: userId, category_id: data.id, amount: cat.budget, month: m, year: y,
            }, { onConflict: 'user_id,category_id,month,year' });
          }
        }
        cats = await store.getCategorias();
      }

      // 2. budgets (merge into categories)
      const budgets = await store.getPresupuestos(m, y);
      // if no budgets for this month, create them from defaults
      if (budgets.length === 0) {
        for (const cat of cats) {
          const defaultBudget = DEFAULT_CATS.find(d => d.slug === cat.slug)?.budget || 0;
          await supabase.from('budgets').upsert({
            user_id: userId, category_id: cat.id, amount: defaultBudget, month: m, year: y,
          }, { onConflict: 'user_id,category_id,month,year' });
        }
      }
      const budgetsRefresh = budgets.length > 0 ? budgets : await store.getPresupuestos(m, y);

      const catsWithBudget = cats.map(c => {
        const b = budgetsRefresh.find(bd => bd.category_id === c.id);
        return { ...c, budget: b ? Number(b.amount) : 0 };
      });
      setCategories(catsWithBudget);

      // 3. incomes + expenses + achievements in parallel
      const [incs, exps, logros] = await Promise.all([
        store.getIngresos(m, y),
        store.getGastos(m, y),
        store.getLogros(),
      ]);

      setIncomes(incs.map(i => ({ ...i, amount: Number(i.amount) })));
      setExpenses(exps.map(e => ({
        ...e,
        amount: Number(e.amount),
        date: e.spent_at,
        category: slugFromId(e.category_id, catsWithBudget),
      })));
      setAchievements(logros.map(l => l.achievement));
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setDataLoading(false);
    }
  }, [slugFromId]);

  const loadProfile = useCallback(async (uid) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) setProfile(data);
  }, []);

  // ── auth listener ──────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
        loadData(session.user.id, month, year);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
        loadData(session.user.id, month, year);
      } else {
        setUser(null); setProfile(null);
        setIncomes([]); setCategories([]); setExpenses([]); setAchievements([]);
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── month navigation ───────────────────────────────────────────
  const setMonth = useCallback((m, y) => {
    setMonthState(m); setYearState(y);
    if (user) loadData(user.id, m, y);
  }, [user, loadData]);

  // ── derived stats (memoised) ───────────────────────────────────
  const s = useMemo(
    () => calcStats({ incomes, categories, expenses, month, year }),
    [incomes, categories, expenses, month, year]
  );

  // ── lookups ────────────────────────────────────────────────────
  const catById = useCallback(
    (slugOrId) => categories.find(c => c.slug === slugOrId || c.id === slugOrId),
    [categories]
  );
  const monthLabel = () => MONTH_NAMES[month] + ' ' + year;

  // ── mutations ──────────────────────────────────────────────────
  const addExpense = useCallback(async (gasto) => {
    const cat = catById(gasto.category);
    const row = await store.addGasto({
      category_id: cat?.id || null,
      amount:      gasto.amount,
      method:      gasto.method,
      description: gasto.description || '',
      comment:     gasto.comment    || '',
      source:      'manual',
      spent_at:    gasto.date,
    });
    setExpenses(prev => [{
      ...row,
      amount:   Number(row.amount),
      date:     row.spent_at,
      category: gasto.category,
    }, ...prev]);
    return row;
  }, [catById]);

  const addExpenses = useCallback(async (lista) => {
    const rows = lista.map(g => {
      const cat = catById(g.category);
      return {
        category_id: cat?.id || null,
        amount:      g.amount,
        method:      g.method || 'Yape',
        description: g.description || '',
        comment:     '',
        source:      'yape',
        spent_at:    g.date,
      };
    });
    await store.addGastos(rows);
    if (user) await loadData(user.id, month, year);
  }, [catById, user, loadData, month, year]);

  const updateExpense = useCallback(async (id, patch) => {
    const cat = patch.category ? catById(patch.category) : undefined;
    const dbPatch = {
      ...(patch.amount    !== undefined && { amount: patch.amount }),
      ...(patch.method               && { method: patch.method }),
      ...(patch.description !== undefined && { description: patch.description }),
      ...(patch.comment   !== undefined && { comment: patch.comment }),
      ...(patch.date                 && { spent_at: patch.date }),
      ...(cat                        && { category_id: cat.id }),
    };
    await store.updateGasto(id, dbPatch);
    setExpenses(prev => prev.map(e => e.id === id
      ? { ...e, ...patch, ...(patch.date && { spent_at: patch.date }) }
      : e));
  }, [catById]);

  const deleteExpense = useCallback(async (id) => {
    await store.deleteGasto(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const setBudget = useCallback(async (catSlug, amount) => {
    const cat = catById(catSlug);
    if (!cat || !user) return;
    await store.setPresupuesto({ categoryId: cat.id, amount, month, year });
    setCategories(prev => prev.map(c => c.slug === catSlug ? { ...c, budget: Number(amount) } : c));
  }, [catById, user, month, year]);

  const addCategory = useCallback(async ({ name, icon, color }) => {
    const slug = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '_' + Date.now();
    const cat = await store.addCategoria({ slug, name, icon, color });
    const catWithBudget = { ...cat, budget: 0 };
    setCategories(prev => [...prev, catWithBudget]);
    if (user) {
      await supabase.from('budgets').upsert({
        user_id: user.id, category_id: cat.id, amount: 0, month, year,
      }, { onConflict: 'user_id,category_id,month,year' });
    }
    return catWithBudget;
  }, [user, month, year]);

  const deleteCategory = useCallback(async (id) => {
    await store.deleteCategoria(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const addIncome = useCallback(async (inc) => {
    const row = await store.addIngreso({ ...inc, month, year });
    setIncomes(prev => [...prev, { ...row, amount: Number(row.amount) }]);
  }, [month, year]);

  const updateIncome = useCallback(async (id, patch) => {
    await store.updateIngreso(id, patch);
    setIncomes(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  }, []);

  const deleteIncome = useCallback(async (id) => {
    await store.deleteIngreso(id);
    setIncomes(prev => prev.filter(i => i.id !== id));
  }, []);

  const logout = useCallback(async () => {
    await store.cerrarSesion();
  }, []);

  const reload = useCallback(() => {
    if (user) loadData(user.id, month, year);
  }, [user, loadData, month, year]);

  // ── context value ──────────────────────────────────────────────
  const value = {
    user, profile, loading, dataLoading,
    month, year, setMonth,
    incomes, categories, expenses, achievements,
    stats:           () => s,
    alerts:          () => calcAlerts(s),
    recommendations: () => calcRecs(s),
    monthExpenses:   () => expenses,
    catById, monthLabel,
    money, money0,
    METHODS, METHOD_META, MONTH_NAMES,
    addExpense, addExpenses, updateExpense, deleteExpense,
    setBudget,
    addCategory, deleteCategory,
    addIncome, updateIncome, deleteIncome,
    logout, reload,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  return useContext(AppCtx);
}
