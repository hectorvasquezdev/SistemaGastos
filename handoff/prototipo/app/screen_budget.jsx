/* ============================================================
   Presupuesto · Categorías · Ingresos
   ============================================================ */
(function () {
  const { useState } = React;
  const Icon = window.Icon;
  const { ProgressBar, Ring, StateBadge, SectionHead, Modal, useToast, StatCard } = window;

  // ---------------- Categorías + presupuesto editable ----------------
  function BudgetTab() {
    const toast = useToast();
    const s = window.Store.stats();
    const cats = s.byCat;
    const [edit, setEdit] = useState({}); // id -> value being typed

    const saveBudget = (id, val) => { window.Store.setBudget(id, val); setEdit(e=>{ const n={...e}; delete n[id]; return n; }); };
    const totalBudget = cats.reduce((a,c)=>a+c.budget,0);
    const totalSpent = cats.filter(c=>c.id!=='ahorro').reduce((a,c)=>a+c.spent,0);

    return (
      <div className="col" style={{ gap:18 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14 }}>
          <StatCard label="Presupuesto total" value={window.Store.money0(totalBudget)} sub="incluye ahorro" icon="target" tone="primary" />
          <StatCard label="Gastado" value={window.Store.money0(totalSpent)} sub={`${s.used}% usado`} icon="bars" />
          <StatCard label="Saldo restante" value={window.Store.money0(s.budgetDiff)} sub={s.budgetDiff>=0?'dentro del plan 🎯':'te pasaste'} icon="wallet" tone={s.budgetDiff>=0?'good':'warn'} />
          <StatCard label="Categorías excedidas" value={s.exceeded.length} sub={s.exceeded.length?'revísalas 👇':'¡ninguna! 🎉'} icon="bell" tone={s.exceeded.length?'warn':'good'} />
        </div>

        <div className="card card-pad">
          <SectionHead icon="tag" title="Tu presupuesto por categoría" sub="Edita cuánto planeas gastar en cada una" />
          <div className="col" style={{ gap:6 }}>
            {cats.map(c=>{
              const editing = edit[c.id] !== undefined;
              const isAhorro = c.id==='ahorro';
              return (
                <div key={c.id} style={{ display:'grid', gridTemplateColumns:'1fr', gap:10, padding:'14px 0', borderBottom:'1px solid var(--border)' }}>
                  <div className="row between wrap" style={{ gap:12 }}>
                    <div className="row" style={{ gap:12, minWidth:0 }}>
                      <span style={{ width:42, height:42, borderRadius:12, background:'color-mix(in srgb,'+c.color+' 14%, transparent)', display:'grid', placeItems:'center', fontSize:20, flex:'none' }}>{c.icon}</span>
                      <div className="col" style={{ gap:3, minWidth:0 }}>
                        <span style={{ fontWeight:700, fontSize:15 }}>{c.name}</span>
                        <span className="tiny muted">{isAhorro ? `Ahorrado ${window.Store.money(c.spent)} de meta` : `Gastado ${window.Store.money(c.spent)} · quedan ${window.Store.money(Math.max(0,c.remaining))}`}</span>
                      </div>
                    </div>
                    <div className="row" style={{ gap:12 }}>
                      <div className="row" style={{ gap:6, background:'var(--surface-2)', border:'1.5px solid var(--border)', borderRadius:10, padding:'4px 4px 4px 12px' }}>
                        <span className="tiny" style={{ fontWeight:700, color:'var(--muted)' }}>S/</span>
                        <input className="num" value={editing?edit[c.id]:c.budget} onChange={e=>setEdit({...edit, [c.id]:e.target.value.replace(/[^0-9]/g,'')})}
                          onBlur={()=>editing&&saveBudget(c.id, edit[c.id])} onKeyDown={e=>e.key==='Enter'&&e.target.blur()}
                          style={{ width:64, border:'none', background:'none', fontWeight:700, fontSize:15, textAlign:'right', outline:'none', color:'var(--text)' }} />
                      </div>
                      {!isAhorro && <StateBadge state={c.state} />}
                    </div>
                  </div>
                  <div className="row" style={{ gap:12, alignItems:'center' }}>
                    <div className="grow"><ProgressBar pct={c.pct} color={isAhorro?'var(--lime)':c.pct>100?'var(--danger)':c.pct>=70?'var(--warn)':c.color} /></div>
                    <span className="num tiny" style={{ fontWeight:700, width:42, textAlign:'right', color: c.pct>100?'var(--danger)':'var(--muted)' }}>{c.pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="tiny muted" style={{ marginTop:14, display:'flex', gap:6, alignItems:'center' }}><Icon name="info" size={15} />Toca un monto para editarlo. El sistema compara tu gasto real contra el plan automáticamente.</p>
        </div>
      </div>
    );
  }

  // ---------------- Ingresos ----------------
  function IncomeTab() {
    const toast = useToast();
    const [, force] = useState(0);
    const [modal, setModal] = useState(null); // {id?} editing/new
    const incomes = window.Store.db.incomes;
    const s = window.Store.stats();
    const total = incomes.reduce((a,i)=>a+i.amount,0);
    const finApprox = total - s.spent - s.ahorroReal;

    const TYPES = ['Sueldo','Adicional','Bono','Otro'];
    function IncomeModal({ inc }) {
      const [f, setF] = useState(inc || { type:'Adicional', label:'', amount:'' });
      const save = () => {
        const data = { type:f.type, label:f.label||f.type, amount: parseFloat(f.amount)||0 };
        if (inc) window.Store.updateIncome(inc.id, data); else window.Store.addIncome(data);
        toast({ emoji:'💰', type:'good', title: inc?'Ingreso actualizado':'Ingreso agregado' }); setModal(null);
      };
      return (
        <Modal open onClose={()=>setModal(null)} title={inc?'Editar ingreso':'Nuevo ingreso'} width={420}>
          <div className="col" style={{ gap:14 }}>
            <div className="field"><label className="label">Tipo</label><select className="input select" value={f.type} onChange={e=>setF({...f, type:e.target.value})}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div className="field"><label className="label">Descripción</label><input className="input" value={f.label} onChange={e=>setF({...f, label:e.target.value})} placeholder="Ej. Sueldo mensual" /></div>
            <div className="field"><label className="label">Monto (S/)</label><input className="input num" value={f.amount} onChange={e=>setF({...f, amount:e.target.value.replace(/[^0-9.]/g,'')})} placeholder="0.00" /></div>
            <div className="row" style={{ gap:10, marginTop:4 }}><button className="btn btn-ghost grow" onClick={()=>setModal(null)}>Cancelar</button><button className="btn btn-primary grow" onClick={save}>Guardar</button></div>
          </div>
        </Modal>
      );
    }

    return (
      <div className="col" style={{ gap:18 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14 }}>
          <StatCard label="Ingreso total" value={window.Store.money0(total)} sub={`${incomes.length} fuentes`} icon="arrowDown" tone="primary" />
          <StatCard label="Gastos del mes" value={window.Store.money0(s.spent)} sub="sin contar ahorro" icon="arrowUp" />
          <StatCard label="Ahorro" value={window.Store.money0(s.ahorroReal)} icon="coins" tone="good" />
          <StatCard label="Te queda del sueldo" value={window.Store.money0(finApprox)} sub={finApprox>=0?'¡buen colchón! 💪':'cuidado'} icon="wallet" tone={finApprox>=0?'good':'warn'} />
        </div>
        <div className="card card-pad">
          <SectionHead icon="coins" title="Tus ingresos del mes" sub="Sueldo, bonos y otros ingresos" right={<button className="btn btn-primary btn-sm" onClick={()=>setModal({})}><Icon name="plus" size={16} />Agregar</button>} />
          <div className="col">
            {incomes.map(i=>(
              <div key={i.id} className="row between" style={{ padding:'14px 0', borderBottom:'1px solid var(--border)', gap:12 }}>
                <div className="row" style={{ gap:12 }}>
                  <span style={{ width:42, height:42, borderRadius:12, background:'var(--primary-tint)', color:'var(--primary)', display:'grid', placeItems:'center', fontSize:18 }}>{i.type==='Sueldo'?'💼':i.type==='Bono'?'🎁':'➕'}</span>
                  <div className="col"><span style={{ fontWeight:700, fontSize:15 }}>{i.label}</span><span className="tiny muted">{i.type}</span></div>
                </div>
                <div className="row" style={{ gap:8 }}>
                  <span className="num" style={{ fontWeight:800, fontSize:16 }}>{window.Store.money(i.amount)}</span>
                  <button className="btn btn-icon btn-ghost" onClick={()=>setModal(i)}><Icon name="edit" size={15} /></button>
                  {i.type!=='Sueldo' && <button className="btn btn-icon btn-ghost" onClick={()=>{ window.Store.deleteIncome(i.id); force(x=>x+1); }}><Icon name="trash" size={15} color="var(--danger)" /></button>}
                </div>
              </div>
            ))}
          </div>
        </div>
        {modal && <IncomeModal inc={modal.id?modal:null} />}
      </div>
    );
  }

  function Budget() {
    const [tab, setTab] = useState('budget');
    const tabs = [['budget','Presupuesto','target'],['income','Ingresos','coins']];
    return (
      <div className="view-in">
        <div className="col" style={{ gap:6, marginBottom:18 }}>
          <h1 className="h-page">Presupuesto e ingresos</h1>
          <p className="muted" style={{ fontSize:14.5 }}>Define tu plan mensual y registra cuánto ganas. 🎯</p>
        </div>
        <div className="row" style={{ gap:6, marginBottom:18, background:'var(--surface-3)', padding:5, borderRadius:12, width:'fit-content' }}>
          {tabs.map(([id,label,ic])=>(
            <button key={id} onClick={()=>setTab(id)} className="btn btn-sm" style={{ background: tab===id?'var(--surface)':'transparent', color: tab===id?'var(--text)':'var(--muted)', boxShadow: tab===id?'var(--shadow-sm)':'none', borderRadius:9 }}><Icon name={ic} size={16} />{label}</button>
          ))}
        </div>
        {tab==='budget' ? <BudgetTab /> : <IncomeTab />}
      </div>
    );
  }

  window.Budget = Budget;
})();
