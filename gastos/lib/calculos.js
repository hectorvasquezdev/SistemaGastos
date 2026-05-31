export const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
export const METHODS = ['Yape', 'Efectivo', 'Tarjeta', 'Transferencia', 'Otro'];
export const METHOD_META = {
  'Yape':          { color: '#7d3cf3', icon: '📲' },
  'Efectivo':      { color: '#4d7c0f', icon: '💵' },
  'Tarjeta':       { color: '#2563eb', icon: '💳' },
  'Transferencia': { color: '#0f766e', icon: '🏦' },
  'Otro':          { color: '#64748b', icon: '•' },
};

export function money(n, dec = 2) {
  if (n === undefined || n === null) return 'S/ 0.00';
  const abs = Math.abs(n).toLocaleString('es-PE', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  return (n < 0 ? '-' : '') + 'S/ ' + abs;
}
export function money0(n) {
  return 'S/ ' + Math.round(n || 0).toLocaleString('es-PE');
}

export function stats({ incomes, categories, expenses, month, year }) {
  const exp = expenses.filter(e => {
    const d = new Date((e.date || e.spent_at) + 'T00:00');
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const income        = incomes.reduce((s, i) => s + Number(i.amount), 0);
  const sueldo        = (incomes.find(i => i.type === 'Sueldo') || {}).amount || 0;
  const ahorroReal    = exp.filter(e => e.category === 'ahorro').reduce((s, e) => s + Number(e.amount), 0);
  const spent         = exp.filter(e => e.category !== 'ahorro').reduce((s, e) => s + Number(e.amount), 0);
  const budgetTotal   = categories.filter(c => c.slug !== 'ahorro').reduce((s, c) => s + Number(c.budget || 0), 0);
  const ahorroEsperado = Number((categories.find(c => c.slug === 'ahorro') || {}).budget || 0);
  const available     = income - spent - ahorroReal;
  const used          = budgetTotal ? Math.round(spent / budgetTotal * 100) : 0;
  const pctSueldo     = income ? Math.round((spent + ahorroReal) / income * 100) : 0;

  const byCat = categories.map(c => {
    const g   = exp.filter(e => e.category === c.slug).reduce((s, e) => s + Number(e.amount), 0);
    const bud = Number(c.budget || 0);
    const pct = bud ? Math.round(g / bud * 100) : 0;
    let state = 'good';
    if (c.slug !== 'ahorro') {
      if (pct > 100) state = 'danger';
      else if (pct >= 90) state = 'warn';
      else if (pct >= 70) state = 'soft';
    } else {
      state = g >= bud ? 'good' : 'soft';
    }
    return { ...c, id: c.slug, spent: g, pct, remaining: bud - g, state };
  });

  const byMethod = METHODS.map(m => ({
    method: m, ...METHOD_META[m],
    total: exp.filter(e => e.method === m).reduce((s, e) => s + Number(e.amount), 0),
  })).filter(x => x.total > 0);

  const cash = exp.filter(e => e.method === 'Efectivo').reduce((s, e) => s + Number(e.amount), 0);
  const yape = exp.filter(e => e.method === 'Yape').reduce((s, e) => s + Number(e.amount), 0);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const now = new Date();
  const isCurrent = now.getMonth() === month && now.getFullYear() === year;
  const lastDay = isCurrent ? now.getDate() : daysInMonth;
  const daily = [];
  let cum = 0;
  for (let d = 1; d <= lastDay; d++) {
    const dayExp = exp.filter(e => new Date((e.date || e.spent_at) + 'T00:00').getDate() === d && e.category !== 'ahorro');
    const g = dayExp.reduce((s, e) => s + Number(e.amount), 0);
    cum += g;
    daily.push({ day: d, amount: g, cum, available: income - cum - ahorroReal });
  }

  return {
    income, sueldo: Number(sueldo), spent, available, used, pctSueldo, budgetTotal,
    ahorroReal, ahorroEsperado, ahorroDiff: ahorroReal - ahorroEsperado,
    budgetDiff: budgetTotal - spent,
    byCat, byMethod, cash, yape, daily, daysInMonth, lastDay,
    exceeded:  byCat.filter(c => c.slug !== 'ahorro' && c.pct > 100),
    nearLimit: byCat.filter(c => c.slug !== 'ahorro' && c.pct >= 70 && c.pct <= 100),
    onTrack:   byCat.filter(c => c.slug !== 'ahorro' && c.pct < 70),
    count: exp.length,
  };
}

export function alerts(s) {
  const out = [];
  s.byCat.forEach(c => {
    if (c.slug === 'ahorro') return;
    if (c.pct > 100)       out.push({ level:'danger', cat:c, title:`Superaste ${c.name}`,          msg:`Te pasaste por ${money(c.spent - c.budget)} en ${c.name}.` });
    else if (c.pct >= 90)  out.push({ level:'warn',   cat:c, title:`Casi al límite en ${c.name}`,  msg:`Ya usaste el ${c.pct}% de tu presupuesto de ${c.name}.` });
    else if (c.pct >= 70)  out.push({ level:'soft',   cat:c, title:`Ojo con ${c.name}`,            msg:`Vas en ${c.pct}%. Te quedan ${money(c.remaining)}.` });
  });
  if (s.pctSueldo > 80) out.push({ level:'warn', title:'Cuidado con tu sueldo',            msg:`Ya comprometiste el ${s.pctSueldo}% de tu ingreso este mes.` });
  if (s.ahorroDiff < 0) out.push({ level:'soft', title:'Ahorro por debajo de lo planeado', msg:`Te faltan ${money(-s.ahorroDiff)} para tu meta de ahorro.` });
  const order = { danger:0, warn:1, soft:2 };
  return out.sort((a, b) => order[a.level] - order[b.level]);
}

export function recommendations(s) {
  const out = [];
  const top = [...s.byCat].filter(c => c.slug !== 'ahorro').sort((a, b) => b.spent - a.spent)[0];
  if (top && top.spent > 0) {
    const dailyLimit = Math.round(top.budget / s.daysInMonth);
    out.push({ icon:'🍽️', tone: top.pct > 85 ? 'warn' : 'good',
      text: top.pct > 85
        ? `Estás gastando bastante en ${top.name}. Prueba un límite diario de ${money0(dailyLimit)}.`
        : `Tu mayor gasto es ${top.name} (${money(top.spent)}). Vas bajo control.` });
  }
  if (s.cash > 0) {
    out.push({ icon:'💵', tone:'good', text:`Si recortas S/ 10 diarios en gastos pequeños, podrías ahorrar ${money0(300)} extra al mes.` });
  }
  const trans = s.byCat.find(c => c.slug === 'trans');
  if (trans && trans.pct < 60) out.push({ icon:'🚌', tone:'good', text:`Vas muy bien en Transporte, solo usaste el ${trans.pct}%. ¡Sigue así!` });
  const exceeded = s.exceeded[0];
  if (exceeded) out.push({ icon:'⚠️', tone:'warn', text:`Reduce en ${exceeded.name}: te pasaste por ${money(exceeded.spent - exceeded.budget)}.` });
  if (s.ahorroReal >= s.ahorroEsperado && s.ahorroEsperado > 0)
    out.push({ icon:'🐷', tone:'good', text:`¡Cumpliste tu meta de ahorro de ${money0(s.ahorroEsperado)}! Considera subirla 10%.` });
  return out;
}
