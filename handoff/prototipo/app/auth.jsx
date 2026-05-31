/* ============================================================
   Auth — Login / Registro / Recuperar contraseña
   ============================================================ */
(function () {
  const { useState } = React;
  const Icon = window.Icon;

  function Logo({ size = 38 }) {
    return (
      <div className="row" style={{ gap: 11 }}>
        <div style={{ width:size, height:size, borderRadius: size*0.3, background:'var(--primary)', display:'grid', placeItems:'center', boxShadow:'0 4px 14px color-mix(in srgb, var(--primary) 40%, transparent)' }}>
          <Icon name="wallet" size={size*0.55} color="var(--on-primary)" />
        </div>
        <div className="col" style={{ lineHeight:1 }}>
          <span style={{ fontWeight:800, fontSize:size*0.5, letterSpacing:'-.03em' }}>GASTOS</span>
          <span style={{ fontSize:size*0.26, fontWeight:600, color:'var(--muted)', letterSpacing:'.02em' }}>tu plata, bajo control</span>
        </div>
      </div>
    );
  }

  function Field({ label, icon, type='text', value, onChange, placeholder, rightToggle }) {
    const [show, setShow] = useState(false);
    const t = rightToggle && show ? 'text' : type;
    return (
      <div className="field">
        <label className="label">{label}</label>
        <div style={{ position:'relative' }}>
          {icon && <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--faint)' }}><Icon name={icon} size={18} /></span>}
          <input className="input" type={t} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{ paddingLeft: icon?42:14, paddingRight: rightToggle?42:14 }} />
          {rightToggle && <button type="button" onClick={()=>setShow(s=>!s)} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--faint)', padding:6 }}><Icon name="eye" size={18} /></button>}
        </div>
      </div>
    );
  }

  function Auth({ onLogin }) {
    const [mode, setMode] = useState('login'); // login | register | recover
    const [name, setName] = useState('');
    const [email, setEmail] = useState('camila@correo.pe');
    const [pass, setPass] = useState('demo1234');
    const [sent, setSent] = useState(false);

    const submit = (e) => {
      e.preventDefault();
      if (mode === 'recover') { setSent(true); return; }
      const initials = (name || 'Camila Rojas').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
      if (mode === 'register' && name) window.Store.setUser({ name, email, initials });
      onLogin();
    };

    return (
      <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr', placeItems:'stretch' }}>
        <div className="auth-grid" style={{ display:'grid', gridTemplateColumns:'1.05fr 1fr', minHeight:'100vh' }}>
          {/* left: brand panel */}
          <div className="auth-aside" style={{ background:'linear-gradient(155deg, var(--primary-700), var(--primary) 65%, var(--primary-600))', padding:'48px 56px', color:'#fff', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <div style={{ position:'absolute', width:420, height:420, borderRadius:'50%', background:'rgba(255,255,255,.07)', top:-120, right:-120 }} />
            <div style={{ position:'absolute', width:260, height:260, borderRadius:'50%', background:'rgba(132,204,22,.18)', bottom:-80, left:-60 }} />
            <div style={{ position:'relative' }}>
              <div className="row" style={{ gap:11 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:'rgba(255,255,255,.16)', display:'grid', placeItems:'center' }}><Icon name="wallet" size={22} color="#fff" /></div>
                <span style={{ fontWeight:800, fontSize:22, letterSpacing:'-.03em' }}>GASTOS</span>
              </div>
            </div>
            <div style={{ position:'relative', maxWidth:420 }}>
              <h1 style={{ color:'#fff', fontSize:36, fontWeight:800, lineHeight:1.08, letterSpacing:'-.03em' }}>Deja el Excel.<br/>Controla tu plata sin esfuerzo.</h1>
              <p style={{ fontSize:16, lineHeight:1.5, color:'rgba(255,255,255,.85)', marginTop:16 }}>Registra tus gastos de Yape y efectivo en segundos, mira a dónde se va tu sueldo y ahorra más cada mes.</p>
              <div className="row" style={{ gap:22, marginTop:30, flexWrap:'wrap' }}>
                {[['📲','Importa tu Yape'],['💵','No pierdas el efectivo'],['🐷','Ahorra con metas']].map(([e,t])=>(
                  <div key={t} className="row" style={{ gap:9 }}><span style={{ fontSize:20 }}>{e}</span><span style={{ fontWeight:600, fontSize:14, color:'rgba(255,255,255,.92)' }}>{t}</span></div>
                ))}
              </div>
            </div>
            <div style={{ position:'relative', fontSize:13, color:'rgba(255,255,255,.7)' }}>Hecho en Perú · S/ Soles</div>
          </div>

          {/* right: form */}
          <div style={{ display:'grid', placeItems:'center', padding:'40px 24px', background:'var(--bg)' }}>
            <div style={{ width:'100%', maxWidth:380 }}>
              <div className="auth-logo-mobile" style={{ marginBottom:28, display:'none' }}><Logo /></div>
              {mode !== 'recover' && (
                <form onSubmit={submit} className="col" style={{ gap:18 }}>
                  <div>
                    <h2 className="h-page">{mode==='login' ? '¡Hola de nuevo! 👋' : 'Crea tu cuenta'}</h2>
                    <p className="muted" style={{ marginTop:6, fontSize:14.5 }}>{mode==='login' ? 'Ingresa para ver cómo va tu mes.' : 'Empieza a controlar tus gastos hoy.'}</p>
                  </div>
                  {mode==='register' && <Field label="Nombre completo" icon="user" value={name} onChange={setName} placeholder="Ej. Camila Rojas" />}
                  <Field label="Correo" icon="mail" type="email" value={email} onChange={setEmail} placeholder="tucorreo@correo.pe" />
                  <Field label="Contraseña" icon="lock" type="password" value={pass} onChange={setPass} placeholder="••••••••" rightToggle />
                  {mode==='login' && <div className="row between"><label className="row tiny" style={{ gap:7, cursor:'pointer', fontWeight:600, color:'var(--text-2)' }}><input type="checkbox" defaultChecked style={{ accentColor:'var(--primary)' }} />Recordarme</label><span className="link tiny" onClick={()=>{setMode('recover');setSent(false);}}>¿Olvidaste tu contraseña?</span></div>}
                  <button className="btn btn-primary btn-lg" type="submit" style={{ width:'100%', marginTop:4 }}>{mode==='login' ? 'Ingresar' : 'Crear cuenta'}<Icon name="chevR" size={18} /></button>
                  <div className="row" style={{ gap:10, color:'var(--faint)' }}><div className="hr grow" /><span className="tiny">o</span><div className="hr grow" /></div>
                  <p className="tiny muted" style={{ textAlign:'center' }}>
                    {mode==='login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                    <span className="link" onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login' ? 'Regístrate gratis' : 'Inicia sesión'}</span>
                  </p>
                </form>
              )}
              {mode === 'recover' && (
                <form onSubmit={submit} className="col" style={{ gap:18 }}>
                  <button type="button" className="link tiny row" style={{ gap:5 }} onClick={()=>setMode('login')}><Icon name="chevL" size={15} />Volver</button>
                  {!sent ? (<>
                    <div><h2 className="h-page">Recupera tu acceso</h2><p className="muted" style={{ marginTop:6, fontSize:14.5 }}>Te enviaremos un enlace para crear una nueva contraseña.</p></div>
                    <Field label="Correo" icon="mail" type="email" value={email} onChange={setEmail} placeholder="tucorreo@correo.pe" />
                    <button className="btn btn-primary btn-lg" type="submit" style={{ width:'100%' }}>Enviar enlace</button>
                  </>) : (
                    <div className="col" style={{ alignItems:'center', textAlign:'center', gap:14, padding:'20px 0' }}>
                      <span style={{ width:60, height:60, borderRadius:18, background:'var(--good-tint)', color:'var(--good)', display:'grid', placeItems:'center' }}><Icon name="mail" size={28} /></span>
                      <h2 className="h-sec">Revisa tu correo 📬</h2>
                      <p className="muted" style={{ fontSize:14 }}>Enviamos instrucciones a <b style={{color:'var(--text)'}}>{email}</b> para restablecer tu contraseña.</p>
                      <button className="btn btn-ghost" type="button" onClick={()=>setMode('login')}>Volver a ingresar</button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  window.Auth = Auth;
  window.Logo = Logo;
})();
