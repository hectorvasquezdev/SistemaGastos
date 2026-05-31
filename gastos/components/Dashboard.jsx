'use client';
import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Icon from './Icons';
import { StatCard, SectionHead, ProgressBar, Ring } from './UI';
import { DonutChart, BudgetBarChart, LineChartComp } from './Charts';
import { useMascota } from './Mascota';

function Hero({ s, onNav }) {
  const { monthLabel } = useApp();
  const ok = s.exceeded.length === 0 && s.pctSueldo <= 80;
  const msg = ok
    ? { emoji:'🎉', title:'¡Vas genial este mes!', text:`Llevas el ${s.used}% de tu presupuesto y ya ahorraste S/ ${Math.round(s.ahorroReal).toLocaleString('es-PE')}. Sigue así.` }
    : s.exceeded.length
      ? { emoji:'💪', title:'Aún estás a tiempo', text:`Te pasaste en ${s.exceeded.length} categoría${s.exceeded.length>1?'s':''}. Ajusta un poco y recuperas el control.` }
      : { emoji:'👀', title:'Cuidado con el ritmo', text:`Ya comprometiste el ${s.pctSueldo}% de tu sueldo. Revisa tus gastos grandes.` };

  return (
    <div className="card" style={{ overflow:'hidden', display:'grid', gridTemplateColumns:'1.4fr 1fr', border:'none', background:'linear-gradient(135deg, var(--primary-700), var(--primary) 70%)', color:'#fff' }}>
      <div style={{ padding:'26px 28px' }}>
        <div className="row" style={{ gap:10, marginBottom:14 }}>
          <span style={{ fontSize:30 }}>{msg.emoji}</span>
          <div className="col" style={{ gap:2 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,.78)', textTransform:'uppercase', letterSpacing:'.06em' }}>{monthLabel()}</span>
            <h2 style={{ color:'#fff', fontSize:24, fontWeight:800, lineHeight:1.15 }}>{msg.title}</h2>
          </div>
        </div>
        <p style={{ fontSize:15.5, lineHeight:1.5, color:'rgba(255,255,255,.9)', maxWidth:440, margin:0 }}>{msg.text}</p>
        <div className="row" style={{ gap:10, marginTop:20, flexWrap:'wrap' }}>
          <button className="btn btn-lg" style={{ background:'#fff', color:'var(--primary-700)' }} onClick={() => onNav('add')}>
            <Icon name="plus" size={18} />Registrar gasto
          </button>
          <button className="btn btn-lg" style={{ background:'rgba(255,255,255,.16)', color:'#fff' }} onClick={() => onNav('reports')}>Ver reporte</button>
        </div>
      </div>
      <div style={{ padding:'26px 28px', display:'grid', placeItems:'center', background:'rgba(255,255,255,.07)', borderLeft:'1px solid rgba(255,255,255,.12)' }}>
        <Ring pct={s.used} size={132} stroke={13} color="#fff" track="rgba(255,255,255,.22)">
          <div className="col" style={{ alignItems:'center' }}>
            <span className="num" style={{ fontSize:30, fontWeight:800 }}>{s.used}%</span>
            <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,.82)' }}>del presupuesto</span>
          </div>
        </Ring>
      </div>
    </div>
  );
}

export default function Dashboard({ onNav }) {
  const { stats, alerts, money0, money } = useApp();
  const { setAppStats } = useMascota();
  const s  = stats();
  const al = alerts();

  useEffect(() => { setAppStats(s); }, [s.spent, s.used, s.ahorroReal]);

  // donut data
  const donutData = s.byCat.filter(c => c.slug !== 'ahorro' && c.spent > 0)
    .map(c => ({ name: c.name, value: c.spent, color: c.color }));

  // bar data
  const barData = s.byCat.filter(c => c.slug !== 'ahorro')
    .map(c => ({ name: c.name.split(' ')[0], budget: c.budget, spent: c.spent, pct: c.pct, color: c.color }));

  return (
    <div className="view-in col" style={{ gap:20 }}>
      <Hero s={s} onNav={onNav} />

      {/* KPI cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(190px, 1fr))', gap:14 }}>
        <StatCard label="Ingreso mensual"   value={money0(s.income)}    sub={`Sueldo ${money0(s.sueldo)} + extras`}            icon="arrowDown" tone="primary" />
        <StatCard label="Gastado hasta hoy" value={money0(s.spent)}     sub={`${s.count} movimientos`}                         icon="arrowUp" />
        <StatCard label="Disponible"        value={money0(s.available)} sub="de tu sueldo"                                     icon="wallet" tone="good" />
        <StatCard label="Ahorro logrado"    value={money0(s.ahorroReal)} sub={`Meta ${money0(s.ahorroEsperado)}`}              icon="coins" tone={s.ahorroDiff>=0?'good':'warn'} />
      </div>

      {/* alerts */}
      {al.length > 0 && (
        <div className="col" style={{ gap:10 }}>
          {al.slice(0,3).map((a,i) => {
            const tone = a.level==='danger'?'danger':a.level==='warn'?'warn':'primary';
            return (
              <div key={i} className="card tap" onClick={() => onNav('budget')} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', borderLeft:`4px solid var(--${a.level==='danger'?'danger':a.level==='warn'?'warn':'primary'})` }}>
                <span style={{ width:38, height:38, borderRadius:11, flex:'none', display:'grid', placeItems:'center', background:`var(--${tone}-tint)`, color:`var(--${tone})`, fontSize:18 }}>
                  {a.level==='danger'?'🚨':a.level==='warn'?'⚠️':'💡'}
                </span>
                <div className="col grow" style={{ gap:2 }}>
                  <span style={{ fontWeight:700, fontSize:14.5 }}>{a.title}</span>
                  <span className="tiny muted">{a.msg}</span>
                </div>
                <Icon name="chevR" size={18} color="var(--faint)" />
              </div>
            );
          })}
        </div>
      )}

      {/* charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.3fr', gap:16 }} className="dash-charts">
        <div className="card card-pad">
          <SectionHead icon="pie" title="¿En qué se va tu plata?" sub="Gasto por categoría este mes" />
          <div className="row" style={{ gap:18, alignItems:'center' }}>
            <div style={{ width:170, flex:'none' }}>
              <DonutChart data={donutData} height={170} />
            </div>
            <div className="col grow" style={{ gap:9 }}>
              {[...donutData].sort((a,b) => b.value-a.value).slice(0,5).map((c,i) => {
                const pctTotal = s.spent ? Math.round(c.value / s.spent * 100) : 0;
                return (
                  <div key={i} className="row between" style={{ gap:8 }}>
                    <span className="row" style={{ gap:8, minWidth:0 }}>
                      <span className="dot" style={{ background:c.color }} />
                      <span style={{ fontSize:13.5, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</span>
                    </span>
                    <span className="num tiny" style={{ fontWeight:700, color:'var(--muted)' }}>{pctTotal}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="card card-pad">
          <SectionHead icon="bars" title="Presupuesto vs. gasto real" sub="Compara lo planeado con lo gastado" />
          <BudgetBarChart data={barData} height={240} />
        </div>
      </div>

      {/* saldo + categories */}
      <div style={{ display:'grid', gridTemplateColumns:'1.3fr 1fr', gap:16 }} className="dash-charts">
        <div className="card card-pad">
          <SectionHead icon="coins" title="Evolución de tu saldo" sub="Dinero disponible día a día" />
          <LineChartComp data={s.daily} height={230} />
        </div>
        <div className="card card-pad">
          <SectionHead icon="target" title="Categorías" right={<span className="link tiny" onClick={() => onNav('budget')}>Ver todo</span>} />
          <div className="col" style={{ gap:14 }}>
            {[...s.byCat].filter(c=>c.slug!=='ahorro').sort((a,b)=>b.pct-a.pct).slice(0,5).map(c => (
              <div key={c.slug} className="col" style={{ gap:6 }}>
                <div className="row between">
                  <span className="row" style={{ gap:8 }}><span style={{ fontSize:15 }}>{c.icon}</span><span style={{ fontSize:13.5, fontWeight:600 }}>{c.name}</span></span>
                  <span className="num tiny" style={{ fontWeight:700, color:c.pct>100?'var(--danger)':'var(--muted)' }}>{money0(c.spent)} / {money0(c.budget)}</span>
                </div>
                <ProgressBar pct={c.pct} color={c.pct>100?'var(--danger)':c.pct>=70?'var(--warn)':c.color} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
