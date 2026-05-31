/* ============================================================
   Capa de datos — "base de datos" en localStorage
   (en producción: Supabase/Postgres con las mismas tablas)
   ============================================================ */
(function () {
  const KEY = 'gastos_db_v1';
  const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  // ---- categorías base ----
  const CATS = [
    { id: 'alim',  name: 'Alimentación',      icon: '🍽️', color: '#e0792b', budget: 500 },
    { id: 'alq',   name: 'Alquiler',          icon: '🏠', color: '#0f766e', budget: 700 },
    { id: 'trans', name: 'Transporte',        icon: '🚌', color: '#2563eb', budget: 150 },
    { id: 'serv',  name: 'Servicios',         icon: '💡', color: '#b56a09', budget: 200 },
    { id: 'comp',  name: 'Compras personales',icon: '🛍️', color: '#9333ea', budget: 250 },
    { id: 'ahorro',name: 'Ahorro',            icon: '🐷', color: '#4d7c0f', budget: 400 },
    { id: 'otros', name: 'Otros gastos',      icon: '✨', color: '#64748b', budget: 100 },
  ];
  const METHODS = ['Yape', 'Efectivo', 'Tarjeta', 'Transferencia', 'Otro'];
  const METHOD_META = {
    'Yape':          { color: '#7d3cf3', icon: '📲' },
    'Efectivo':      { color: '#4d7c0f', icon: '💵' },
    'Tarjeta':       { color: '#2563eb', icon: '💳' },
    'Transferencia': { color: '#0f766e', icon: '🏦' },
    'Otro':          { color: '#64748b', icon: '•' },
  };

  function pad(n){ return n < 10 ? '0'+n : ''+n; }
  function iso(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
  function uid(){ return Math.random().toString(36).slice(2,9); }

  // ---- generar gastos de ejemplo del mes actual ----
  function seedExpenses() {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    const today = now.getDate();
    const out = [];
    const desc = {
      alim: ['Menú del día','Almuerzo trabajo','Pollo a la brasa','Mercado','Desayuno','Snack','Cena familia','Caldo de gallina'],
      trans: ['Pasaje al trabajo','Combi de regreso','Taxi lluvia','Pasaje centro','Metropolitano','Mototaxi'],
      serv: ['Recibo de luz','Internet hogar','Recarga celular','Agua','Cable'],
      comp: ['Polo nuevo','Audífonos','Regalo','Zapatillas','Cargador','Libro'],
      otros: ['Farmacia','Corte de cabello','Donación','Imprevisto'],
      alq: ['Alquiler depa'],
      ahorro: ['Ahorro programado'],
    };
    function add(cat, amount, method, day, note) {
      out.push({ id: uid(), category: cat, amount, method,
        description: desc[cat] ? desc[cat][Math.floor(Math.random()*desc[cat].length)] : 'Gasto',
        comment: note || '', date: iso(new Date(y, m, day)), source: method==='Yape'?'yape':'manual' });
    }
    // alquiler y ahorro al inicio
    add('alq', 700, 'Transferencia', Math.min(2, today));
    add('ahorro', 400, 'Transferencia', Math.min(3, today));
    add('serv', 95, 'Yape', Math.min(4, today));
    add('serv', 79, 'Tarjeta', Math.min(8, today));
    add('serv', 45, 'Efectivo', Math.min(12, today));
    // distribuir comida, transporte, etc por día
    for (let day = 1; day <= today; day++) {
      // transporte casi diario
      if (day % 1 === 0 && Math.random() > .15) add('trans', [2,2.5,5,5,3.5][Math.floor(Math.random()*5)], Math.random()>.4?'Efectivo':'Yape', day);
      if (Math.random() > .25) add('alim', [8,12,15,18,10,22][Math.floor(Math.random()*6)], Math.random()>.5?'Yape':'Efectivo', day);
      if (Math.random() > .8) add('comp', [25,40,60,35][Math.floor(Math.random()*4)], Math.random()>.5?'Tarjeta':'Yape', day);
      if (Math.random() > .9) add('otros', [10,15,20][Math.floor(Math.random()*3)], 'Efectivo', day);
    }
    return out;
  }

  function fresh() {
    const now = new Date();
    return {
      _seedKey: now.getFullYear() + '-' + now.getMonth(),
      user: { name: 'Camila Rojas', email: 'camila@correo.pe', initials: 'CR' },
      month: now.getMonth(), year: now.getFullYear(),
      incomes: [
        { id: uid(), type: 'Sueldo',  label: 'Sueldo mensual', amount: 2500 },
        { id: uid(), type: 'Adicional',label: 'Clases particulares', amount: 280 },
      ],
      categories: CATS.map(c => ({ ...c })),
      expenses: seedExpenses(),
      achievements: ['ahorrador','presupuesto','racha7'],
      streak: 12,
    };
  }

  let db = load();
  function load() {
    const now = new Date();
    const currentKey = now.getFullYear() + '-' + now.getMonth();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Demo siempre vivo: si los datos fueron sembrados en otro mes,
        // regeneramos para que el mes actual aparezca poblado.
        if (parsed && parsed._seedKey === currentKey) return parsed;
      }
    } catch (e) {}
    const f = fresh();
    try { localStorage.setItem(KEY, JSON.stringify(f)); } catch(e){}
    return f;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch(e){} bump(); }

  // pub/sub
  const subs = new Set();
  function bump(){ subs.forEach(fn => fn()); }
  function subscribe(fn){ subs.add(fn); return () => subs.delete(fn); }

  // ---------- formato ----------
  function money(n, dec = 2) {
    const v = (n < 0 ? '-' : '') + 'S/ ' + Math.abs(n).toLocaleString('es-PE', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    return v;
  }
  function money0(n){ return 'S/ ' + Math.round(n).toLocaleString('es-PE'); }

  // ---------- consultas ----------
  function monthExpenses() {
    return db.expenses.filter(e => {
      const d = new Date(e.date + 'T00:00');
      return d.getMonth() === db.month && d.getFullYear() === db.year;
    });
  }
  function catById(id){ return db.categories.find(c => c.id === id); }

  function stats() {
    const exp = monthExpenses();
    const income = db.incomes.reduce((s,i)=>s+i.amount,0);
    const sueldo = (db.incomes.find(i=>i.type==='Sueldo')||{}).amount || 0;
    // gasto = todo menos ahorro (ahorro no es "gasto" pero sale del sueldo)
    const ahorroReal = exp.filter(e=>e.category==='ahorro').reduce((s,e)=>s+e.amount,0);
    const spent = exp.filter(e=>e.category!=='ahorro').reduce((s,e)=>s+e.amount,0);
    const budgetTotal = db.categories.filter(c=>c.id!=='ahorro').reduce((s,c)=>s+c.budget,0);
    const ahorroEsperado = (catById('ahorro')||{}).budget || 0;
    const available = income - spent - ahorroReal;
    const used = budgetTotal ? Math.round(spent / budgetTotal * 100) : 0;
    const pctSueldo = income ? Math.round((spent+ahorroReal)/income*100) : 0;

    const byCat = db.categories.map(c => {
      const g = exp.filter(e=>e.category===c.id).reduce((s,e)=>s+e.amount,0);
      const pct = c.budget ? Math.round(g/c.budget*100) : 0;
      let state = 'good';
      if (c.id!=='ahorro') {
        if (pct > 100) state = 'danger'; else if (pct >= 90) state = 'warn'; else if (pct >= 70) state = 'soft';
      } else { state = g >= c.budget ? 'good' : 'soft'; }
      return { ...c, spent: g, pct, remaining: c.budget - g, state };
    });

    const byMethod = METHODS.map(m => ({
      method: m, ...METHOD_META[m],
      total: exp.filter(e=>e.method===m).reduce((s,e)=>s+e.amount,0),
    })).filter(x => x.total > 0);

    const cash = exp.filter(e=>e.method==='Efectivo').reduce((s,e)=>s+e.amount,0);
    const yape = exp.filter(e=>e.method==='Yape').reduce((s,e)=>s+e.amount,0);

    // gasto diario acumulado y por día
    const daysInMonth = new Date(db.year, db.month+1, 0).getDate();
    const now = new Date();
    const isCurrent = now.getMonth()===db.month && now.getFullYear()===db.year;
    const lastDay = isCurrent ? now.getDate() : daysInMonth;
    const daily = [];
    let cum = 0;
    for (let d=1; d<=lastDay; d++) {
      const dayExp = exp.filter(e => new Date(e.date+'T00:00').getDate()===d && e.category!=='ahorro');
      const g = dayExp.reduce((s,e)=>s+e.amount,0);
      cum += g;
      daily.push({ day: d, amount: g, cum, available: income - cum - ahorroReal });
    }

    return {
      income, sueldo, spent, available, used, pctSueldo, budgetTotal,
      ahorroReal, ahorroEsperado, ahorroDiff: ahorroReal - ahorroEsperado,
      budgetDiff: budgetTotal - spent,
      byCat, byMethod, cash, yape, daily, daysInMonth, lastDay,
      exceeded: byCat.filter(c=>c.id!=='ahorro' && c.pct>100),
      nearLimit: byCat.filter(c=>c.id!=='ahorro' && c.pct>=70 && c.pct<=100),
      onTrack: byCat.filter(c=>c.id!=='ahorro' && c.pct<70),
      count: exp.length,
    };
  }

  // alertas inteligentes
  function alerts() {
    const s = stats();
    const out = [];
    s.byCat.forEach(c => {
      if (c.id==='ahorro') return;
      if (c.pct > 100) out.push({ level:'danger', cat:c, title:`Superaste ${c.name}`, msg:`Te pasaste por ${money(c.spent-c.budget)} en ${c.name}.` });
      else if (c.pct >= 90) out.push({ level:'warn', cat:c, title:`Casi al límite en ${c.name}`, msg:`Ya usaste el ${c.pct}% de tu presupuesto de ${c.name}.` });
      else if (c.pct >= 70) out.push({ level:'soft', cat:c, title:`Ojo con ${c.name}`, msg:`Vas en ${c.pct}%. Te quedan ${money(c.remaining)}.` });
    });
    if (s.pctSueldo > 80) out.push({ level:'warn', title:'Cuidado con tu sueldo', msg:`Ya comprometiste el ${s.pctSueldo}% de tu ingreso este mes.` });
    if (s.ahorroDiff < 0) out.push({ level:'soft', title:'Ahorro por debajo de lo planeado', msg:`Te faltan ${money(-s.ahorroDiff)} para tu meta de ahorro.` });
    const order = { danger:0, warn:1, soft:2 };
    return out.sort((a,b)=>order[a.level]-order[b.level]);
  }

  // recomendaciones
  function recommendations() {
    const s = stats();
    const out = [];
    const top = [...s.byCat].filter(c=>c.id!=='ahorro').sort((a,b)=>b.spent-a.spent)[0];
    if (top && top.spent>0) {
      const dailyLimit = Math.round((top.budget / s.daysInMonth));
      out.push({ icon:'🍽️', tone: top.pct>85?'warn':'good',
        text: top.pct>85
          ? `Estás gastando bastante en ${top.name}. Prueba un límite diario de ${money0(dailyLimit)}.`
          : `Tu mayor gasto es ${top.name} (${money(top.spent)}). Vas bajo control.` });
    }
    if (s.cash > 0) {
      const ahorroPosible = Math.round(s.cash*0.2);
      out.push({ icon:'💵', tone:'good', text:`Si recortas S/ 10 diarios en gastos pequeños, podrías ahorrar ${money0(300)} extra al mes.` });
    }
    const trans = s.byCat.find(c=>c.id==='trans');
    if (trans && trans.pct<60) out.push({ icon:'🚌', tone:'good', text:`Vas muy bien en Transporte, solo usaste el ${trans.pct}%. ¡Sigue así!` });
    const exceeded = s.exceeded[0];
    if (exceeded) out.push({ icon:'⚠️', tone:'warn', text:`Reduce en ${exceeded.name}: te pasaste por ${money(exceeded.spent-exceeded.budget)}.` });
    if (s.ahorroReal >= s.ahorroEsperado && s.ahorroEsperado>0) out.push({ icon:'🐷', tone:'good', text:`¡Cumpliste tu meta de ahorro de ${money0(s.ahorroEsperado)}! Considera subirla 10%.` });
    return out;
  }

  // ---------- mutaciones ----------
  const API = {
    get db(){ return db; },
    MONTH_NAMES, METHODS, METHOD_META,
    money, money0, money2: (n)=>money(n,2),
    subscribe, stats, alerts, recommendations, monthExpenses, catById,
    monthLabel(){ return MONTH_NAMES[db.month] + ' ' + db.year; },
    addExpense(e) {
      db.expenses.unshift({ id: uid(), source:'manual', comment:'', ...e });
      save();
    },
    addExpenses(list) { list.forEach(e => db.expenses.unshift({ id: uid(), source:'yape', comment:'', ...e })); save(); },
    updateExpense(id, patch) { const e = db.expenses.find(x=>x.id===id); if (e) Object.assign(e, patch); save(); },
    deleteExpense(id) { db.expenses = db.expenses.filter(x=>x.id!==id); save(); },
    setBudget(catId, amount) { const c = catById(catId); if (c) c.budget = +amount||0; save(); },
    addIncome(i) { db.incomes.push({ id: uid(), ...i }); save(); },
    updateIncome(id, patch) { const i = db.incomes.find(x=>x.id===id); if (i) Object.assign(i, patch); save(); },
    deleteIncome(id) { db.incomes = db.incomes.filter(x=>x.id!==id); save(); },
    setMonth(m, y) { db.month = m; db.year = y; save(); },
    setUser(u) { Object.assign(db.user, u); save(); },
    reset() { db = fresh(); localStorage.setItem(KEY, JSON.stringify(db)); bump(); },
  };
  window.Store = API;
})();
