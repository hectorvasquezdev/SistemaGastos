'use client';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import Icon from './Icons';

// ── ProgressBar ─────────────────────────────────────────────────
export function ProgressBar({ pct, color, height = 9 }) {
  const w = Math.min(100, Math.max(0, pct || 0));
  return (
    <div className="track" style={{ height }}>
      <div className="track-fill" style={{ width: w + '%', background: color || 'var(--primary)' }} />
    </div>
  );
}

// ── Ring ─────────────────────────────────────────────────────────
export function Ring({ pct, size = 64, stroke = 8, color = 'var(--primary)', track = 'var(--surface-3)', children }) {
  const r   = (size - stroke) / 2;
  const c   = 2 * Math.PI * r;
  const off = c - Math.min(100, Math.max(0, pct || 0)) / 100 * c;
  return (
    <div style={{ position:'relative', width:size, height:size, flex:'none' }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition:'stroke-dashoffset .7s cubic-bezier(.22,1,.36,1)' }} />
      </svg>
      {children && <div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center' }}>{children}</div>}
    </div>
  );
}

// ── StatCard ─────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon, tone = 'default' }) {
  const tones = {
    default: { bg:'var(--surface)',  ic:'var(--primary)',    icbg:'var(--primary-tint)' },
    primary: { bg:'var(--primary)',  ic:'var(--on-primary)', icbg:'rgba(255,255,255,.18)', text:'var(--on-primary)' },
    good:    { bg:'var(--surface)',  ic:'var(--good)',       icbg:'var(--good-tint)' },
    warn:    { bg:'var(--surface)',  ic:'var(--warn)',       icbg:'var(--warn-tint)' },
  };
  const t = tones[tone] || tones.default;
  const isP = tone === 'primary';
  return (
    <div className="card card-pad" style={{ background:t.bg, color:t.text||'var(--text)', border:isP?'none':undefined, boxShadow:isP?'var(--shadow)':undefined, display:'flex', flexDirection:'column', gap:14 }}>
      <div className="row between">
        <span style={{ fontSize:12.5, fontWeight:700, letterSpacing:'.04em', textTransform:'uppercase', color:isP?'rgba(255,255,255,.8)':'var(--muted)' }}>{label}</span>
        {icon && <span style={{ width:34, height:34, borderRadius:10, background:t.icbg, display:'grid', placeItems:'center', color:t.ic }}><Icon name={icon} size={18} /></span>}
      </div>
      <div className="col" style={{ gap:3 }}>
        <div className="num" style={{ fontSize:27, fontWeight:800, letterSpacing:'-.03em', lineHeight:1 }}>{value}</div>
        {sub && <div style={{ fontSize:13, fontWeight:600, color:isP?'rgba(255,255,255,.82)':'var(--muted)' }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── SectionHead ──────────────────────────────────────────────────
export function SectionHead({ icon, title, sub, right }) {
  return (
    <div className="row between" style={{ marginBottom:16, gap:12 }}>
      <div className="row" style={{ gap:12 }}>
        {icon && <span style={{ width:40, height:40, borderRadius:12, background:'var(--primary-tint)', color:'var(--primary)', display:'grid', placeItems:'center' }}><Icon name={icon} size={21} /></span>}
        <div className="col">
          <h2 className="h-sec">{title}</h2>
          {sub && <span className="tiny muted">{sub}</span>}
        </div>
      </div>
      {right}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────
export function Modal({ open, onClose, children, title, width = 480 }) {
  useEffect(() => {
    const esc = e => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(10,16,14,.5)', backdropFilter:'blur(3px)', display:'grid', placeItems:'center', padding:16, animation:'viewIn .2s ease' }}>
      <div onClick={e => e.stopPropagation()} className="card" style={{ width:'100%', maxWidth:width, boxShadow:'var(--shadow-lg)', animation:'popIn .25s cubic-bezier(.22,1,.36,1)', maxHeight:'90vh', overflow:'auto' }}>
        {title && (
          <div className="row between" style={{ padding:'18px 20px', borderBottom:'1px solid var(--border)' }}>
            <h3 className="h-sec">{title}</h3>
            <button className="btn btn-icon btn-ghost" onClick={onClose}><Icon name="x" size={18} /></button>
          </div>
        )}
        <div style={{ padding:20 }}>{children}</div>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────
const ToastCtx = createContext(() => {});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback(t => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { id, ...t }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), t.duration || 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', zIndex:300, display:'flex', flexDirection:'column', gap:10, alignItems:'center', pointerEvents:'none' }}>
        {toasts.map(t => (
          <div key={t.id} className="card" style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:12, boxShadow:'var(--shadow-lg)', animation:'toastIn .3s cubic-bezier(.22,1,.36,1)', minWidth:240, maxWidth:'90vw', borderColor:t.type==='good'?'var(--good)':'var(--border)' }}>
            <span style={{ width:30, height:30, borderRadius:9, flex:'none', display:'grid', placeItems:'center', background:t.type==='good'?'var(--good-tint)':'var(--primary-tint)', color:t.type==='good'?'var(--good)':'var(--primary)', fontSize:16 }}>{t.emoji || '✓'}</span>
            <div className="col" style={{ gap:1 }}>
              <span style={{ fontWeight:700, fontSize:14 }}>{t.title}</span>
              {t.msg && <span className="tiny muted">{t.msg}</span>}
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export function useToast() { return useContext(ToastCtx); }

// ── Empty ─────────────────────────────────────────────────────────
export function Empty({ icon = 'list', title, sub }) {
  return (
    <div className="col" style={{ alignItems:'center', justifyContent:'center', padding:'48px 20px', textAlign:'center', gap:10 }}>
      <span style={{ width:56, height:56, borderRadius:16, background:'var(--surface-3)', color:'var(--faint)', display:'grid', placeItems:'center' }}><Icon name={icon} size={26} /></span>
      <div className="h-sec">{title}</div>
      {sub && <div className="muted tiny" style={{ maxWidth:280 }}>{sub}</div>}
    </div>
  );
}

// ── StateBadge ────────────────────────────────────────────────────
export function StateBadge({ state }) {
  const map = {
    good:   { cls:'pill-good',   label:'En presupuesto', dot:'var(--good)' },
    soft:   { cls:'pill',        label:'Atención',       dot:'var(--warn)' },
    warn:   { cls:'pill-warn',   label:'Cerca del límite', dot:'var(--warn)' },
    danger: { cls:'pill-danger', label:'Excedido',       dot:'var(--danger)' },
  };
  const m = map[state] || map.good;
  return <span className={'pill ' + m.cls}><span className="dot" style={{ background:m.dot }} />{m.label}</span>;
}
