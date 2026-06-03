'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Icon from './Icons';
import { SectionHead, ProgressBar } from './UI';
import { SavingsBarChart } from './Charts';
import { getResumenMeses } from '@/lib/store';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const MESES_CORTO = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function GraficaMeses() {
  const { MONTH_NAMES } = useApp();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ahora = new Date();
    const meses = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(ahora.getFullYear(), ahora.getMonth() - (5 - i), 1);
      return { month: d.getMonth(), year: d.getFullYear() };
    });
    getResumenMeses(meses).then(res => {
      setData(res.map(r => ({
        label: MESES_CORTO[r.month] + (r.year !== ahora.getFullYear() ? ` ${r.year}` : ''),
        total: Math.round(r.total),
        esActual: r.month === ahora.getMonth() && r.year === ahora.getFullYear(),
      })));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="muted tiny" style={{ padding:'20px 0', textAlign:'center' }}>Cargando…</div>;

  const max = Math.max(...data.map(d => d.total), 1);

  return (
    <div className="card card-pad" style={{ marginTop:16 }}>
      <SectionHead icon="bars" title="Gasto mensual — últimos 6 meses" sub="Cuánto gastaste cada mes" />
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top:8, right:8, left:0, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize:12, fill:'var(--muted)', fontWeight:600 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => `S/${Math.round(v/1000)}k`} tick={{ fontSize:11, fill:'var(--faint)' }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            formatter={v => [`S/ ${v.toLocaleString('es-PE')}`, 'Gasto']}
            contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, fontSize:13, fontFamily:'inherit' }}
            labelStyle={{ fontWeight:700, color:'var(--text)' }}
            cursor={{ fill:'var(--surface-3)' }}
          />
          <Bar dataKey="total" radius={[8,8,0,0]} maxBarSize={52}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.esActual ? 'var(--primary)' : 'var(--primary-tint2)'} stroke={d.esActual ? 'var(--primary-700)' : 'none'} strokeWidth={1.5} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="row" style={{ gap:16, marginTop:8, justifyContent:'center' }}>
        <div className="row" style={{ gap:6 }}><div style={{ width:12, height:12, borderRadius:3, background:'var(--primary)' }} /><span className="tiny muted">Mes actual</span></div>
        <div className="row" style={{ gap:6 }}><div style={{ width:12, height:12, borderRadius:3, background:'var(--primary-tint2)' }} /><span className="tiny muted">Meses anteriores</span></div>
      </div>
    </div>
  );
}


function Stat({ label, value, sub, tone }) {
  return (
    <div style={{ padding:'14px 0', borderBottom:'1px solid var(--border)', gap:14 }} className="row between">
      <span className="muted" style={{ fontSize:14, flex:'none' }}>{label}</span>
      <div className="col" style={{ alignItems:'flex-end', textAlign:'right', minWidth:0 }}>
        <span className="num" style={{ fontWeight:800, fontSize:16, color:tone?`var(--${tone})`:'var(--text)' }}>{value}</span>
        {sub && <span className="tiny faint">{sub}</span>}
      </div>
    </div>
  );
}

const METHOD_META = { Yape:'📲', Efectivo:'💵', 'Tarjeta de débito':'💳', 'Tarjeta de crédito':'💳', Transferencia:'🏦', Otro:'•' };

export default function Reports({ onNav }) {
  const { stats, monthLabel, money, money0 } = useApp();
  const s = stats();

  const topCat    = [...s.byCat].filter(c=>c.slug!=='ahorro').sort((a,b)=>b.spent-a.spent)[0];
  const lowCat    = [...s.byCat].filter(c=>c.slug!=='ahorro'&&c.spent>0).sort((a,b)=>a.spent-b.spent)[0];
  const topMethod = [...s.byMethod].sort((a,b)=>b.total-a.total)[0];

  const pctCats = s.byCat.filter(c=>c.spent>0)
    .map(c=>({ ...c, share:Math.round(c.spent/(s.spent+s.ahorroReal)*100)||0 }))
    .sort((a,b)=>b.share-a.share);

  const print = () => {
    window.print();
  };

  return (
    <div className="view-in">
      <div className="row between wrap" style={{ gap:12, marginBottom:18 }}>
        <div className="col" style={{ gap:6 }}>
          <h1 className="h-page">Reporte de {monthLabel()}</h1>
          <p className="muted" style={{ fontSize:14.5 }}>Tu resumen financiero del mes, listo para revisar.</p>
        </div>
        <div className="row" style={{ gap:8 }}>
          <button className="btn btn-outline" onClick={print}><Icon name="download" size={17} />Imprimir / PDF</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }} className="dash-charts">
        <div className="card card-pad">
          <SectionHead icon="report" title="Resumen del mes" />
          <Stat label="Ingreso total"            value={money(s.income)}      tone="primary" />
          <Stat label="Gasto total"              value={money(s.spent)}       sub={`${s.used}% del presupuesto`} />
          <Stat label="Ahorro real"              value={money(s.ahorroReal)}  tone="good" sub={`meta ${money(s.ahorroEsperado)}`} />
          <Stat label="Diferencia presupuesto"   value={money(s.budgetDiff)}  tone={s.budgetDiff>=0?'good':'danger'} />
          <Stat label="Categoría con más gasto"  value={topCat?topCat.name:'—'}  sub={topCat?money(topCat.spent):''} />
          <Stat label="Categoría con menos gasto" value={lowCat?lowCat.name:'—'} sub={lowCat?money(lowCat.spent):''} />
          <Stat label="Método más usado"
            value={topMethod ? <span className="row" style={{ gap:6, justifyContent:'flex-end' }}><span style={{ fontSize:15 }}>{METHOD_META[topMethod.method]}</span><span>{topMethod.method}</span></span> : '—'}
            sub={topMethod?money(topMethod.total):''} />
          <div className="row between" style={{ paddingTop:14 }}>
            <span className="muted" style={{ fontSize:14 }}>Gastos en efectivo</span>
            <span className="num" style={{ fontWeight:800, fontSize:16 }}>{money(s.cash)}</span>
          </div>
        </div>

        <div className="col" style={{ gap:16 }}>
          <div className="card card-pad">
            <SectionHead icon="pie" title="¿A dónde va tu dinero?" sub="Distribución del gasto por categoría" />
            <div className="col" style={{ gap:11 }}>
              {pctCats.map(c => (
                <div key={c.slug} className="col" style={{ gap:5 }}>
                  <div className="row between">
                    <span className="row" style={{ gap:7 }}><span>{c.icon}</span><span style={{ fontSize:13.5, fontWeight:600 }}>{c.name}</span></span>
                    <span className="num tiny" style={{ fontWeight:700 }}>{c.share}%</span>
                  </div>
                  <ProgressBar pct={c.share} color={c.color} height={7} />
                </div>
              ))}
            </div>
            {topCat && <p className="tiny muted" style={{ marginTop:12, lineHeight:1.5 }}>Tu mayor gasto es <b style={{color:'var(--text)'}}>{topCat.name}</b>, representando el <b>{pctCats[0]?.share||0}%</b> de tus egresos.</p>}
          </div>

          <div className="card card-pad">
            <SectionHead icon="coins" title="Ahorro: esperado vs. real" />
            <SavingsBarChart esperado={s.ahorroEsperado} real={s.ahorroReal} height={150} />
          </div>
        </div>
      </div>

      <GraficaMeses />

      <div className="card card-pad" style={{ marginTop:16, background:'var(--primary-tint)', border:'1px solid color-mix(in srgb,var(--primary) 22%,transparent)', display:'flex', gap:14, alignItems:'center' }}>
        <span style={{ fontSize:26 }}>📌</span>
        <div className="col grow">
          <span style={{ fontWeight:700, fontSize:15 }}>Acción para el próximo mes</span>
          <span className="tiny" style={{ color:'var(--primary)' }}>
            {s.exceeded.length
              ? `Revisa el presupuesto de ${s.exceeded[0].name} — fue la categoría más ajustada este mes.`
              : 'Buen cierre de mes. Considera aumentar tu meta de ahorro el próximo periodo.'}
          </span>
        </div>
        <button className="btn btn-sm" style={{ background:'var(--surface)', color:'var(--primary)' }} onClick={() => onNav('budget')}>Ajustar plan</button>
      </div>
    </div>
  );
}
