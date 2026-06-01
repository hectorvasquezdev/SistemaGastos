'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Icon from './Icons';
import { ProgressBar, StatCard, SectionHead, Modal, useToast, StateBadge } from './UI';
import { useMascota } from './Mascota';
import { suggestEmoji } from '@/lib/emojiSuggestions';

const EMOJI_OPTIONS = ['🍽️','🏠','🚌','💡','🛍️','🐷','✨','✈️','🎉','👗','💊','🎮','📚','🏋️','🐾','🎸','🍺','☕','🚗','💇'];
const COLOR_OPTIONS = ['#e0792b','#0f766e','#2563eb','#b56a09','#9333ea','#4d7c0f','#64748b','#dc2626','#db2777','#0891b2','#7c3aed','#059669'];

function NewCategoryModal({ onClose }) {
  const toast = useToast();
  const { addCategory } = useApp();
  const [name,          setName]          = useState('');
  const [icon,          setIcon]          = useState('✨');
  const [color,         setColor]         = useState('#64748b');
  const [busy,          setBusy]          = useState(false);
  const [autoSuggested, setAutoSuggested] = useState(true);

  const handleNameChange = (val) => {
    setName(val);
    if (autoSuggested) {
      const s = suggestEmoji(val);
      if (s) setIcon(s);
    }
  };

  const handleIconClick = (e) => {
    setIcon(e);
    setAutoSuggested(false);
  };

  const save = async () => {
    if (!name.trim()) { toast({ emoji:'⚠️', title:'Escribe un nombre', type:'default' }); return; }
    setBusy(true);
    try {
      await addCategory({ name: name.trim(), icon, color });
      toast({ emoji:'🎉', type:'good', title:`Categoría "${name.trim()}" creada` });
      onClose();
    } catch(e) {
      toast({ emoji:'❌', title:'Error', msg: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Nueva categoría" width={420}>
      <div className="col" style={{ gap:16 }}>
        <div className="field">
          <label className="label">Nombre</label>
          <input className="input" value={name} onChange={e => handleNameChange(e.target.value)} placeholder="Ej. Viajes, Salida con amigas…" autoFocus />
        </div>
        <div className="field">
          <div className="row between" style={{ marginBottom:6 }}>
            <label className="label" style={{ margin:0 }}>Ícono</label>
            {autoSuggested && icon !== '✨' && (
              <span className="tiny" style={{ color:'var(--primary)', fontWeight:700, display:'flex', alignItems:'center', gap:4 }}>
                ✨ Sugerido automáticamente
              </span>
            )}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(36px, 1fr))', gap:6 }}>
            {EMOJI_OPTIONS.map(e => (
              <button key={e} onClick={() => handleIconClick(e)} className="btn"
                style={{ fontSize:20, padding:6, borderRadius:10, background: icon===e ? 'var(--primary-tint)' : 'var(--surface-2)', border:`1.5px solid ${icon===e?'var(--primary)':'var(--border)'}` }}>
                {e}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label className="label">Color</label>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {COLOR_OPTIONS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                style={{ width:30, height:30, borderRadius:8, background:c, border: color===c ? '3px solid var(--text)' : '3px solid transparent', cursor:'pointer' }} />
            ))}
          </div>
        </div>
        <div style={{ padding:'12px 14px', borderRadius:12, background:'var(--surface-2)', display:'flex', gap:12, alignItems:'center' }}>
          <span style={{ width:40, height:40, borderRadius:12, background:`color-mix(in srgb,${color} 14%, transparent)`, display:'grid', placeItems:'center', fontSize:20 }}>{icon}</span>
          <span style={{ fontWeight:700 }}>{name || 'Vista previa'}</span>
        </div>
        <div className="row" style={{ gap:10 }}>
          <button className="btn btn-ghost grow" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary grow" onClick={save} disabled={busy}>{busy?'Guardando…':'Crear categoría'}</button>
        </div>
      </div>
    </Modal>
  );
}

const DEFAULT_SLUGS = ['alim','alq','trans','serv','comp','ahorro','otros'];

function BudgetTab() {
  const { stats, setBudget, deleteCategory, money, money0 } = useApp();
  const toast = useToast();
  const s    = stats();
  const cats = s.byCat;
  const [edit,    setEdit]    = useState({});
  const [showNew, setShowNew] = useState(false);

  const handleDelete = async (c) => {
    try {
      await deleteCategory(c.id);
      toast({ emoji:'🗑️', title:`Categoría "${c.name}" eliminada` });
    } catch(e) {
      toast({ emoji:'❌', title:'Error', msg: e.message });
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
        <SectionHead icon="tag" title="Tu presupuesto por categoría" sub="Edita cuánto planeas gastar en cada una"
          right={<button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}><Icon name="plus" size={16} />Nueva categoría</button>} />
        <div className="col" style={{ gap:6 }}>
          {cats.map(c => {
            const editing    = edit[c.slug] !== undefined;
            const isAhorro   = c.slug === 'ahorro';
            const isCustom   = !DEFAULT_SLUGS.includes(c.slug);
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
                    {isCustom && (
                      <button className="btn btn-icon btn-ghost" onClick={() => handleDelete(c)} title="Eliminar categoría">
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
          <Icon name="info" size={15} />Toca un monto para editarlo. El sistema compara tu gasto real contra el plan automáticamente.
        </p>
      </div>
      {showNew && <NewCategoryModal onClose={() => setShowNew(false)} />}
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
    const [f, setF] = useState(inc || { type:'Adicional', label:'', amount:'' });
    const save = async () => {
      const data = { type:f.type, label:f.label||f.type, amount:parseFloat(f.amount)||0 };
      if (inc) await updateIncome(inc.id, data); else { await addIncome(data); reaccionar('ingreso'); }
      toast({ emoji:'💰', type:'good', title:inc?'Ingreso actualizado':'Ingreso agregado' });
      setModal(null);
    };
    return (
      <Modal open onClose={() => setModal(null)} title={inc?'Editar ingreso':'Nuevo ingreso'} width={420}>
        <div className="col" style={{ gap:14 }}>
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
        <StatCard label="Te queda del sueldo" value={money0(finApprox)} sub={finApprox>=0?'¡buen colchón! 💪':'cuidado'} icon="wallet" tone={finApprox>=0?'good':'warn'} />
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

export default function Budget() {
  const [tab, setTab] = useState('budget');
  const tabs = [['budget','Presupuesto','target'],['income','Ingresos','coins']];
  return (
    <div className="view-in">
      <div className="col" style={{ gap:6, marginBottom:18 }}>
        <h1 className="h-page">Presupuesto e ingresos</h1>
        <p className="muted" style={{ fontSize:14.5 }}>Define tu plan mensual y registra cuánto ganas. 🎯</p>
      </div>
      <div className="row" style={{ gap:6, marginBottom:18, background:'var(--surface-3)', padding:5, borderRadius:12, width:'fit-content' }}>
        {tabs.map(([id,label,ic]) => (
          <button key={id} onClick={() => setTab(id)} className="btn btn-sm" style={{ background:tab===id?'var(--surface)':'transparent', color:tab===id?'var(--text)':'var(--muted)', boxShadow:tab===id?'var(--shadow-sm)':'none', borderRadius:9 }}>
            <Icon name={ic} size={16} />{label}
          </button>
        ))}
      </div>
      {tab === 'budget' ? <BudgetTab /> : <IncomeTab />}
    </div>
  );
}
