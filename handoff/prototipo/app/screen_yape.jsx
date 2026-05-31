/* ============================================================
   Importar movimientos de Yape
   ============================================================ */
(function () {
  const { useState } = React;
  const Icon = window.Icon;
  const { useToast, Empty } = window;

  const SAMPLE = `2025-05-28	18.00	Alimentación - Menú del día
2025-05-28	5.00	Transporte - Pasaje
2025-05-27	45.00	Compras personales - Polo
2025-05-27	12.50	Almuerzo pollería
2025-05-26	8.00	Pasaje combi
2025-05-26	95.00	Servicios - Recibo luz
2025-05-25	22.00	Cena familiar
2025-05-24	15.00	Farmacia`;

  // mapea palabra clave -> categoría
  const KEYWORDS = {
    alim: ['alimentación','alimentacion','menú','menu','almuerzo','comida','pollería','polleria','cena','desayuno','restaurante','mercado','pollo'],
    trans: ['transporte','pasaje','combi','taxi','metropolitano','mototaxi','uber','didi','movilidad'],
    serv: ['servicios','luz','agua','internet','recibo','recarga','cable','celular'],
    comp: ['compras','polo','ropa','zapatillas','regalo','tienda','audífonos','audifonos'],
    alq: ['alquiler','renta','depa'],
    otros: ['farmacia','salud','otros','varios'],
  };
  function detectCat(desc) {
    const d = desc.toLowerCase();
    for (const [cat, words] of Object.entries(KEYWORDS)) {
      if (words.some(w => d.includes(w))) return cat;
    }
    return 'otros';
  }

  function parseRows(text) {
    const existing = new Set(window.Store.db.expenses.map(e=>e.date+'|'+e.amount.toFixed(2)+'|'+e.description.toLowerCase().slice(0,12)));
    return text.split('\n').map(l=>l.trim()).filter(Boolean).map((line, idx) => {
      const parts = line.split(/\t|\s{2,}|,|;/).map(p=>p.trim()).filter(Boolean);
      let date='', amount=0, desc='';
      // detectar fecha
      const dateP = parts.find(p=>/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}/.test(p));
      const amtP = parts.find(p=>/^S?\/?\.?\s?\d+[\.,]?\d*$/.test(p.replace('S/','').trim()) && parseFloat(p.replace(/[^0-9.]/g,''))>0);
      date = dateP ? normDate(dateP) : new Date().toISOString().slice(0,10);
      amount = amtP ? parseFloat(amtP.replace(/[^0-9.]/g,'')) : 0;
      desc = parts.filter(p=>p!==dateP && p!==amtP).join(' ') || 'Movimiento Yape';
      // limpia "Categoría - " del desc
      const cleanDesc = desc.replace(/^[^-]+-\s*/, m => /transporte|alimenta|servicio|compras|alquiler|otros/i.test(m)?'':m).trim() || desc;
      const dupKey = date+'|'+amount.toFixed(2)+'|'+desc.toLowerCase().slice(0,12);
      return { _id:idx, date, amount, description: cleanDesc, category: detectCat(desc), method:'Yape', dup: existing.has(dupKey), include: !existing.has(dupKey) && amount>0 };
    });
  }
  function normDate(s){
    if (/\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0,10);
    const m = s.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
    if (m){ const y=m[3]?(m[3].length===2?'20'+m[3]:m[3]):new Date().getFullYear(); return `${y}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`; }
    return new Date().toISOString().slice(0,10);
  }

  function ImportYape({ onNav }) {
    const toast = useToast();
    const [text, setText] = useState('');
    const [rows, setRows] = useState(null);
    const cats = window.Store.db.categories;

    const analyze = () => { const r = parseRows(text); setRows(r); };
    const setRow = (id, patch) => setRows(rs => rs.map(r=>r._id===id?{...r,...patch}:r));
    const toImport = rows ? rows.filter(r=>r.include) : [];

    const doImport = () => {
      window.Store.addExpenses(toImport.map(r=>({ date:r.date, amount:r.amount, description:r.description, category:r.category, method:'Yape' })));
      toast({ emoji:'📲', type:'good', title:`${toImport.length} movimientos importados`, msg:'Tus gastos de Yape ya están en tu historial.' });
      onNav('history');
    };

    return (
      <div className="view-in" style={{ maxWidth: rows?920:680, margin:'0 auto' }}>
        <div className="col" style={{ gap:6, marginBottom:18 }}>
          <h1 className="h-page">Importar de Yape 📲</h1>
          <p className="muted" style={{ fontSize:14.5 }}>Pega tus movimientos exportados y los clasificamos solitos. Tú solo revisas.</p>
        </div>

        {!rows ? (
          <div className="card card-pad col" style={{ gap:16 }}>
            <div className="field">
              <label className="label">Pega aquí tus movimientos (fecha · monto · descripción)</label>
              <textarea className="input" rows={9} value={text} onChange={e=>setText(e.target.value)} placeholder={"Copia desde tu app de Yape o un Excel/CSV. Una línea por movimiento:\n2025-05-28   18.00   Alimentación - Menú\n2025-05-28   5.00    Pasaje"} style={{ fontFamily:'ui-monospace, monospace', fontSize:13, lineHeight:1.6, resize:'vertical' }} />
            </div>
            <div className="row between wrap" style={{ gap:10 }}>
              <button className="link tiny row" style={{ gap:5, whiteSpace:'nowrap', flex:'none' }} onClick={()=>setText(SAMPLE)}><Icon name="sparkle" size={15} />Usar ejemplo</button>
              <button className="btn btn-primary" disabled={!text.trim()} onClick={analyze}><Icon name="upload" size={17} />Analizar movimientos</button>
            </div>
            <div className="row" style={{ gap:12, padding:'14px 16px', background:'var(--surface-2)', borderRadius:12 }}>
              <span style={{ fontSize:20 }}>🧠</span>
              <p className="tiny muted" style={{ margin:0, lineHeight:1.5 }}>Detectamos la <b>categoría automáticamente</b> según la descripción (ej. "Pasaje" → Transporte), evitamos <b>duplicados</b> y puedes corregir todo antes de guardar.</p>
            </div>
          </div>
        ) : (
          <div className="col" style={{ gap:16 }}>
            <div className="row between wrap" style={{ gap:10 }}>
              <div className="row" style={{ gap:8 }}>
                <span className="pill pill-good"><Icon name="check" size={14} />{toImport.length} a importar</span>
                {rows.some(r=>r.dup) && <span className="pill pill-warn"><Icon name="info" size={14} />{rows.filter(r=>r.dup).length} duplicados</span>}
              </div>
              <button className="link tiny" onClick={()=>{setRows(null);}}>← Volver a pegar</button>
            </div>
            <div className="card" style={{ overflow:'hidden' }}>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', minWidth:680 }}>
                  <thead><tr style={{ background:'var(--surface-2)', borderBottom:'1px solid var(--border)' }}>
                    <th style={th}></th><th style={th}>Fecha</th><th style={th}>Descripción</th><th style={th}>Categoría detectada</th><th style={{...th, textAlign:'right'}}>Monto</th>
                  </tr></thead>
                  <tbody>
                    {rows.map(r=>(
                      <tr key={r._id} style={{ borderBottom:'1px solid var(--border)', opacity:r.include?1:.5 }}>
                        <td style={{...td, width:44}}><input type="checkbox" checked={r.include} onChange={e=>setRow(r._id,{include:e.target.checked})} style={{ accentColor:'var(--primary)', width:17, height:17 }} /></td>
                        <td style={td}><span className="num tiny" style={{ fontWeight:600 }}>{r.date.slice(5)}</span></td>
                        <td style={td}><div className="col"><span style={{ fontSize:13.5, fontWeight:600 }}>{r.description}</span>{r.dup && <span className="tiny" style={{ color:'var(--warn)' }}>posible duplicado</span>}</div></td>
                        <td style={td}><select className="select" value={r.category} onChange={e=>setRow(r._id,{category:e.target.value})} style={{ padding:'6px 10px', fontSize:13, borderRadius:8, width:'auto', minWidth:150 }}>{cats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></td>
                        <td style={{...td, textAlign:'right'}}><span className="num" style={{ fontWeight:700 }}>{window.Store.money(r.amount)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="row between wrap" style={{ gap:10 }}>
              <span className="muted tiny num">Total a importar: <b style={{color:'var(--text)'}}>{window.Store.money(toImport.reduce((a,r)=>a+r.amount,0))}</b></span>
              <button className="btn btn-primary btn-lg" disabled={!toImport.length} onClick={doImport}><Icon name="download" size={18} />Importar {toImport.length} movimientos</button>
            </div>
          </div>
        )}
      </div>
    );
  }
  const th = { textAlign:'left', padding:'12px 14px', fontSize:12, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.04em', whiteSpace:'nowrap' };
  const td = { padding:'11px 14px', verticalAlign:'middle' };

  window.ImportYape = ImportYape;
})();
