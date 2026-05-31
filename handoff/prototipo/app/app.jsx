/* ============================================================
   App shell — navegación, tema, routing
   ============================================================ */
(function () {
  const { useState, useEffect } = React;
  const Icon = window.Icon;
  const { useToast, Modal } = window;

  const NAV = [
    { id:'dash',    label:'Inicio',          icon:'home' },
    { id:'add',     label:'Registrar',       icon:'plus' },
    { id:'history', label:'Historial',       icon:'list' },
    { id:'budget',  label:'Presupuesto',     icon:'target' },
    { id:'cash',    label:'Efectivo',        icon:'cash' },
    { id:'yape',    label:'Importar Yape',   icon:'upload' },
    { id:'reports', label:'Reporte',         icon:'report' },
    { id:'achiev',  label:'Logros',          icon:'trophy' },
  ];
  const MOBILE_PRIMARY = ['dash','history','add','cash','achiev'];

  function useTheme() {
    const [theme, setTheme] = useState(() => localStorage.getItem('gastos_theme') || 'light');
    useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('gastos_theme', theme); }, [theme]);
    return [theme, () => setTheme(t => t==='light'?'dark':'light')];
  }

  function MonthPicker() {
    const [open, setOpen] = useState(false);
    const db = window.Store.db;
    const now = new Date();
    const months = [];
    for (let i=0;i<6;i++){ const d=new Date(now.getFullYear(), now.getMonth()-i, 1); months.push({ m:d.getMonth(), y:d.getFullYear() }); }
    return (
      <div style={{ position:'relative' }}>
        <button className="btn btn-ghost btn-sm" onClick={()=>setOpen(o=>!o)}><Icon name="calendar" size={16} />{window.Store.monthLabel()}<Icon name="chevD" size={15} /></button>
        {open && <>
          <div style={{ position:'fixed', inset:0, zIndex:40 }} onClick={()=>setOpen(false)} />
          <div className="card" style={{ position:'absolute', top:'calc(100% + 6px)', right:0, zIndex:50, padding:6, minWidth:180, boxShadow:'var(--shadow-lg)' }}>
            {months.map(({m,y})=>(
              <button key={m+'-'+y} onClick={()=>{ window.Store.setMonth(m,y); setOpen(false); }} className="btn btn-sm" style={{ width:'100%', justifyContent:'flex-start', background: m===db.month&&y===db.year?'var(--primary-tint)':'transparent', color: m===db.month&&y===db.year?'var(--primary)':'var(--text)' }}>{window.Store.MONTH_NAMES[m]} {y}</button>
            ))}
          </div>
        </>}
      </div>
    );
  }

  function Sidebar({ view, onNav, theme, toggleTheme }) {
    return (
      <aside className="sidebar" style={{ width:'var(--sidebar-w)', flex:'none', background:'var(--surface)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh' }}>
        <div style={{ padding:'20px 18px 16px' }}><window.Logo size={34} /></div>
        <nav className="col" style={{ gap:3, padding:'4px 12px', flex:1, overflowY:'auto' }}>
          {NAV.map(n=>{
            const active = view===n.id || (n.id==='achiev'&&view==='achiev');
            const isAdd = n.id==='add';
            return (
              <button key={n.id} onClick={()=>onNav(n.id)} className="btn" style={{
                justifyContent:'flex-start', gap:12, padding:'11px 13px', borderRadius:11, fontSize:14.5,
                background: active?(isAdd?'var(--primary)':'var(--primary-tint)'):(isAdd?'var(--primary)':'transparent'),
                color: isAdd?'var(--on-primary)':active?'var(--primary)':'var(--text-2)',
                fontWeight: active?700:600, marginTop: isAdd?4:0, marginBottom: isAdd?4:0,
                boxShadow: isAdd?'0 2px 8px color-mix(in srgb,var(--primary) 35%,transparent)':'none',
              }}>
                <Icon name={n.icon} size={19} />{n.label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding:12, borderTop:'1px solid var(--border)' }}>
          <button className="btn btn-ghost" onClick={toggleTheme} style={{ width:'100%', justifyContent:'flex-start', gap:12 }}><Icon name={theme==='light'?'moon':'sun'} size={18} />{theme==='light'?'Modo oscuro':'Modo claro'}</button>
        </div>
      </aside>
    );
  }

  function UserMenu({ onLogout }) {
    const [open, setOpen] = useState(false);
    const u = window.Store.db.user;
    return (
      <div style={{ position:'relative' }}>
        <button onClick={()=>setOpen(o=>!o)} className="row" style={{ gap:9, background:'none', border:'none', cursor:'pointer', padding:'4px 6px 4px 4px', borderRadius:99 }}>
          <span style={{ width:36, height:36, borderRadius:'50%', background:'var(--primary)', color:'var(--on-primary)', display:'grid', placeItems:'center', fontWeight:800, fontSize:14 }}>{u.initials}</span>
          <span className="user-name" style={{ fontWeight:700, fontSize:14 }}>{u.name.split(' ')[0]}</span>
          <Icon name="chevD" size={15} color="var(--muted)" />
        </button>
        {open && <>
          <div style={{ position:'fixed', inset:0, zIndex:40 }} onClick={()=>setOpen(false)} />
          <div className="card" style={{ position:'absolute', top:'calc(100% + 8px)', right:0, zIndex:50, padding:6, minWidth:220, boxShadow:'var(--shadow-lg)' }}>
            <div style={{ padding:'10px 12px' }}><div style={{ fontWeight:700, fontSize:14 }}>{u.name}</div><div className="tiny muted">{u.email}</div></div>
            <hr className="hr" />
            <button className="btn btn-sm" style={{ width:'100%', justifyContent:'flex-start', color:'var(--text)' }} onClick={()=>{ window.Store.reset(); setOpen(false); }}><Icon name="settings" size={16} />Reiniciar datos demo</button>
            <button className="btn btn-sm" style={{ width:'100%', justifyContent:'flex-start', color:'var(--danger)' }} onClick={onLogout}><Icon name="logout" size={16} />Cerrar sesión</button>
          </div>
        </>}
      </div>
    );
  }

  function MobileNav({ view, onNav }) {
    return (
      <nav className="mobile-nav" style={{ display:'none', position:'fixed', bottom:0, left:0, right:0, zIndex:80, background:'var(--surface)', borderTop:'1px solid var(--border)', padding:'8px 8px calc(8px + env(safe-area-inset-bottom))', justifyContent:'space-around' }}>
        {MOBILE_PRIMARY.map(id=>{
          const n = NAV.find(x=>x.id===id);
          const active = view===id;
          const isAdd = id==='add';
          if (isAdd) return <button key={id} onClick={()=>onNav(id)} style={{ background:'var(--primary)', color:'var(--on-primary)', border:'none', width:52, height:52, borderRadius:'50%', display:'grid', placeItems:'center', marginTop:-22, boxShadow:'0 6px 16px color-mix(in srgb,var(--primary) 45%,transparent)', cursor:'pointer' }}><Icon name="plus" size={26} /></button>;
          return (
            <button key={id} onClick={()=>onNav(id)} className="col" style={{ alignItems:'center', gap:3, background:'none', border:'none', cursor:'pointer', color: active?'var(--primary)':'var(--muted)', padding:'4px 8px', flex:1 }}>
              <Icon name={n.icon} size={21} />
              <span style={{ fontSize:10.5, fontWeight:700 }}>{n.label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  function MoreSheet({ open, onClose, view, onNav, theme, toggleTheme }) {
    if (!open) return null;
    const extra = NAV.filter(n=>!MOBILE_PRIMARY.includes(n.id));
    return (
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:120, background:'rgba(10,16,14,.5)', display:'flex', alignItems:'flex-end' }}>
        <div onClick={e=>e.stopPropagation()} className="card" style={{ width:'100%', borderRadius:'20px 20px 0 0', padding:'10px 14px calc(20px + env(safe-area-inset-bottom))', animation:'toastIn .3s ease' }}>
          <div style={{ width:40, height:4, borderRadius:99, background:'var(--border-2)', margin:'6px auto 14px' }} />
          {extra.map(n=>(
            <button key={n.id} onClick={()=>{onNav(n.id);onClose();}} className="btn" style={{ width:'100%', justifyContent:'flex-start', gap:12, padding:'13px', color: view===n.id?'var(--primary)':'var(--text)', fontSize:15 }}><Icon name={n.icon} size={20} />{n.label}</button>
          ))}
          <hr className="hr" style={{ margin:'8px 0' }} />
          <button className="btn" style={{ width:'100%', justifyContent:'flex-start', gap:12, padding:'13px', fontSize:15 }} onClick={toggleTheme}><Icon name={theme==='light'?'moon':'sun'} size={20} />{theme==='light'?'Modo oscuro':'Modo claro'}</button>
        </div>
      </div>
    );
  }

  function App() {
    const [authed, setAuthed] = useState(() => localStorage.getItem('gastos_authed') === '1');
    const [view, setView] = useState('dash');
    const [theme, toggleTheme] = useTheme();
    const [more, setMore] = useState(false);
    const [, force] = useState(0);

    useEffect(() => window.Store.subscribe(() => force(x=>x+1)), []);
    useEffect(() => { window.scrollTo(0,0); }, [view]);

    const login = () => { localStorage.setItem('gastos_authed','1'); setAuthed(true); setView('dash'); };
    const logout = () => { localStorage.removeItem('gastos_authed'); setAuthed(false); };
    const nav = (v) => setView(v==='achiev'?'achiev':v);

    if (!authed) return <window.Auth onLogin={login} />;

    const screens = {
      dash: <window.Dashboard onNav={nav} />,
      add: <window.RegisterExpense onNav={nav} />,
      history: <window.History />,
      budget: <window.Budget />,
      cash: <window.Cash onNav={nav} />,
      yape: <window.ImportYape onNav={nav} />,
      reports: <window.Reports onNav={nav} />,
      achiev: <window.Gamification />,
    };
    const title = (NAV.find(n=>n.id===view)||{}).label;

    return (
      <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
        <Sidebar view={view} onNav={nav} theme={theme} toggleTheme={toggleTheme} />
        <div className="grow" style={{ minWidth:0, display:'flex', flexDirection:'column' }}>
          {/* topbar */}
          <header className="topbar" style={{ position:'sticky', top:0, zIndex:30, background:'color-mix(in srgb, var(--bg) 88%, transparent)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--border)', padding:'12px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <div className="row" style={{ gap:12 }}>
              <span className="mobile-logo" style={{ display:'none' }}><window.Logo size={30} /></span>
              <h1 className="topbar-title" style={{ fontSize:20, fontWeight:800, letterSpacing:'-.02em' }}>{title}</h1>
            </div>
            <div className="row" style={{ gap:10 }}>
              <MonthPicker />
              <button className="btn btn-icon btn-ghost theme-btn" onClick={toggleTheme} style={{ display:'none' }}><Icon name={theme==='light'?'moon':'sun'} size={18} /></button>
              <UserMenu onLogout={logout} />
            </div>
          </header>
          <main style={{ padding:'24px', flex:1, paddingBottom:'100px' }}>
            <div style={{ maxWidth:1200, margin:'0 auto' }}>{screens[view]}</div>
          </main>
        </div>
        <MobileNav view={view} onNav={(v)=> v===view&&v==='dash'?setMore(true):nav(v)} />
        <button className="more-btn" onClick={()=>setMore(true)} style={{ display:'none', position:'fixed', top:11, right:64, zIndex:35, background:'var(--surface-3)', border:'none', borderRadius:10, padding:9, cursor:'pointer', color:'var(--text)' }}><Icon name="menu" size={20} /></button>
        <MoreSheet open={more} onClose={()=>setMore(false)} view={view} onNav={nav} theme={theme} toggleTheme={toggleTheme} />
      </div>
    );
  }

  function Root() { return <window.ToastProvider><App /></window.ToastProvider>; }
  window.GastosApp = Root;
})();
