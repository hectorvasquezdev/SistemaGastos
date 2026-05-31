'use client';
import { useApp } from '@/context/AppContext';
import { Ring, ProgressBar, SectionHead } from './UI';
import Icon from './Icons';

const BADGES = [
  { id:'ahorrador',  emoji:'⭐', name:'Ahorrador del mes',     desc:'Ahorraste más de lo que planeaste' },
  { id:'presupuesto',emoji:'🏆', name:'Presupuesto cumplido',  desc:'Te mantuviste dentro del plan' },
  { id:'racha7',     emoji:'🔥', name:'7 días seguidos',       desc:'Registraste gastos una semana completa' },
  { id:'meta',       emoji:'💰', name:'Ahorraste de más',      desc:'Superaste tu meta de ahorro' },
  { id:'control',    emoji:'🚀', name:'Control mejorado',      desc:'Gastaste menos que el mes pasado' },
  { id:'efectivo',   emoji:'💵', name:'Maestro del efectivo',  desc:'Registraste todo tu efectivo' },
];

export default function Gamification() {
  const { stats, achievements, money } = useApp();
  const s = stats();

  const unlocked = new Set(achievements);
  if (s.ahorroDiff >= 0)          unlocked.add('meta');
  if (s.exceeded.length === 0)    unlocked.add('presupuesto');
  if (s.ahorroReal > s.ahorroEsperado) unlocked.add('ahorrador');

  const savePct = s.ahorroEsperado ? Math.min(100, Math.round(s.ahorroReal / s.ahorroEsperado * 100)) : 0;
  const extra   = Math.max(0, s.ahorroReal - s.ahorroEsperado);
  const earned  = BADGES.filter(b => unlocked.has(b.id)).length;
  const streak  = 0; // streak requires daily tracking — shows 0 until wired to DB

  return (
    <div className="view-in">
      <div className="col" style={{ gap:6, marginBottom:18 }}>
        <h1 className="h-page">Tus logros 🏆</h1>
        <p className="muted" style={{ fontSize:14.5 }}>Ahorrar también puede ser divertido. ¡Sigue sumando!</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.3fr', gap:16, marginBottom:16 }} className="dash-charts">
        {/* streak */}
        <div className="card card-pad" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, textAlign:'center', background:'linear-gradient(160deg, var(--warn-tint), transparent)' }}>
          <div style={{ fontSize:46, lineHeight:1 }}>🔥</div>
          <div className="col" style={{ gap:2 }}>
            <span className="num" style={{ fontSize:38, fontWeight:800, lineHeight:1 }}>{streak}</span>
            <span style={{ fontWeight:700, fontSize:14 }}>días de racha</span>
          </div>
          <p className="tiny muted" style={{ margin:0 }}>Registra gastos todos los días para aumentar tu racha.</p>
        </div>

        {/* savings ring */}
        <div className="card card-pad">
          <SectionHead icon="coins" title="Meta de ahorro del mes" />
          <div className="row" style={{ gap:20, alignItems:'center' }}>
            <Ring pct={savePct} size={104} stroke={11} color="var(--lime)">
              <div className="col" style={{ alignItems:'center' }}>
                <span className="num" style={{ fontSize:22, fontWeight:800 }}>{savePct}%</span>
              </div>
            </Ring>
            <div className="col grow" style={{ gap:10 }}>
              <div className="col" style={{ gap:3 }}>
                <span className="tiny muted">Ahorrado</span>
                <span className="num" style={{ fontWeight:800, fontSize:22 }}>
                  {money(s.ahorroReal)} <span className="muted" style={{ fontSize:14, fontWeight:600 }}>/ {money(s.ahorroEsperado)}</span>
                </span>
              </div>
              <ProgressBar pct={savePct} color="var(--lime)" height={11} />
              {extra > 0
                ? <span className="pill pill-good" style={{ width:'fit-content' }}>⭐ ¡{money(extra)} extra ahorrado!</span>
                : <span className="tiny muted">Te faltan {money(Math.max(0,s.ahorroEsperado-s.ahorroReal))} para tu meta 💪</span>
              }
            </div>
          </div>
        </div>
      </div>

      {/* motivational banner */}
      {extra > 0 && (
        <div className="card card-pad" style={{ marginBottom:16, display:'flex', gap:14, alignItems:'center', background:'linear-gradient(120deg, var(--lime-tint), transparent)', border:'1px solid color-mix(in srgb,var(--lime) 30%,transparent)' }}>
          <span style={{ fontSize:30 }}>🎉</span>
          <p style={{ margin:0, fontSize:15.5, fontWeight:600, lineHeight:1.4 }}>¡Excelente! Ahorraste <b className="num">{money(extra)}</b> más de lo presupuestado este mes. ¡Ganaste una estrella! ⭐</p>
        </div>
      )}

      {/* badges */}
      <div className="card card-pad">
        <SectionHead icon="trophy" title="Insignias" sub={`${earned} de ${BADGES.length} desbloqueadas`}
          right={<span className="pill pill-primary">{earned}/{BADGES.length}</span>} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))', gap:12 }}>
          {BADGES.map(b => {
            const on = unlocked.has(b.id);
            return (
              <div key={b.id} className="col" style={{ alignItems:'center', textAlign:'center', gap:8, padding:'20px 14px', borderRadius:16, border:'1px solid var(--border)', background:on?'var(--surface-2)':'var(--surface)', position:'relative', opacity:on?1:.55 }}>
                <div style={{ width:60, height:60, borderRadius:'50%', display:'grid', placeItems:'center', fontSize:30, background:on?'var(--gold-tint)':'var(--surface-3)', filter:on?'none':'grayscale(1)', animation:on?'ringPop .4s ease both':'none' }}>{b.emoji}</div>
                <span style={{ fontWeight:700, fontSize:14 }}>{b.name}</span>
                <span className="tiny muted" style={{ lineHeight:1.4 }}>{b.desc}</span>
                {on
                  ? <span className="pill pill-good" style={{ position:'absolute', top:10, right:10, padding:'3px 7px' }}><Icon name="check" size={12} /></span>
                  : <span style={{ position:'absolute', top:12, right:12, color:'var(--faint)' }}><Icon name="lock" size={14} /></span>
                }
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
