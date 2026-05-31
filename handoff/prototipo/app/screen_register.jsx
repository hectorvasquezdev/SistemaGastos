/* ============================================================
   Registrar gasto
   ============================================================ */
(function () {
  const { useState } = React;
  const Icon = window.Icon;
  const { useToast } = window;

  const QUICK = [2, 5, 10, 20];

  function MethodChip({ m, active, onClick }) {
    const meta = window.Store.METHOD_META[m];
    return (
      <button onClick={onClick} className="btn" style={{
        flexDirection:'column', gap:5, padding:'12px 8px', borderRadius:14, flex:1, minWidth:78,
        background: active ? 'var(--primary-tint)' : 'var(--surface-2)',
        border: active ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
        color: active ? 'var(--primary)' : 'var(--text-2)',
      }}>
        <span style={{ fontSize:20 }}>{meta.icon}</span>
        <span style={{ fontSize:12.5, fontWeight:700 }}>{m}</span>
      </button>
    );
  }

  function RegisterExpense({ onNav }) {
    const toast = useToast();
    const todayISO = new Date().toISOString().slice(0,10);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('alim');
    const [method, setMethod] = useState('Yape');
    const [date, setDate] = useState(todayISO);
    const [desc, setDesc] = useState('');
    const [comment, setComment] = useState('');
    const cats = window.Store.db.categories;

    const amt = parseFloat(amount) || 0;
    const cat = window.Store.catById(category);

    const addQuick = (v) => setAmount(a => (parseFloat(a)||0 ? (parseFloat(a)+v) : v).toString());

    const save = (keepOpen) => {
      if (!amt) { toast({ emoji:'⚠️', title:'Ingresa un monto', type:'default' }); return; }
      window.Store.addExpense({ amount: amt, category, method, date, description: desc || cat.name, comment });
      const s = window.Store.stats();
      const cc = s.byCat.find(c=>c.id===category);
      toast({ emoji:'✅', type:'good', title:`${window.Store.money(amt)} en ${cat.name}`,
        msg: cc && cc.pct>100 ? `¡Ojo! Ya superaste el presupuesto de ${cat.name}.` : cc && cc.pct>=70 ? `Vas en ${cc.pct}% de ${cat.name}.` : `Te quedan ${window.Store.money(cc.remaining)} en ${cat.name}.` });
      setAmount(''); setDesc(''); setComment('');
      if (!keepOpen) onNav('dash');
    };

    const cc = window.Store.stats().byCat.find(c=>c.id===category);

    return (
      <div className="view-in" style={{ maxWidth:680, margin:'0 auto' }}>
        <div className="col" style={{ gap:6, marginBottom:20 }}>
          <h1 className="h-page">Registrar gasto</h1>
          <p className="muted" style={{ fontSize:14.5 }}>Anota tus gastos en segundos. ¡No dejes que el efectivo se te escape! 💵</p>
        </div>

        <div className="card card-pad col" style={{ gap:22 }}>
          {/* amount big input */}
          <div className="col" style={{ alignItems:'center', gap:14, padding:'6px 0 4px' }}>
            <span className="eyebrow">Monto del gasto</span>
            <div className="row" style={{ gap:6, alignItems:'baseline' }}>
              <span style={{ fontSize:32, fontWeight:700, color:'var(--muted)' }}>S/</span>
              <input autoFocus value={amount} onChange={e=>setAmount(e.target.value.replace(/[^0-9.]/g,''))} placeholder="0.00" inputMode="decimal"
                className="num" style={{ width: Math.max(120, (amount.length||4)*30), maxWidth:280, border:'none', background:'none', textAlign:'center', fontSize:54, fontWeight:800, letterSpacing:'-.03em', color:'var(--text)', outline:'none' }} />
            </div>
            <div className="row wrap" style={{ gap:8, justifyContent:'center' }}>
              {QUICK.map(v=>(
                <button key={v} onClick={()=>addQuick(v)} className="btn btn-sm" style={{ background:'var(--surface-3)', color:'var(--text)', borderRadius:99, fontWeight:700, padding:'8px 16px' }}>+ S/ {v}</button>
              ))}
              {amount && <button onClick={()=>setAmount('')} className="btn btn-sm" style={{ background:'transparent', color:'var(--faint)', borderRadius:99 }}><Icon name="x" size={14} />Limpiar</button>}
            </div>
          </div>

          <hr className="hr" />

          {/* method */}
          <div className="field">
            <label className="label">Método de pago</label>
            <div className="row wrap" style={{ gap:8 }}>
              {window.Store.METHODS.map(m=> <MethodChip key={m} m={m} active={method===m} onClick={()=>setMethod(m)} />)}
            </div>
          </div>

          {/* category */}
          <div className="field">
            <label className="label">Categoría</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px,1fr))', gap:8 }}>
              {cats.map(c=>(
                <button key={c.id} onClick={()=>setCategory(c.id)} className="btn" style={{ justifyContent:'flex-start', gap:8, padding:'11px 12px', borderRadius:12,
                  background: category===c.id?'var(--primary-tint)':'var(--surface-2)', border: category===c.id?'1.5px solid var(--primary)':'1.5px solid var(--border)', color: category===c.id?'var(--primary)':'var(--text-2)' }}>
                  <span style={{ fontSize:17 }}>{c.icon}</span><span style={{ fontSize:13, fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</span>
                </button>
              ))}
            </div>
            {cc && cc.id!=='ahorro' && amt>0 && (
              <div className="tiny" style={{ marginTop:8, color: (cc.spent+amt)>cc.budget?'var(--danger)':'var(--muted)', fontWeight:600 }}>
                {(cc.spent+amt)>cc.budget ? `⚠️ Con este gasto superas el presupuesto de ${cc.name} por ${window.Store.money(cc.spent+amt-cc.budget)}.` : `Quedarían ${window.Store.money(cc.remaining-amt)} en ${cc.name} este mes.`}
              </div>
            )}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }} className="reg-grid">
            <div className="field">
              <label className="label">Fecha</label>
              <input type="date" className="input num" value={date} onChange={e=>setDate(e.target.value)} max={todayISO} />
            </div>
            <div className="field">
              <label className="label">Descripción</label>
              <input className="input" value={desc} onChange={e=>setDesc(e.target.value)} placeholder={`Ej. ${cat.id==='trans'?'Pasaje al trabajo':cat.id==='alim'?'Menú del día':'Detalle'}`} />
            </div>
          </div>
          <div className="field">
            <label className="label">Comentario <span className="faint" style={{ fontWeight:500 }}>(opcional)</span></label>
            <input className="input" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Una nota para ti…" />
          </div>

          <div className="row" style={{ gap:10 }}>
            <button className="btn btn-primary btn-lg grow" onClick={()=>save(false)}><Icon name="check" size={19} />Guardar gasto</button>
            <button className="btn btn-outline btn-lg" onClick={()=>save(true)} title="Guardar y registrar otro"><Icon name="plus" size={18} />Otro</button>
          </div>
        </div>

        {/* fast cash card */}
        <div className="card card-pad" style={{ marginTop:16, display:'flex', gap:14, alignItems:'center', background:'var(--lime-tint)', border:'1px solid color-mix(in srgb, var(--lime) 30%, transparent)' }}>
          <span style={{ fontSize:26 }}>💵</span>
          <div className="col grow"><span style={{ fontWeight:700, fontSize:14.5 }}>Gasto en efectivo express</span><span className="tiny muted">Selecciona Efectivo + Transporte y toca un monto rápido. ¡Listo en 2 toques!</span></div>
          <button className="btn btn-sm" style={{ background:'var(--surface)', color:'var(--text)' }} onClick={()=>{ setMethod('Efectivo'); setCategory('trans'); }}>Modo efectivo</button>
        </div>
      </div>
    );
  }

  window.RegisterExpense = RegisterExpense;
})();
