'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Icon from './Icons';
import { useToast } from './UI';
import { useMascota } from './Mascota';

const QUICK = [2, 5, 10, 20];

function MethodChip({ m, active, onClick }) {
  const meta = { Yape:{icon:'📲'}, Efectivo:{icon:'💵'}, Tarjeta:{icon:'💳'}, Transferencia:{icon:'🏦'}, Otro:{icon:'•'} };
  return (
    <button onClick={onClick} className="btn" style={{ flexDirection:'column', gap:5, padding:'12px 8px', borderRadius:14, flex:1, minWidth:78, background:active?'var(--primary-tint)':'var(--surface-2)', border:`1.5px solid ${active?'var(--primary)':'var(--border)'}`, color:active?'var(--primary)':'var(--text-2)' }}>
      <span style={{ fontSize:20 }}>{meta[m]?.icon}</span>
      <span style={{ fontSize:12.5, fontWeight:700 }}>{m}</span>
    </button>
  );
}

export default function RegisterExpense({ onNav }) {
  const toast = useToast();
  const { reaccionar } = useMascota();
  const { categories, addExpense, stats, catById, money, METHODS } = useApp();
  const todayISO = new Date().toISOString().slice(0,10);

  const [amount,   setAmount]   = useState('');
  const [category, setCategory] = useState('alim');
  const [method,   setMethod]   = useState('Yape');
  const [date,     setDate]     = useState(todayISO);
  const [desc,     setDesc]     = useState('');
  const [comment,  setComment]  = useState('');
  const [busy,     setBusy]     = useState(false);

  const amt = parseFloat(amount) || 0;
  const cat = catById(category);
  const addQuick = v => setAmount(a => ((parseFloat(a)||0) + v).toString());

  const save = async (keepOpen) => {
    if (!amt) { toast({ emoji:'⚠️', title:'Ingresa un monto', type:'default' }); return; }
    setBusy(true);
    try {
      // calcular ANTES de guardar para tener el estado actual
      const cc = stats().byCat.find(c => c.slug === category);
      const nuevoTotal = (cc?.spent || 0) + amt;
      const nuevoPct   = cc?.budget ? Math.round(nuevoTotal / cc.budget * 100) : 0;

      await addExpense({ amount: amt, category, method, date, description: desc || cat?.name, comment });

      if (category === 'ahorro') reaccionar('ahorro');
      else if (nuevoPct > 100)   reaccionar('pasaste');
      else if (nuevoPct >= 70)   reaccionar('cuidado');
      else                       reaccionar('bien');

      toast({ emoji:'✅', type:'good', title:`${money(amt)} en ${cat?.name}`,
        msg: nuevoPct > 100 ? `Superaste el límite de ${cat?.name} este mes.`
           : nuevoPct >= 70 ? `Llevas el ${nuevoPct}% del presupuesto de ${cat?.name}.`
           : `Disponible en ${cat?.name}: ${money((cc?.budget||0) - nuevoTotal)}.` });
      setAmount(''); setDesc(''); setComment('');
      if (!keepOpen) onNav('dash');
    } catch(e) {
      toast({ emoji:'❌', title:'Error al guardar', msg: e.message });
    } finally {
      setBusy(false);
    }
  };

  const s  = stats();
  const cc = s.byCat.find(c => c.slug === category);

  return (
    <div className="view-in" style={{ maxWidth:680, margin:'0 auto' }}>
      <div className="col" style={{ gap:6, marginBottom:20 }}>
        <h1 className="h-page">Registrar gasto</h1>
        <p className="muted" style={{ fontSize:14.5 }}>Anota tus gastos en segundos. ¡No dejes que el efectivo se te escape! 💵</p>
      </div>

      <div className="card card-pad col" style={{ gap:22 }}>
        {/* monto */}
        <div className="col" style={{ alignItems:'center', gap:14, padding:'6px 0 4px' }}>
          <span className="eyebrow">Monto del gasto</span>
          <div className="row" style={{ gap:6, alignItems:'baseline' }}>
            <span style={{ fontSize:32, fontWeight:700, color:'var(--muted)' }}>S/</span>
            <input autoFocus value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g,''))}
              placeholder="0.00" inputMode="decimal" className="num"
              style={{ width: Math.max(120,(amount.length||4)*30), maxWidth:280, border:'none', background:'none', textAlign:'center', fontSize:54, fontWeight:800, letterSpacing:'-.03em', color:'var(--text)', outline:'none' }} />
          </div>
          <div className="row wrap" style={{ gap:8, justifyContent:'center' }}>
            {QUICK.map(v => (
              <button key={v} onClick={() => addQuick(v)} className="btn btn-sm"
                style={{ background:'var(--surface-3)', color:'var(--text)', borderRadius:99, fontWeight:700, padding:'8px 16px' }}>+ S/ {v}</button>
            ))}
            {amount && <button onClick={() => setAmount('')} className="btn btn-sm" style={{ background:'transparent', color:'var(--faint)', borderRadius:99 }}><Icon name="x" size={14} />Limpiar</button>}
          </div>
        </div>

        <hr className="hr" />

        {/* método */}
        <div className="field">
          <label className="label">Método de pago</label>
          <div className="row wrap" style={{ gap:8 }}>
            {METHODS.map(m => <MethodChip key={m} m={m} active={method===m} onClick={() => setMethod(m)} />)}
          </div>
        </div>

        {/* categoría */}
        <div className="field">
          <label className="label">Categoría</label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px,1fr))', gap:8 }}>
            {categories.map(c => (
              <button key={c.slug} onClick={() => setCategory(c.slug)} className="btn" style={{ justifyContent:'flex-start', gap:8, padding:'11px 12px', borderRadius:12, background:category===c.slug?'var(--primary-tint)':'var(--surface-2)', border:`1.5px solid ${category===c.slug?'var(--primary)':'var(--border)'}`, color:category===c.slug?'var(--primary)':'var(--text-2)' }}>
                <span style={{ fontSize:17 }}>{c.icon}</span>
                <span style={{ fontSize:13, fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</span>
              </button>
            ))}
          </div>
          {cc && cc.slug !== 'ahorro' && amt > 0 && (
            <div className="tiny" style={{ marginTop:8, color:(cc.spent+amt)>cc.budget?'var(--danger)':'var(--muted)', fontWeight:600 }}>
              {(cc.spent+amt)>cc.budget
                ? `⚠️ Con este gasto superas el presupuesto de ${cc.name} por ${money(cc.spent+amt-cc.budget)}.`
                : `Quedarían ${money(cc.remaining-amt)} en ${cc.name} este mes.`}
            </div>
          )}
        </div>

        <div className="field">
          <label className="label">Descripción</label>
          <input className="input" value={desc} onChange={e => setDesc(e.target.value)}
            placeholder={`Ej. ${category==='trans'?'Pasaje al trabajo':category==='alim'?'Menú del día':'Detalle'}`} />
        </div>
        <div className="field">
          <label className="label">Comentario <span className="faint" style={{ fontWeight:500 }}>(opcional)</span></label>
          <input className="input" value={comment} onChange={e => setComment(e.target.value)} placeholder="Una nota para ti…" />
        </div>
        <div className="field">
          <label className="label">Fecha</label>
          <input type="date" className="input num" value={date} onChange={e => setDate(e.target.value)} max={todayISO} />
        </div>

        <div className="row" style={{ gap:10 }}>
          <button className="btn btn-primary btn-lg grow" onClick={() => save(false)} disabled={busy}>
            <Icon name="check" size={19} />{busy?'Guardando…':'Guardar gasto'}
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => save(true)} disabled={busy} title="Guardar y registrar otro">
            <Icon name="plus" size={18} />Otro
          </button>
        </div>
      </div>

      {/* efectivo express */}
      <div className="card card-pad" style={{ marginTop:16, display:'flex', gap:14, alignItems:'center', background:'var(--lime-tint)', border:'1px solid color-mix(in srgb, var(--lime) 30%, transparent)' }}>
        <span style={{ fontSize:26 }}>💵</span>
        <div className="col grow">
          <span style={{ fontWeight:700, fontSize:14.5 }}>Gasto en efectivo express</span>
          <span className="tiny muted">Selecciona Efectivo + Transporte y toca un monto rápido. ¡Listo en 2 toques!</span>
        </div>
        <button className="btn btn-sm" style={{ background:'var(--surface)', color:'var(--text)' }}
          onClick={() => { setMethod('Efectivo'); setCategory('trans'); }}>Modo efectivo</button>
      </div>
    </div>
  );
}
