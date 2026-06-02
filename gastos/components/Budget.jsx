'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Icon from './Icons';
import { ProgressBar, StatCard, SectionHead, Modal, useToast, StateBadge } from './UI';
import { useMascota } from './Mascota';
import { CategoryModal, DeleteConfirm } from './Categories';


function BudgetTab() {
  const { stats, setBudget, deleteCategory, money, money0 } = useApp();
  const toast = useToast();
  const s    = stats();
  const cats = s.byCat;
  const [edit,    setEdit]    = useState({});
  const [catModal, setCatModal] = useState(false); // false=cerrado | 'new' | objeto=editar
  const [delCat,   setDelCat]  = useState(null);

  const handleDeleteConfirm = async () => {
    try {
      await deleteCategory(delCat.id);
      toast({ emoji:'🗑️', title:`"${delCat.name}" eliminada` });
    } catch(e) {
      toast({ emoji:'❌', title:'Error', msg: e.message });
    } finally {
      setDelCat(null);
    }
  };

  const saveBudget = (slug, val) => { setBudget(slug, val); setEdit(e => { const n={...e}; delete n[slug]; return n; }); };

  const totalBudget = cats.reduce((a,c) => a + c.budget, 0);
  const totalSpent  = cats.filter(c => c.slug !== 'ahorro').reduce((a,c) => a + c.spent, 0);

  return (
    <div className="col" style={{ gap:18 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14 }}>
        <StatCard label="Presupuesto total"    value={money0(totalBudget)} sub="incluye ahorro"              icon="target" tone="primary" />
        <StatCard label="Gastado"              value={money0(totalSpent)}  sub={`${s.used}% usado`}          icon="bars" />
        <StatCard label="Saldo restante"       value={money0(s.budgetDiff)} sub={s.budgetDiff>=0?'dentro del plan 🎯':'te pasaste'} icon="wallet" tone={s.budgetDiff>=0?'good':'warn'} />
        <StatCard label="Categorías excedidas" value={s.exceeded.length}   sub={s.exceeded.length?'revísalas 👇':'¡ninguna! 🎉'} icon="bell" tone={s.exceeded.length?'warn':'good'} />
      </div>

      <div className="card card-pad">
        <SectionHead icon="tag" title="Tu presupuesto por categoría" sub="Edita el monto, ícono o nombre de cada una"
          right={<button className="btn btn-primary btn-sm" onClick={() => setCatModal('new')}><Icon name="plus" size={16} />Nueva categoría</button>} />
        <div className="col" style={{ gap:6 }}>
          {cats.map(c => {
            const editing  = edit[c.slug] !== undefined;
            const isAhorro = c.slug === 'ahorro';
            return (
              <div key={c.slug} style={{ padding:'14px 0', borderBottom:'1px solid var(--border)' }}>
                <div className="row between wrap" style={{ gap:12 }}>
                  <div className="row" style={{ gap:12, minWidth:0 }}>
                    <span style={{ width:42, height:42, borderRadius:12, background:`color-mix(in srgb,${c.color} 14%, transparent)`, display:'grid', placeItems:'center', fontSize:20, flex:'none' }}>{c.icon}</span>
                    <div className="col" style={{ gap:3, minWidth:0 }}>
                      <span style={{ fontWeight:700, fontSize:15 }}>{c.name}</span>
                      <span className="tiny muted">{isAhorro ? `Ahorrado ${money(c.spent)} de meta` : `Gastado ${money(c.spent)} · quedan ${money(Math.max(0,c.remaining))}`}</span>
                    </div>
                  </div>
                  <div className="row" style={{ gap:8 }}>
                    <div className="row" style={{ gap:6, background:'var(--surface-2)', border:'1.5px solid var(--border)', borderRadius:10, padding:'4px 4px 4px 12px' }}>
                      <span className="tiny" style={{ fontWeight:700, color:'var(--muted)' }}>S/</span>
                      <input className="num"
                        value={editing ? edit[c.slug] : c.budget}
                        onChange={e => setEdit({...edit, [c.slug]: e.target.value.replace(/[^0-9]/g,'')})}
                        onBlur={() => editing && saveBudget(c.slug, edit[c.slug])}
                        onKeyDown={e => e.key==='Enter' && e.target.blur()}
                        style={{ width:64, border:'none', background:'none', fontWeight:700, fontSize:15, textAlign:'right', outline:'none', color:'var(--text)' }} />
                    </div>
                    {!isAhorro && <StateBadge state={c.state} />}
                    <button className="btn btn-icon btn-ghost" onClick={() => setCatModal(c)} title="Editar categoría">
                      <Icon name="edit" size={15} />
                    </button>
                    {!isAhorro && (
                      <button className="btn btn-icon btn-ghost" onClick={() => setDelCat(c)} title="Eliminar categoría">
                        <Icon name="trash" size={15} color="var(--danger)" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="row" style={{ gap:12, alignItems:'center', marginTop:10 }}>
                  <div className="grow">
                    <ProgressBar pct={c.pct} color={isAhorro?'var(--lime)':c.pct>100?'var(--danger)':c.pct>=70?'var(--warn)':c.color} />
                  </div>
                  <span className="num tiny" style={{ fontWeight:700, width:42, textAlign:'right', color:c.pct>100?'var(--danger)':'var(--muted)' }}>{c.pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="tiny muted" style={{ marginTop:14, display:'flex', gap:6, alignItems:'center' }}>
          <Icon name="info" size={15} />Toca el monto para editarlo. Usa ✏️ para cambiar nombre, ícono o color.
        </p>
      </div>

      {catModal !== false && (
        <CategoryModal cat={catModal === 'new' ? null : catModal} onClose={() => setCatModal(false)} />
      )}
      {delCat && (
        <DeleteConfirm cat={delCat} onConfirm={handleDeleteConfirm} onClose={() => setDelCat(null)} />
      )}
    </div>
  );
}

function IncomeTab() {
  const toast = useToast();
  const { reaccionar } = useMascota();
  const { incomes, stats, addIncome, updateIncome, deleteIncome, money, money0 } = useApp();
  const [modal, setModal] = useState(null);
  const s     = stats();
  const total = incomes.reduce((a,i) => a + i.amount, 0);
  const finApprox = total - s.spent - s.ahorroReal;

  const TYPES = ['Sueldo','Adicional','Bono','Otro'];

  function IncomeModal({ inc }) {
    const todayISO = new Date().toISOString().slice(0, 10);
    const [f, setF] = useState(inc || { type:'Adicional', label:'', amount:'', date: todayISO });
    const save = async () => {
      const data = { type:f.type, label:f.label||f.type, amount:parseFloat(f.amount)||0 };
      if (inc) await updateIncome(inc.id, data); else { await addIncome(data); reaccionar('ingreso'); }
      toast({ emoji:'💰', type:'good', title:inc?'Ingreso actualizado':'Ingreso agregado' });
      setModal(null);
    };
    return (
      <Modal open onClose={() => setModal(null)} title={inc?'Editar ingreso':'Nuevo ingreso'} width={420}>
        <div className="col" style={{ gap:14 }}>
          <div className="field"><label className="label">Fecha</label><input type="date" className="input num" value={f.date || todayISO} onChange={e => setF({...f, date:e.target.value})} max={todayISO} /></div>
          <div className="field"><label className="label">Tipo</label>
            <select className="input select" value={f.type} onChange={e => setF({...f, type:e.target.value})}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field"><label className="label">Descripción</label><input className="input" value={f.label} onChange={e => setF({...f, label:e.target.value})} placeholder="Ej. Sueldo mensual" /></div>
          <div className="field"><label className="label">Monto (S/)</label><input className="input num" value={f.amount} onChange={e => setF({...f, amount:e.target.value.replace(/[^0-9.]/g,'')})} placeholder="0.00" /></div>
          <div className="row" style={{ gap:10, marginTop:4 }}>
            <button className="btn btn-ghost grow" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn btn-primary grow" onClick={save}>Guardar</button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <div className="col" style={{ gap:18 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14 }}>
        <StatCard label="Ingreso total"     value={money0(total)}       sub={`${incomes.length} fuentes`}         icon="arrowDown" tone="primary" />
        <StatCard label="Gastos del mes"    value={money0(s.spent)}     sub="sin contar ahorro"                   icon="arrowUp" />
        <StatCard label="Ahorro"            value={money0(s.ahorroReal)}                                          icon="coins" tone="good" />
        <StatCard label="Saldo disponible" value={money0(finApprox)} sub={finApprox>=0?'Margen saludable 💪':'Revisa tus gastos'} icon="wallet" tone={finApprox>=0?'good':'warn'} />
      </div>

      <div className="card card-pad">
        <SectionHead icon="coins" title="Tus ingresos del mes" sub="Sueldo, bonos y otros ingresos"
          right={<button className="btn btn-primary btn-sm" onClick={() => setModal({})}><Icon name="plus" size={16} />Agregar</button>} />
        <div className="col">
          {incomes.map(i => (
            <div key={i.id} className="row between" style={{ padding:'14px 0', borderBottom:'1px solid var(--border)', gap:12 }}>
              <div className="row" style={{ gap:12 }}>
                <span style={{ width:42, height:42, borderRadius:12, background:'var(--primary-tint)', color:'var(--primary)', display:'grid', placeItems:'center', fontSize:18 }}>
                  {i.type==='Sueldo'?'💼':i.type==='Bono'?'🎁':'➕'}
                </span>
                <div className="col"><span style={{ fontWeight:700, fontSize:15 }}>{i.label}</span><span className="tiny muted">{i.type}</span></div>
              </div>
              <div className="row" style={{ gap:8 }}>
                <span className="num" style={{ fontWeight:800, fontSize:16 }}>{money(i.amount)}</span>
                <button className="btn btn-icon btn-ghost" onClick={() => setModal(i)}><Icon name="edit" size={15} /></button>
                {i.type !== 'Sueldo' && (
                  <button className="btn btn-icon btn-ghost" onClick={() => deleteIncome(i.id)}><Icon name="trash" size={15} color="var(--danger)" /></button>
                )}
              </div>
            </div>
          ))}
          {incomes.length === 0 && <p className="muted tiny" style={{ padding:'14px 0' }}>Aún no registras ingresos este mes. Agrega tu sueldo arriba.</p>}
        </div>
      </div>
      {modal !== null && <IncomeModal inc={modal.id ? modal : null} />}
    </div>
  );
}

export function IncomeTabView() {
  return (
    <div className="view-in">
      <div className="col" style={{ gap:6, marginBottom:18 }}>
        <h1 className="h-page">Ingresos 💰</h1>
        <p className="muted" style={{ fontSize:14.5 }}>Registra tu sueldo, bonos y otros ingresos del mes.</p>
      </div>
      <IncomeTab />
    </div>
  );
}

export default function Budget() {
  return (
    <div className="view-in">
      <div className="col" style={{ gap:6, marginBottom:18 }}>
        <h1 className="h-page">Presupuesto</h1>
        <p className="muted" style={{ fontSize:14.5 }}>Define tu plan mensual y controla tus gastos. 🎯</p>
      </div>
      <BudgetTab />
    </div>
  );
}
