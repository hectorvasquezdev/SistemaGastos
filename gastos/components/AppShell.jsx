'use client';
import { useState } from 'react';
import Icon from './Icons';
import { useApp } from '@/context/AppContext';
import { applyAccent } from '@/lib/palettes';

const NAV = [
  { id:'dash',    label:'Inicio',        icon:'home' },
  { id:'add',     label:'Registrar',     icon:'plus' },
  { id:'budget',  label:'Presupuesto',   icon:'target' },
  { id:'cash',    label:'Efectivo',      icon:'cash' },
  { id:'reports', label:'Reporte',       icon:'report' },
  { id:'history', label:'Historial',     icon:'list' },
  { id:'achiev',  label:'Logros',        icon:'trophy' },
];
const MOBILE_PRIMARY = ['dash', 'budget', 'add', 'reports', 'achiev'];

const VIEW_TITLES = {
  settings: 'Configuración',
  add:      'Registrar gasto',
  income:   'Ingresos',
};

function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('gastos_theme') || 'light';
    return 'light';
  });
  const toggle = () => {
    setTheme(t => {
      const next = t === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('gastos_theme', next);
      const accent = localStorage.getItem('gastos_accent') || 'teal';
      applyAccent(accent);
      return next;
    });
  };
  return [theme, toggle];
}

function MonthPicker() {
  const { month, year, setMonth, monthLabel, MONTH_NAMES } = useApp();
  const [open, setOpen] = useState(false);
  const now = new Date();
  const months = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ m: d.getMonth(), y: d.getFullYear() });
  }
  return (
    <div style={{ position:'relative' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => setOpen(o => !o)}>
        <Icon name="calendar" size={16} />{monthLabel()}<Icon name="chevD" size={15} />
      </button>
      {open && <>
        <div style={{ position:'fixed', inset:0, zIndex:40 }} onClick={() => setOpen(false)} />
        <div className="card" style={{ position:'absolute', top:'calc(100% + 6px)', right:0, zIndex:50, padding:6, minWidth:180, boxShadow:'var(--shadow-lg)' }}>
          {months.map(({ m, y }) => (
            <button key={m+'-'+y} onClick={() => { setMonth(m, y); setOpen(false); }} className="btn btn-sm"
              style={{ width:'100%', justifyContent:'flex-start', background: m===month&&y===year?'var(--primary-tint)':'transparent', color: m===month&&y===year?'var(--primary)':'var(--text)' }}>
              {MONTH_NAMES[m]} {y}
            </button>
          ))}
        </div>
      </>}
    </div>
  );
}

function UserAvatar({ profile, user, size = 36 }) {
  const name     = profile?.name || user?.email?.split('@')[0] || 'U';
  const initials = profile?.initials || name.slice(0, 2).toUpperCase();
  if (profile?.avatar_url) {
    return (
      <img src={profile.avatar_url} alt="avatar"
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flex: 'none', display: 'block' }} />
    );
  }
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: 'var(--primary)',
      color: 'var(--on-primary)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14, flex: 'none' }}>
      {initials}
    </span>
  );
}

function UserMenu({ onLogout, onNav }) {
  const { profile, user } = useApp();
  const [open, setOpen] = useState(false);
  const name = profile?.name || user?.email?.split('@')[0] || 'Usuario';
  return (
    <div style={{ position:'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ background:'none', border:'none', cursor:'pointer', padding:2, borderRadius:99, display:'grid', placeItems:'center' }}>
        <UserAvatar profile={profile} user={user} />
      </button>
      {open && <>
        <div style={{ position:'fixed', inset:0, zIndex:40 }} onClick={() => setOpen(false)} />
        <div className="card" style={{ position:'absolute', top:'calc(100% + 8px)', right:0, zIndex:50, padding:6, minWidth:220, boxShadow:'var(--shadow-lg)' }}>
          <div style={{ padding:'10px 12px' }}>
            <div style={{ fontWeight:700, fontSize:14 }}>{name}</div>
            <div className="tiny muted">{user?.email}</div>
          </div>
          <hr className="hr" />
          <button className="btn btn-sm" style={{ width:'100%', justifyContent:'flex-start' }}
            onClick={() => { onNav('settings'); setOpen(false); }}>
            <Icon name="settings" size={16} />Configuración
          </button>
          <button className="btn btn-sm" style={{ width:'100%', justifyContent:'flex-start', color:'var(--danger)' }}
            onClick={() => { onLogout(); setOpen(false); }}>
            <Icon name="logout" size={16} />Cerrar sesión
          </button>
        </div>
      </>}
    </div>
  );
}

function Sidebar({ view, onNav, theme, toggleTheme }) {
  const [subAdd, setSubAdd] = useState(false);
  const isAddActive = view === 'add' || view === 'income';

  return (
    <aside className="sidebar" style={{ width:'var(--sidebar-w)', flex:'none', background:'var(--surface)', borderRight:'1px solid var(--border)', flexDirection:'column', position:'sticky', top:0, height:'100vh' }}>
      <div style={{ padding:'20px 18px 16px' }}>
        <div className="row" style={{ gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:'var(--primary)', display:'grid', placeItems:'center' }}><Icon name="wallet" size={19} color="var(--on-primary)" /></div>
          <span style={{ fontWeight:800, fontSize:18, letterSpacing:'-.03em' }}>GASTOS</span>
        </div>
      </div>
      <nav className="col" style={{ gap:3, padding:'4px 12px', flex:1, overflowY:'auto' }}>
        {NAV.map(n => {
          if (n.id === 'add') {
            return (
              <div key="add" style={{ marginTop:4, marginBottom:4 }}>
                <button onClick={() => setSubAdd(o => !o)} className="btn" style={{
                  justifyContent:'flex-start', gap:12, padding:'11px 13px', borderRadius:11, fontSize:14.5, width:'100%',
                  background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 700,
                  boxShadow: '0 2px 8px color-mix(in srgb,var(--primary) 35%,transparent)',
                }}>
                  <Icon name="plus" size={19} />
                  Registrar
                  <Icon name="chevD" size={14} style={{ marginLeft:'auto', transition:'transform .2s', transform: subAdd ? 'rotate(180deg)' : 'none' }} />
                </button>
                {subAdd && (
                  <div className="col" style={{ gap:2, marginTop:4, paddingLeft:10 }}>
                    <button className="btn btn-sm" onClick={() => { onNav('add'); setSubAdd(false); }} style={{
                      justifyContent:'flex-start', gap:10, borderRadius:9,
                      background: view==='add' ? 'var(--primary-tint)' : 'transparent',
                      color: view==='add' ? 'var(--primary)' : 'var(--text-2)',
                      fontWeight: view==='add' ? 700 : 600,
                    }}>
                      <Icon name="arrowDown" size={15} />Registrar gasto
                    </button>
                    <button className="btn btn-sm" onClick={() => { onNav('income'); setSubAdd(false); }} style={{
                      justifyContent:'flex-start', gap:10, borderRadius:9,
                      background: view==='income' ? 'var(--primary-tint)' : 'transparent',
                      color: view==='income' ? 'var(--primary)' : 'var(--text-2)',
                      fontWeight: view==='income' ? 700 : 600,
                    }}>
                      <Icon name="arrowUp" size={15} />Registrar ingreso
                    </button>
                  </div>
                )}
              </div>
            );
          }

          const active = view === n.id;
          return (
            <button key={n.id} onClick={() => onNav(n.id)} className="btn" style={{
              justifyContent:'flex-start', gap:12, padding:'11px 13px', borderRadius:11, fontSize:14.5,
              background: active ? 'var(--primary-tint)' : 'transparent',
              color: active ? 'var(--primary)' : 'var(--text-2)',
              fontWeight: active ? 700 : 600,
            }}>
              <Icon name={n.icon} size={19} />{n.label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding:12, borderTop:'1px solid var(--border)' }}>
        <button className="btn btn-ghost" onClick={toggleTheme} style={{ width:'100%', justifyContent:'flex-start', gap:12 }}>
          <Icon name={theme==='light'?'moon':'sun'} size={18} />{theme==='light'?'Modo oscuro':'Modo claro'}
        </button>
      </div>
    </aside>
  );
}

function MobileNav({ view, onNav, onAddTap }) {
  return (
    <nav className="mobile-nav" style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:80, background:'var(--surface)', borderTop:'1px solid var(--border)', padding:'8px 8px calc(8px + env(safe-area-inset-bottom))', justifyContent:'space-around' }}>
      {MOBILE_PRIMARY.map(id => {
        const n = NAV.find(x => x.id === id);
        const active = view === id || (id === 'add' && (view === 'add' || view === 'income'));
        if (id === 'add') return (
          <button key={id} onClick={onAddTap} style={{ background: active ? 'var(--primary-700)' : 'var(--primary)', color:'var(--on-primary)', border:'none', width:52, height:52, borderRadius:'50%', display:'grid', placeItems:'center', marginTop:-22, boxShadow:'0 6px 16px color-mix(in srgb,var(--primary) 45%,transparent)', cursor:'pointer' }}>
            <Icon name="plus" size={26} />
          </button>
        );
        return (
          <button key={id} onClick={() => onNav(id)} className="col" style={{ alignItems:'center', gap:3, background:'none', border:'none', cursor:'pointer', color:active?'var(--primary)':'var(--muted)', padding:'4px 8px', flex:1 }}>
            <Icon name={n.icon} size={21} />
            <span style={{ fontSize:10.5, fontWeight:700 }}>{n.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function MobileAddSheet({ open, onClose, onNav }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:120, background:'rgba(10,16,14,.5)', display:'flex', alignItems:'flex-end' }}>
      <div onClick={e => e.stopPropagation()} className="card" style={{ width:'100%', borderRadius:'20px 20px 0 0', padding:'10px 16px calc(24px + env(safe-area-inset-bottom))', animation:'toastIn .3s ease' }}>
        <div style={{ width:40, height:4, borderRadius:99, background:'var(--border-2)', margin:'6px auto 18px' }} />
        <p style={{ fontWeight:800, fontSize:17, textAlign:'center', margin:'0 0 14px' }}>¿Qué quieres registrar?</p>
        <button onClick={() => { onNav('add'); onClose(); }} className="btn" style={{
          width:'100%', justifyContent:'flex-start', gap:14, padding:'16px', borderRadius:14, marginBottom:10,
          background:'var(--primary-tint)', color:'var(--primary)', border:'1.5px solid color-mix(in srgb,var(--primary) 25%,transparent)',
        }}>
          <span style={{ fontSize:26, lineHeight:1 }}>💸</span>
          <div className="col" style={{ gap:2, textAlign:'left' }}>
            <span style={{ fontWeight:800, fontSize:16 }}>Registrar gasto</span>
            <span className="tiny muted" style={{ fontWeight:500 }}>Anota lo que gastaste hoy</span>
          </div>
        </button>
        <button onClick={() => { onNav('income'); onClose(); }} className="btn" style={{
          width:'100%', justifyContent:'flex-start', gap:14, padding:'16px', borderRadius:14,
          background:'var(--lime-tint)', color:'var(--lime)', border:'1.5px solid color-mix(in srgb,var(--lime) 25%,transparent)',
        }}>
          <span style={{ fontSize:26, lineHeight:1 }}>💰</span>
          <div className="col" style={{ gap:2, textAlign:'left' }}>
            <span style={{ fontWeight:800, fontSize:16 }}>Registrar ingreso</span>
            <span className="tiny muted" style={{ fontWeight:500 }}>Sueldo, bono u otro ingreso</span>
          </div>
        </button>
      </div>
    </div>
  );
}

function MoreSheet({ open, onClose, view, onNav, theme, toggleTheme }) {
  if (!open) return null;
  const extra = NAV.filter(n => !MOBILE_PRIMARY.includes(n.id) && n.id !== 'add');
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:120, background:'rgba(10,16,14,.5)', display:'flex', alignItems:'flex-end' }}>
      <div onClick={e => e.stopPropagation()} className="card" style={{ width:'100%', borderRadius:'20px 20px 0 0', padding:'10px 14px calc(20px + env(safe-area-inset-bottom))', animation:'toastIn .3s ease' }}>
        <div style={{ width:40, height:4, borderRadius:99, background:'var(--border-2)', margin:'6px auto 14px' }} />
        {extra.map(n => (
          <button key={n.id} onClick={() => { onNav(n.id); onClose(); }} className="btn" style={{ width:'100%', justifyContent:'flex-start', gap:12, padding:'13px', color:view===n.id?'var(--primary)':'var(--text)', fontSize:15 }}>
            <Icon name={n.icon} size={20} />{n.label}
          </button>
        ))}
        <hr className="hr" style={{ margin:'8px 0' }} />
        <button className="btn" style={{ width:'100%', justifyContent:'flex-start', gap:12, padding:'13px', fontSize:15 }} onClick={toggleTheme}>
          <Icon name={theme==='light'?'moon':'sun'} size={20} />{theme==='light'?'Modo oscuro':'Modo claro'}
        </button>
      </div>
    </div>
  );
}

export default function AppShell({ view, onNav, children }) {
  const { logout } = useApp();
  const [theme, toggleTheme] = useTheme();
  const [more,      setMore]      = useState(false);
  const [mobileAdd, setMobileAdd] = useState(false);

  const title = VIEW_TITLES[view] || (NAV.find(n => n.id === view) || {}).label || '';

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      <Sidebar view={view} onNav={onNav} theme={theme} toggleTheme={toggleTheme} />
      <div className="grow" style={{ minWidth:0, display:'flex', flexDirection:'column' }}>
        {/* topbar */}
        <header className="topbar" style={{ position:'sticky', top:0, zIndex:30, background:'color-mix(in srgb, var(--bg) 88%, transparent)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--border)', padding:'12px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <div className="row" style={{ gap:12 }}>
            <span className="mobile-logo">
              <div className="row" style={{ gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:'var(--primary)', display:'grid', placeItems:'center' }}><Icon name="wallet" size={16} color="var(--on-primary)" /></div>
                <span style={{ fontWeight:800, fontSize:16 }}>GASTOS</span>
              </div>
            </span>
            <h1 className="topbar-title" style={{ fontSize:20, fontWeight:800, letterSpacing:'-.02em' }}>{title}</h1>
          </div>
          <div className="row" style={{ gap:10 }}>
            <MonthPicker />
            <UserMenu onLogout={logout} onNav={onNav} />
          </div>
        </header>

        <main style={{ padding:'24px', flex:1, paddingBottom:100 }}>
          <div style={{ maxWidth:1200, margin:'0 auto' }}>{children}</div>
        </main>
      </div>

      <MobileNav view={view} onNav={onNav} onAddTap={() => setMobileAdd(true)} />

      <button className="more-btn" onClick={() => setMore(true)}
        style={{ position:'fixed', top:11, right:64, zIndex:35, background:'var(--surface-3)', border:'none', borderRadius:10, padding:9, cursor:'pointer', color:'var(--text)' }}>
        <Icon name="menu" size={20} />
      </button>

      <MoreSheet open={more} onClose={() => setMore(false)} view={view} onNav={onNav} theme={theme} toggleTheme={toggleTheme} />
      <MobileAddSheet open={mobileAdd} onClose={() => setMobileAdd(false)} onNav={onNav} />
    </div>
  );
}
