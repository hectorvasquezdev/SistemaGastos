'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Icon from './Icons';
import { useToast } from './UI';
import { useMascota } from './Mascota';

const KEYWORDS = {
  alim:  ['comida','aliment','menú','menu','almuerzo','desayuno','cena','restaurante','pollo','pollería','polleria','mercado','bodega','chifa','pizza'],
  trans: ['pasaje','combi','taxi','uber','didi','metro','bus','transporte','movilidad','moto'],
  serv:  ['luz','agua','internet','recibo','recarga','cable','celular','servicio','netflix','spotify'],
  comp:  ['ropa','polo','zapatillas','tienda','compra','regalo','audífonos','audifonos','falabella','saga'],
  alq:   ['alquiler','renta','depa','cuarto'],
  ahorro:['ahorro','ahorrar','piggy'],
  otros: ['farmacia','salud','médico','medico','otros','varios','licor','bar'],
};

function detectCat(desc) {
  const d = desc.toLowerCase();
  for (const [cat, words] of Object.entries(KEYWORDS)) {
    if (words.some(w => d.includes(w))) return cat;
  }
  return 'otros';
}

function parseLine(line, currentYear) {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 2) return null;

  // detect date: DD/MM or DD/MM/YY or DD/MM/YYYY
  const datePart = parts.find(p => /^\d{1,2}\/\d{1,2}/.test(p));
  const amtPart  = parts.find(p => /^\d+([.,]\d+)?$/.test(p) && p !== datePart);
  const descParts = parts.filter(p => p !== datePart && p !== amtPart);

  if (!amtPart) return null;

  let date = new Date().toISOString().slice(0, 10);
  if (datePart) {
    const [dd, mm, yy] = datePart.split('/');
    const yr = yy ? (yy.length === 2 ? '20' + yy : yy) : currentYear;
    date = `${yr}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
  }

  const amount = parseFloat(amtPart.replace(',', '.'));
  const description = descParts.join(' ') || 'Movimiento Yape';

  return { date, amount, description, category: detectCat(description), method: 'Yape' };
}

export default function ImportYape({ onNav }) {
  const toast = useToast();
  const { reaccionar } = useMascota();
  const { categories, addExpenses, money } = useApp();
  const [text, setText] = useState('');
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(false);
  const currentYear = new Date().getFullYear();

  const analyze = () => {
    const parsed = text.split('\n')
      .map((l, i) => ({ ...parseLine(l, currentYear), _id: i }))
      .filter(r => r && r.amount > 0);
    if (!parsed.length) {
      toast({ emoji:'⚠️', title:'No se encontraron movimientos', msg:'Revisa el formato: DD/MM monto descripción', type:'default' });
      return;
    }
    setRows(parsed);
  };

  const setRow = (id, patch) => setRows(rs => rs.map(r => r._id === id ? { ...r, ...patch } : r));

  const doImport = async () => {
    setBusy(true);
    try {
      await addExpenses(rows.map(r => ({ date: r.date, amount: r.amount, description: r.description, category: r.category, method: 'Yape' })));
      reaccionar('importado');
      toast({ emoji:'📲', type:'good', title:`${rows.length} gastos importados`, msg:'Ya están en tu historial.' });
      onNav('history');
    } catch(e) {
      toast({ emoji:'❌', title:'Error al importar', msg: e.message });
    } finally {
      setBusy(false);
    }
  };

  const th = { textAlign:'left', padding:'10px 14px', fontSize:12, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.04em', whiteSpace:'nowrap' };
  const td = { padding:'10px 14px', verticalAlign:'middle' };

  return (
    <div className="view-in" style={{ maxWidth: rows ? 860 : 600, margin:'0 auto' }}>
      <div className="col" style={{ gap:6, marginBottom:18 }}>
        <h1 className="h-page">Registrar gastos de Yape 📲</h1>
        <p className="muted" style={{ fontSize:14.5 }}>Escribe cada gasto en una línea. La app los clasifica sola.</p>
      </div>

      {!rows ? (
        <div className="card card-pad col" style={{ gap:18 }}>

          {/* formato */}
          <div style={{ background:'var(--primary-tint)', border:'1px solid color-mix(in srgb,var(--primary) 25%,transparent)', borderRadius:14, padding:'14px 16px' }}>
            <p style={{ fontWeight:700, fontSize:13.5, color:'var(--primary)', marginBottom:8 }}>Formato por línea:</p>
            <code style={{ fontSize:15, fontWeight:800, color:'var(--text)', letterSpacing:'.01em' }}>DD/MM &nbsp; monto &nbsp; descripción</code>
            <div className="col" style={{ gap:4, marginTop:10 }}>
              {[
                ['31/05','35','comida'],
                ['30/05','4.50','pasaje combi'],
                ['29/05','120','alquiler'],
                ['28/05','18','farmacia'],
              ].map(([d,a,desc]) => (
                <div key={d+a} className="row" style={{ gap:16, fontFamily:'ui-monospace,monospace', fontSize:13, color:'var(--text-2)' }}>
                  <span style={{ minWidth:46, color:'var(--primary)', fontWeight:700 }}>{d}</span>
                  <span style={{ minWidth:40, fontWeight:700 }}>{a}</span>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="label">Tus gastos de Yape</label>
            <textarea
              className="input"
              rows={8}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={"31/05  35  comida\n31/05  4.50  pasaje\n30/05  120  alquiler"}
              style={{ fontFamily:'ui-monospace,monospace', fontSize:14, lineHeight:1.8, resize:'vertical' }}
              autoFocus
            />
          </div>

          <button className="btn btn-primary btn-lg" disabled={!text.trim()} onClick={analyze} style={{ alignSelf:'flex-end' }}>
            <Icon name="upload" size={17} />Leer movimientos
          </button>
        </div>
      ) : (
        <div className="col" style={{ gap:14 }}>
          <div className="row between wrap" style={{ gap:10 }}>
            <span className="pill pill-good"><Icon name="check" size={14} />{rows.length} movimientos listos</span>
            <button className="link tiny" onClick={() => setRows(null)}>← Editar</button>
          </div>

          <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:580 }}>
                <thead>
                  <tr style={{ background:'var(--surface-2)', borderBottom:'1px solid var(--border)' }}>
                    <th style={th}>Fecha</th>
                    <th style={th}>Descripción</th>
                    <th style={th}>Categoría</th>
                    <th style={{ ...th, textAlign:'right' }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r._id} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={td}><span className="num tiny" style={{ fontWeight:600 }}>{r.date.slice(5).replace('-','/')}</span></td>
                      <td style={td}>
                        <input
                          className="input"
                          value={r.description}
                          onChange={e => setRow(r._id, { description: e.target.value, category: detectCat(e.target.value) })}
                          style={{ padding:'6px 10px', fontSize:13, minWidth:160 }}
                        />
                      </td>
                      <td style={td}>
                        <select
                          className="select"
                          value={r.category}
                          onChange={e => setRow(r._id, { category: e.target.value })}
                          style={{ padding:'6px 10px', fontSize:13, borderRadius:8, background:'var(--surface-2)', border:'1px solid var(--border)', color:'var(--text)', fontFamily:'inherit' }}
                        >
                          {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
                        </select>
                      </td>
                      <td style={{ ...td, textAlign:'right' }}>
                        <span className="num" style={{ fontWeight:700 }}>{money(r.amount)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="row between wrap" style={{ gap:10 }}>
            <span className="muted tiny num">Total: <b style={{ color:'var(--text)' }}>{money(rows.reduce((a,r) => a+r.amount, 0))}</b></span>
            <button className="btn btn-primary btn-lg" disabled={busy} onClick={doImport}>
              <Icon name="download" size={18} />{busy ? 'Guardando…' : `Guardar ${rows.length} gastos`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
