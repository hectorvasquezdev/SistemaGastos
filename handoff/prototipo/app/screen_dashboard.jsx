/* ============================================================
   Dashboard
   ============================================================ */
(function () {
  const Icon = window.Icon;
  const { StatCard, SectionHead, Chart, ProgressBar, Ring, StateBadge, cssVar } = window;

  function Hero({ s, onNav }) {
    const ok = s.exceeded.length === 0 && s.pctSueldo <= 80;
    const msg = ok
      ? { emoji:'🎉', title:'¡Vas genial este mes!', text:`Llevas el ${s.used}% de tu presupuesto y ya ahorraste ${window.Store.money0(s.ahorroReal)}. Sigue así.` }
      : s.exceeded.length
        ? { emoji:'💪', title:'Aún estás a tiempo', text:`Te pasaste en ${s.exceeded.length} categoría${s.exceeded.length>1?'s':''}. Ajusta un poco y recuperas el control.` }
        : { emoji:'👀', title:'Cuidado con el ritmo', text:`Ya comprometiste el ${s.pctSueldo}% de tu sueldo. Revisa tus gastos grandes.` };
    return (
      <div className="card" style={{ overflow:'hidden', display:'grid', gridTemplateColumns:'1.4fr 1fr', border:'none', background:'linear-gradient(135deg, var(--primary-700), var(--primary) 70%)', color:'#fff' }}>
        <div style={{ padding:'26px 28px' }}>
          <div className="row" style={{ gap:10, marginBottom:14 }}>
            <span style={{ fontSize:30 }}>{msg.emoji}</span>
            <div className="col" style={{ gap:2 }}><span style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,.78)', textTransform:'uppercase', letterSpacing:'.06em' }}>{window.Store.monthLabel()}</span><h2 style={{ color:'#fff', fontSize:24, fontWeight:800, lineHeight:1.15 }}>{msg.title}</h2></div>
          </div>
          <p style={{ fontSize:15.5, lineHeight:1.5, color:'rgba(255,255,255,.9)', maxWidth:440, margin:0 }}>{msg.text}</p>
          <div className="row" style={{ gap:10, marginTop:20, flexWrap:'wrap' }}>
            <button className="btn btn-lg" style={{ background:'#fff', color:'var(--primary-700)' }} onClick={()=>onNav('add')}><Icon name="plus" size={18} />Registrar gasto</button>
            <button className="btn btn-lg" style={{ background:'rgba(255,255,255,.16)', color:'#fff' }} onClick={()=>onNav('reports')}>Ver reporte</button>
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

  function Dashboard({ onNav }) {
    const s = window.Store.stats();
    const alerts = window.Store.alerts();
    const catColor = (id) => window.Store.catById(id).color;

    // donut: gasto por categoría (sin ahorro)
    const donutCats = s.byCat.filter(c => c.id!=='ahorro' && c.spent>0);
    const donut = {
      labels: donutCats.map(c=>c.name),
      datasets: [{ data: donutCats.map(c=>c.spent), backgroundColor: donutCats.map(c=>c.color), borderWidth: 0, hoverOffset: 6 }]
    };
    // bar: presupuesto vs gasto
    const barCats = s.byCat.filter(c=>c.id!=='ahorro');
    const bar = {
      labels: barCats.map(c=>c.name.split(' ')[0]),
      datasets: [
        { label:'Presupuesto', data: barCats.map(c=>c.budget), backgroundColor:'var(--surface-3)', borderRadius:6, barPercentage:.7, categoryPercentage:.7 },
        { label:'Gastado', data: barCats.map(c=>c.spent), backgroundColor: barCats.map(c=> c.pct>100?cssVar('--danger'):c.pct>=70?cssVar('--warn'):cssVar('--primary')), borderRadius:6, barPercentage:.7, categoryPercentage:.7 },
      ]
    };
    // line: saldo disponible
    const line = {
      labels: s.daily.map(d=>d.day),
      datasets: [{ label:'Disponible', data: s.daily.map(d=>d.available), borderColor:'var(--primary)', backgroundColor:'transparent', tension:.35, pointRadius:0, borderWidth:2.5, fill:false }]
    };

    return (
      <div className="view-in col" style={{ gap:20 }}>
        <Hero s={s} onNav={onNav} />

        {/* KPI cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(190px, 1fr))', gap:14 }}>
          <StatCard label="Ingreso mensual" value={window.Store.money0(s.income)} sub={`Sueldo ${window.Store.money0(s.sueldo)} + extras`} icon="arrowDown" tone="primary" />
          <StatCard label="Gastado hasta hoy" value={window.Store.money0(s.spent)} sub={`${s.count} movimientos`} icon="arrowUp" />
          <StatCard label="Disponible" value={window.Store.money0(s.available)} sub="de tu sueldo" icon="wallet" tone="good" />
          <StatCard label="Ahorro logrado" value={window.Store.money0(s.ahorroReal)} sub={`Meta ${window.Store.money0(s.ahorroEsperado)}`} icon="coins" tone={s.ahorroDiff>=0?'good':'warn'} />
        </div>

        {/* alerts */}
        {alerts.length > 0 && (
          <div className="col" style={{ gap:10 }}>
            {alerts.slice(0,3).map((a,i)=>{
              const tone = a.level==='danger'?'danger':a.level==='warn'?'warn':'primary';
              return (
                <div key={i} className="card tap" onClick={()=>onNav('budget')} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', borderLeft:`4px solid var(--${a.level==='danger'?'danger':a.level==='warn'?'warn':'primary'})` }}>
                  <span style={{ width:38, height:38, borderRadius:11, flex:'none', display:'grid', placeItems:'center', background:`var(--${tone}-tint)`, color:`var(--${tone})`, fontSize:18 }}>{a.level==='danger'?'🚨':a.level==='warn'?'⚠️':'💡'}</span>
                  <div className="col grow" style={{ gap:2 }}><span style={{ fontWeight:700, fontSize:14.5 }}>{a.title}</span><span className="tiny muted">{a.msg}</span></div>
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
              <div style={{ width:170, flex:'none', position:'relative' }}>
                <Chart type="doughnut" height={170} data={donut} options={{ cutout:'66%', _money:true }} />
              </div>
              <div className="col grow" style={{ gap:9 }}>
                {donutCats.sort((a,b)=>b.spent-a.spent).slice(0,5).map(c=>{
                  const pctTotal = Math.round(c.spent / s.spent * 100);
                  return (
                    <div key={c.id} className="row between" style={{ gap:8 }}>
                      <span className="row" style={{ gap:8, minWidth:0 }}><span className="dot" style={{ background:c.color }} /><span style={{ fontSize:13.5, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</span></span>
                      <span className="num tiny" style={{ fontWeight:700, color:'var(--muted)' }}>{pctTotal}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="card card-pad">
            <SectionHead icon="bars" title="Presupuesto vs. gasto real" sub="Compara lo planeado con lo gastado" />
            <Chart type="bar" height={240} data={bar} options={{ _money:true, plugins:{ legend:{ display:true, position:'bottom', labels:{ usePointStyle:true, pointStyle:'circle', boxWidth:8, color:cssVar('--muted'), font:{ family:'Plus Jakarta Sans', size:12, weight:'600' } } } } }} />
          </div>
        </div>

        {/* saldo evolution + categories list */}
        <div style={{ display:'grid', gridTemplateColumns:'1.3fr 1fr', gap:16 }} className="dash-charts">
          <div className="card card-pad">
            <SectionHead icon="coins" title="Evolución de tu saldo" sub="Dinero disponible día a día" />
            <Chart type="line" height={230} data={line} options={{ _money:true }} />
          </div>
          <div className="card card-pad">
            <SectionHead icon="target" title="Categorías" right={<span className="link tiny" onClick={()=>onNav('budget')}>Ver todo</span>} />
            <div className="col" style={{ gap:14 }}>
              {barCats.sort((a,b)=>b.pct-a.pct).slice(0,5).map(c=>(
                <div key={c.id} className="col" style={{ gap:6 }}>
                  <div className="row between"><span className="row" style={{ gap:8 }}><span style={{ fontSize:15 }}>{c.icon}</span><span style={{ fontSize:13.5, fontWeight:600 }}>{c.name}</span></span><span className="num tiny" style={{ fontWeight:700, color: c.pct>100?'var(--danger)':'var(--muted)' }}>{window.Store.money0(c.spent)} / {window.Store.money0(c.budget)}</span></div>
                  <ProgressBar pct={c.pct} color={c.pct>100?'var(--danger)':c.pct>=70?'var(--warn)':c.color} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  window.Dashboard = Dashboard;
})();
