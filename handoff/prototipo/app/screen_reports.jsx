/* ============================================================
   Reporte mensual + Recomendaciones
   ============================================================ */
(function () {
  const Icon = window.Icon;
  const { SectionHead, Chart, ProgressBar, useToast, cssVar } = window;

  function Recommendations() {
    const recs = window.Store.recommendations();
    return (
      <div className="card card-pad">
        <SectionHead icon="bulb" title="Recomendaciones para ti" sub="Consejos simples para ahorrar más" />
        <div className="col" style={{ gap:10 }}>
          {recs.map((r,i)=>(
            <div key={i} className="row" style={{ gap:13, padding:'13px 15px', borderRadius:13, background: r.tone==='warn'?'var(--warn-tint)':'var(--surface-2)', border:'1px solid '+(r.tone==='warn'?'color-mix(in srgb,var(--warn) 22%,transparent)':'var(--border)') }}>
              <span style={{ fontSize:22, flex:'none' }}>{r.icon}</span>
              <p style={{ margin:0, fontSize:14, lineHeight:1.5, fontWeight:500 }}>{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function Reports({ onNav }) {
    const toast = useToast();
    const s = window.Store.stats();
    const topCat = [...s.byCat].filter(c=>c.id!=='ahorro').sort((a,b)=>b.spent-a.spent)[0];
    const lowCat = [...s.byCat].filter(c=>c.id!=='ahorro'&&c.spent>0).sort((a,b)=>a.spent-b.spent)[0];
    const topMethod = [...s.byMethod].sort((a,b)=>b.total-a.total)[0];

    // % por categoría
    const pctCats = s.byCat.filter(c=>c.spent>0).map(c=>({ ...c, share: Math.round(c.spent/(s.spent+s.ahorroReal)*100) })).sort((a,b)=>b.share-a.share);

    // ahorro esperado vs real
    const ahorroChart = { labels:['Esperado','Real'], datasets:[{ data:[s.ahorroEsperado, s.ahorroReal], backgroundColor:[cssVar('--surface-3'), cssVar('--lime')], borderRadius:8, barPercentage:.6 }] };

    const print = () => { toast({ emoji:'📄', type:'good', title:'Generando reporte…', msg:'Se abrirá el diálogo de impresión / PDF.' }); setTimeout(()=>window.print(), 600); };

    const Stat = ({ label, value, sub, tone }) => (
      <div style={{ padding:'14px 0', borderBottom:'1px solid var(--border)', gap:14 }} className="row between">
        <span className="muted" style={{ fontSize:14, flex:'none' }}>{label}</span>
        <div className="col" style={{ alignItems:'flex-end', textAlign:'right', minWidth:0 }}><span className="num" style={{ fontWeight:800, fontSize:16, color: tone?`var(--${tone})`:'var(--text)' }}>{value}</span>{sub && <span className="tiny faint">{sub}</span>}</div>
      </div>
    );

    return (
      <div className="view-in">
        <div className="row between wrap" style={{ gap:12, marginBottom:18 }}>
          <div className="col" style={{ gap:6 }}><h1 className="h-page">Reporte de {window.Store.monthLabel()}</h1><p className="muted" style={{ fontSize:14.5 }}>Tu resumen financiero del mes, listo para revisar.</p></div>
          <div className="row" style={{ gap:8 }}>
            <button className="btn btn-outline" onClick={print}><Icon name="download" size={17} />PDF</button>
            <button className="btn btn-outline" onClick={()=>toast({emoji:'📊',title:'Exportando a Excel…',msg:'Se descargará un archivo .xlsx'})}><Icon name="report" size={17} />Excel</button>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }} className="dash-charts">
          <div className="card card-pad">
            <SectionHead icon="report" title="Resumen del mes" />
            <Stat label="Ingreso total" value={window.Store.money(s.income)} tone="primary" />
            <Stat label="Gasto total" value={window.Store.money(s.spent)} sub={`${s.used}% del presupuesto`} />
            <Stat label="Ahorro real" value={window.Store.money(s.ahorroReal)} tone="good" sub={`meta ${window.Store.money(s.ahorroEsperado)}`} />
            <Stat label="Diferencia presupuesto" value={window.Store.money(s.budgetDiff)} tone={s.budgetDiff>=0?'good':'danger'} />
            <Stat label="Categoría con más gasto" value={topCat?topCat.name:'—'} sub={topCat?window.Store.money(topCat.spent):''} />
            <Stat label="Categoría con menos gasto" value={lowCat?lowCat.name:'—'} sub={lowCat?window.Store.money(lowCat.spent):''} />
            <Stat label="Método más usado" value={topMethod ? <span className="row" style={{ gap:6, justifyContent:'flex-end' }}><span style={{ fontSize:15, lineHeight:1 }}>{topMethod.icon}</span><span>{topMethod.method}</span></span> : '—'} sub={topMethod?window.Store.money(topMethod.total):''} />
            <div className="row between" style={{ paddingTop:14 }}><span className="muted" style={{ fontSize:14 }}>Gastos en efectivo</span><span className="num" style={{ fontWeight:800, fontSize:16 }}>{window.Store.money(s.cash)}</span></div>
          </div>

          <div className="col" style={{ gap:16 }}>
            <div className="card card-pad">
              <SectionHead icon="pie" title="% de gasto por categoría" />
              <div className="col" style={{ gap:11 }}>
                {pctCats.map(c=>(
                  <div key={c.id} className="col" style={{ gap:5 }}>
                    <div className="row between"><span className="row" style={{ gap:7 }}><span>{c.icon}</span><span style={{ fontSize:13.5, fontWeight:600 }}>{c.name}</span></span><span className="num tiny" style={{ fontWeight:700 }}>{c.share}%</span></div>
                    <ProgressBar pct={c.share} color={c.color} height={7} />
                  </div>
                ))}
              </div>
              {topCat && <p className="tiny muted" style={{ marginTop:12, lineHeight:1.5 }}>Tu mayor gasto es <b style={{color:'var(--text)'}}>{topCat.name}</b>, representando el <b>{pctCats[0]?pctCats[0].share:0}%</b> de tus egresos.</p>}
            </div>
            <div className="card card-pad">
              <SectionHead icon="coins" title="Ahorro: esperado vs. real" />
              <Chart type="bar" height={150} data={ahorroChart} options={{ _money:true, indexAxis:'y' }} />
            </div>
          </div>
        </div>

        <div style={{ marginTop:16 }}><Recommendations /></div>

        {/* next month suggestion */}
        <div className="card card-pad" style={{ marginTop:16, background:'var(--primary-tint)', border:'1px solid color-mix(in srgb,var(--primary) 22%,transparent)', display:'flex', gap:14, alignItems:'center' }}>
          <span style={{ fontSize:26 }}>🚀</span>
          <div className="col grow"><span style={{ fontWeight:700, fontSize:15 }}>Para el próximo mes</span><span className="tiny" style={{ color:'var(--primary)' }}>{s.exceeded.length?`Ajusta tu presupuesto de ${s.exceeded[0].name} o cuida más ese gasto.`:'¡Vas excelente! Intenta subir tu meta de ahorro un poco más.'}</span></div>
          <button className="btn btn-sm" style={{ background:'var(--surface)', color:'var(--primary)' }} onClick={()=>onNav('budget')}>Ajustar plan</button>
        </div>
      </div>
    );
  }

  window.Reports = Reports;
  window.Recommendations = Recommendations;
})();
