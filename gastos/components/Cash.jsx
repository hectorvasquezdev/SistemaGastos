'use client';
import { useApp } from '@/context/AppContext';
import Icon from './Icons';
import { StatCard, SectionHead, ProgressBar } from './UI';
import { CompareDonut } from './Charts';

export default function Cash({ onNav }) {
  const { stats, monthExpenses, categories, money, money0 } = useApp();
  const s      = stats();
  const exp    = monthExpenses();
  const cashExp = exp.filter(e => e.method === 'Efectivo');
  const small   = cashExp.filter(e => e.amount <= 10);
  const smallTotal = small.reduce((a,e) => a + e.amount, 0);

  const byCat = categories.map(c => ({
    ...c, total: cashExp.filter(e => e.category === c.slug).reduce((a,e) => a + e.amount, 0)
  })).filter(c => c.total > 0).sort((a,b) => b.total - a.total);

  const topCash = byCat.slice(0,2).map(c => c.name);
  const total   = s.cash + s.yape;
  const cashPct = total ? Math.round(s.cash / total * 100) : 0;

  return (
    <div className="view-in">
      <div className="col" style={{ gap:6, marginBottom:18 }}>
        <h1 className="h-page">Control de efectivo 💵</h1>
        <p className="muted" style={{ fontSize:14.5 }}>Esos gastos chiquitos que siempre se escapan… aquí no.</p>
      </div>

      {/* reminder */}
      <div className="card card-pad" style={{ marginBottom:16, display:'flex', gap:14, alignItems:'center', background:'linear-gradient(120deg, var(--warn-tint), transparent)', border:'1px solid color-mix(in srgb, var(--warn) 26%, transparent)' }}>
        <span style={{ fontSize:26 }}>🔔</span>
        <div className="col grow">
          <span style={{ fontWeight:700, fontSize:14.5 }}>No olvides registrar tu efectivo de hoy</span>
          <span className="tiny muted">El pasaje, el menú, el snack… apúntalos antes de que se te olviden.</span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => onNav('add')}><Icon name="plus" size={16} />Registrar</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:14, marginBottom:16 }}>
        <StatCard label="Efectivo este mes" value={money0(s.cash)} sub={`${cashExp.length} gastos en efectivo`} icon="cash" tone="primary" />
        <StatCard label="Gastos pequeños"   value={money0(smallTotal)} sub={`${small.length} de S/ 10 o menos`} icon="coins" />
        <StatCard label="Efectivo vs Yape"  value={`${cashPct}%`} sub="de tu gasto digital+cash" icon="pie" tone="good" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }} className="dash-charts">
        <div className="card card-pad">
          <SectionHead icon="pie" title="Efectivo vs. Yape" sub="¿Cómo prefieres pagar?" />
          <div className="row" style={{ gap:18, alignItems:'center' }}>
            <div style={{ width:150, flex:'none' }}>
              <CompareDonut a={s.cash} b={s.yape} colorA="var(--lime)" colorB="#7d3cf3" height={150} />
            </div>
            <div className="col grow" style={{ gap:14 }}>
              <div className="col" style={{ gap:5 }}>
                <span className="row" style={{ gap:8 }}><span className="dot" style={{ background:'var(--lime)' }} /><span style={{ fontWeight:600, fontSize:14 }}>💵 Efectivo</span></span>
                <span className="num" style={{ fontWeight:800, fontSize:19 }}>{money(s.cash)}</span>
              </div>
              <div className="col" style={{ gap:5 }}>
                <span className="row" style={{ gap:8 }}><span className="dot" style={{ background:'#7d3cf3' }} /><span style={{ fontWeight:600, fontSize:14 }}>📲 Yape</span></span>
                <span className="num" style={{ fontWeight:800, fontSize:19 }}>{money(s.yape)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card card-pad">
          <SectionHead icon="tag" title="Dónde usas más efectivo" />
          <div className="col" style={{ gap:14 }}>
            {byCat.map(c => (
              <div key={c.slug} className="col" style={{ gap:6 }}>
                <div className="row between">
                  <span className="row" style={{ gap:8 }}><span style={{ fontSize:15 }}>{c.icon}</span><span style={{ fontSize:13.5, fontWeight:600 }}>{c.name}</span></span>
                  <span className="num tiny" style={{ fontWeight:700 }}>{money(c.total)}</span>
                </div>
                <ProgressBar pct={byCat[0] ? c.total/byCat[0].total*100 : 0} color="var(--lime)" />
              </div>
            ))}
            {byCat.length === 0 && <p className="muted tiny">Aún no registras gastos en efectivo este mes.</p>}
          </div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop:16, display:'flex', gap:14, alignItems:'center' }}>
        <span style={{ width:46, height:46, borderRadius:13, background:'var(--lime-tint)', display:'grid', placeItems:'center', fontSize:22 }}>📊</span>
        <p style={{ margin:0, fontSize:15, lineHeight:1.5 }}>
          Este mes gastaste <b className="num">{money(s.cash)}</b> en efectivo{topCash.length>0 && <>, la mayoría en <b>{topCash.join(' y ')}</b></>}.{' '}
          {smallTotal > 40 && <>Los gastos pequeños suman <b className="num">{money(smallTotal)}</b> — ¡ahí hay oportunidad de ahorrar! 🐷</>}
        </p>
      </div>
    </div>
  );
}
