'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import Icon from './Icons';
import { Modal, Empty, useToast } from './UI';

function EditModal({ exp, onClose }) {
  const toast = useToast();
  const { categories, updateExpense, money, METHODS } = useApp();
  const [f, setF] = useState({ ...exp });
  const save = async () => {
    await updateExpense(exp.id, { amount:parseFloat(f.amount)||0, category:f.category, method:f.method, date:f.date, description:f.description, comment:f.comment||'' });
    toast({ emoji:'✏️', type:'good', title:'Gasto actualizado' });
    onClose();
  };
  return (
    <Modal open onClose={onClose} title="Editar gasto">
      <div className="col" style={{ gap:14 }}>
        <div className="edit-2col">
          <div className="field"><label className="label">Monto</label><input className="input num" value={f.amount} onChange={e => setF({...f, amount:e.target.value.replace(/[^0-9.]/g,'')})} /></div>
          <div className="field"><label className="label">Fecha</label><input type="date" className="input num" value={f.date} onChange={e => setF({...f, date:e.target.value})} /></div>
        </div>
        <div className="field"><label className="label">Categoría</label>
          <select className="input select" value={f.category} onChange={e => setF({...f, category:e.target.value})}>
            {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div className="field"><label className="label">Método</label>
          <select className="input select" value={f.method} onChange={e => setF({...f, method:e.target.value})}>
            {METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="field"><label className="label">Descripción</label><input className="input" value={f.description} onChange={e => setF({...f, description:e.target.value})} /></div>
        <div className="row" style={{ gap:10, marginTop:4 }}>
          <button className="btn btn-ghost grow" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary grow" onClick={save}>Guardar cambios</button>
        </div>
      </div>
    </Modal>
  );
}

const thStyle = { textAlign:'left', padding:'13px 16px', fontSize:12, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.04em', whiteSpace:'nowrap' };
const tdStyle = { padding:'13px 16px', verticalAlign:'middle' };

function Th({ children, onClick, sort, k, right }) {
  return (
    <th onClick={onClick} style={{ ...thStyle, cursor:'pointer', textAlign:right?'right':'left' }}>
      <span className="row" style={{ gap:4, display:'inline-flex', color:sort.key===k?'var(--primary)':undefined }}>
        {children}
        {sort.key===k && <Icon name={sort.dir==='asc'?'arrowUp':'arrowDown'} size={13} />}
      </span>
    </th>
  );
}

export default function History() {
  const toast = useToast();
  const { monthExpenses, categories, deleteExpense, money, METHODS, catById } = useApp();
  const [q,        setQ]        = useState('');
  const [fCat,     setFCat]     = useState('all');
  const [fMethod,  setFMethod]  = useState('all');
  const [sort,     setSort]     = useState({ key:'date', dir:'desc' });
  const [editing,  setEditing]  = useState(null);
  const [confirm,  setConfirm]  = useState(null);

  const exp = monthExpenses();

  const rows = useMemo(() => {
    let r = exp.filter(e => {
      if (fCat !== 'all' && e.category !== fCat) return false;
      if (fMethod !== 'all' && e.method !== fMethod) return false;
      if (q) {
        const c = catById(e.category) || {};
        const t = (e.description + ' ' + (e.comment||'') + ' ' + c.name).toLowerCase();
        if (!t.includes(q.toLowerCase())) return false;
      }
      return true;
    });
    r.sort((a,b) => {
      let av, bv;
      if (sort.key === 'amount') { av=a.amount; bv=b.amount; } else { av=a.date; bv=b.date; }
      const c = av<bv?-1:av>bv?1:0;
      return sort.dir === 'asc' ? c : -c;
    });
    return r;
  }, [exp, q, fCat, fMethod, sort, catById]);

  const total     = rows.reduce((s,e) => s + e.amount, 0);
  const toggleSort = key => setSort(s => s.key===key ? { key, dir:s.dir==='asc'?'desc':'asc' } : { key, dir:'desc' });
  const fmtDate   = iso => new Date(iso+'T00:00').toLocaleDateString('es-PE', { day:'2-digit', month:'short' });

  const METHOD_META = { Yape:'📲', Efectivo:'💵', 'Tarjeta de débito':'💳', 'Tarjeta de crédito':'💳', Transferencia:'🏦', Otro:'•' };

  return (
    <div className="view-in">
      <div className="row between wrap" style={{ gap:12, marginBottom:18 }}>
        <div className="col" style={{ gap:6 }}>
          <h1 className="h-page">Historial</h1>
          <p className="muted" style={{ fontSize:14.5 }}>{rows.length} movimientos · {money(total)} en total</p>
        </div>
      </div>

      {/* filtros */}
      <div className="card card-pad" style={{ marginBottom:16, display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' }}>
        <div className="field grow" style={{ minWidth:200 }}>
          <label className="label">Buscar</label>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--faint)' }}><Icon name="search" size={17} /></span>
            <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por palabra clave…" style={{ paddingLeft:40 }} />
          </div>
        </div>
        <div className="field" style={{ minWidth:160 }}>
          <label className="label">Categoría</label>
          <select className="input select" value={fCat} onChange={e => setFCat(e.target.value)}>
            <option value="all">Todas</option>
            {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div className="field" style={{ minWidth:150 }}>
          <label className="label">Método</label>
          <select className="input select" value={fMethod} onChange={e => setFMethod(e.target.value)}>
            <option value="all">Todos</option>
            {METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        {(q || fCat!=='all' || fMethod!=='all') && (
          <button className="btn btn-ghost" onClick={() => { setQ(''); setFCat('all'); setFMethod('all'); }}><Icon name="x" size={16} />Limpiar</button>
        )}
      </div>

      {/* tabla */}
      <div className="card" style={{ overflow:'hidden' }}>
        {rows.length === 0 ? <Empty icon="search" title="Sin resultados" sub="Prueba quitar filtros o registrar un gasto nuevo." /> : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:640 }}>
              <thead>
                <tr style={{ background:'var(--surface-2)', borderBottom:'1px solid var(--border)' }}>
                  <Th onClick={() => toggleSort('date')} sort={sort} k="date">Fecha</Th>
                  <th style={thStyle}>Descripción</th>
                  <th style={thStyle}>Categoría</th>
                  <th style={thStyle}>Método</th>
                  <Th onClick={() => toggleSort('amount')} sort={sort} k="amount" right>Monto</Th>
                  <th style={{ ...thStyle, width:90 }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(e => {
                  const c = catById(e.category) || {};
                  return (
                    <tr key={e.id} style={{ borderBottom:'1px solid var(--border)' }} className="hist-row">
                      <td style={tdStyle}><span className="num" style={{ fontWeight:600, fontSize:13.5 }}>{fmtDate(e.date || e.spent_at)}</span></td>
                      <td style={tdStyle}>
                        <div className="col">
                          <span style={{ fontWeight:600, fontSize:14 }}>{e.description}</span>
                          {e.source==='yape' && <span className="tiny" style={{ color:'var(--faint)' }}>importado de Yape</span>}
                        </div>
                      </td>
                      <td style={tdStyle}><span className="pill" style={{ background:'var(--surface-3)' }}><span style={{ fontSize:14 }}>{c.icon}</span>{c.name}</span></td>
                      <td style={tdStyle}>
                        <div className="col" style={{ gap:2 }}>
                          <span className="row" style={{ gap:6, fontSize:13.5, fontWeight:600 }}><span>{METHOD_META[e.method]}</span>{e.method}</span>
                          {e.method === 'Tarjeta de crédito' && e.payment_date && (
                            <span className="tiny" style={{ color:'#dc2626' }}>Pago: {fmtDate(e.payment_date)}</span>
                          )}
                        </div>
                      </td>
                      <td style={{ ...tdStyle, textAlign:'right' }}><span className="num" style={{ fontWeight:700, fontSize:14.5 }}>{money(e.amount)}</span></td>
                      <td style={{ ...tdStyle, textAlign:'right' }}>
                        <div className="row" style={{ gap:4, justifyContent:'flex-end' }}>
                          <button className="btn btn-icon btn-ghost row-act" onClick={() => setEditing(e)}><Icon name="edit" size={16} /></button>
                          <button className="btn btn-icon btn-ghost row-act" onClick={() => setConfirm(e)}><Icon name="trash" size={16} color="var(--danger)" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && <EditModal exp={editing} onClose={() => setEditing(null)} />}
      {confirm && (
        <Modal open onClose={() => setConfirm(null)} title="Eliminar gasto" width={400}>
          <p style={{ fontSize:14.5, lineHeight:1.5, marginTop:0 }}>¿Seguro que quieres eliminar <b>{confirm.description}</b> ({money(confirm.amount)})? Esta acción no se puede deshacer.</p>
          <div className="row" style={{ gap:10, marginTop:8 }}>
            <button className="btn btn-ghost grow" onClick={() => setConfirm(null)}>Cancelar</button>
            <button className="btn grow" style={{ background:'var(--danger)', color:'#fff' }}
              onClick={async () => { await deleteExpense(confirm.id); toast({ emoji:'🗑️', title:'Gasto eliminado' }); setConfirm(null); }}>
              Eliminar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
