'use client';
import { useState } from 'react';
import Icon from './Icons';
import { registrar, iniciarSesion, recuperarPassword } from '@/lib/store';

function Field({ label, icon, type = 'text', value, onChange, placeholder, rightToggle }) {
  const [show, setShow] = useState(false);
  const t = rightToggle && show ? 'text' : type;
  return (
    <div className="field">
      <label style={{ fontSize:12, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:6 }}>{label}</label>
      <div style={{ position:'relative' }}>
        {icon && <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--faint)' }}><Icon name={icon} size={17} /></span>}
        <input className="input" type={t} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ paddingLeft: icon ? 44 : 16, paddingRight: rightToggle ? 44 : 16, height:48, borderRadius:12, fontSize:15 }} />
        {rightToggle && (
          <button type="button" onClick={() => setShow(s => !s)}
            style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--faint)', padding:6 }}>
            <Icon name="eye" size={17} />
          </button>
        )}
      </div>
    </div>
  );
}

const FEATURES = [
  { icon:'📊', text:'Dashboard en tiempo real' },
  { icon:'📲', text:'Importa movimientos de Yape' },
  { icon:'🎯', text:'Presupuesto por categorías' },
  { icon:'🐷', text:'Metas de ahorro inteligentes' },
];

export default function Auth() {
  const [mode,  setMode]  = useState('login');
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  const [sent,  setSent]  = useState(false);
  const [err,   setErr]   = useState('');
  const [busy,  setBusy]  = useState(false);

  const submit = async e => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      if (mode === 'recover') {
        await recuperarPassword(email); setSent(true);
      } else if (mode === 'register') {
        const { error } = await registrar({ email, password: pass, name });
        if (error) throw error;
        const { error: e2 } = await iniciarSesion({ email, password: pass });
        if (e2) throw e2;
      } else {
        const { error } = await iniciarSesion({ email, password: pass });
        if (error) throw error;
      }
    } catch (e) {
      setErr(e.message || 'Algo salió mal. Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes auth-fadein { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes auth-line   { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes auth-blob   { 0%,100%{border-radius:60% 40% 55% 45%/50% 60% 40% 50%} 50%{border-radius:40% 60% 45% 55%/60% 40% 60% 40%} }
        .auth-form-wrap { animation: auth-fadein .45s ease-out both; }
        .auth-btn-main  { transition: transform .15s, box-shadow .15s; }
        .auth-btn-main:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(15,118,110,.35); }
        .auth-btn-main:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      <div style={{ minHeight:'100vh', display:'grid', background:'var(--bg)' }}>
        <div className="auth-grid" style={{ display:'grid', minHeight:'100vh' }}>

          {/* ── LEFT PANEL ── */}
          <div style={{
            background:'#060f0d',
            padding:'52px 56px',
            color:'#fff',
            position:'relative',
            overflow:'hidden',
            display:'flex',
            flexDirection:'column',
            justifyContent:'space-between',
            gap:40,
          }}>
            {/* blobs decorativos */}
            <div style={{ position:'absolute', width:380, height:380, background:'rgba(15,118,110,.25)', top:-100, right:-100, borderRadius:'60% 40% 55% 45%/50% 60% 40% 50%', animation:'auth-blob 12s ease-in-out infinite' }} />
            <div style={{ position:'absolute', width:260, height:260, background:'rgba(132,204,22,.1)', bottom:-80, left:-60, borderRadius:'40% 60% 45% 55%/60% 40% 60% 40%', animation:'auth-blob 15s ease-in-out infinite reverse' }} />
            <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 80% 20%, rgba(15,118,110,.15) 0%, transparent 60%)' }} />

            {/* logo */}
            <div style={{ position:'relative', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:42, height:42, borderRadius:13, background:'var(--primary)', display:'grid', placeItems:'center', fontSize:20, flexShrink:0 }}>🐷</div>
              <div>
                <div style={{ fontWeight:900, fontSize:20, letterSpacing:'-.03em', lineHeight:1 }}>GASTOS</div>
                <div style={{ fontSize:10.5, color:'rgba(255,255,255,.4)', fontWeight:700, letterSpacing:'.1em', marginTop:1 }}>FINANZAS PERSONALES</div>
              </div>
            </div>

            {/* headline */}
            <div style={{ position:'relative' }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.12em', color:'var(--lime-bright)', textTransform:'uppercase', marginBottom:16 }}>
                Control total de tu dinero
              </div>
              <h1 style={{ color:'#fff', fontSize:'clamp(32px,3.5vw,46px)', fontWeight:900, lineHeight:1.06, letterSpacing:'-.04em', margin:0 }}>
                Controla tus<br />
                <span style={{ color:'var(--lime-bright)' }}>finanzas</span> con<br />
                inteligencia.
              </h1>
              <div style={{ width:48, height:3, background:'var(--primary)', borderRadius:99, marginTop:22, transformOrigin:'left', animation:'auth-line .8s .3s ease-out both' }} />
              <p style={{ fontSize:15, lineHeight:1.7, color:'rgba(255,255,255,.55)', marginTop:20, maxWidth:360 }}>
                La app que te dice exactamente a dónde va cada sol de tu sueldo. Sin Excel, sin complicaciones.
              </p>
            </div>

            {/* features */}
            <div style={{ position:'relative', display:'flex', flexDirection:'column', gap:14 }}>
              {FEATURES.map((f, i) => (
                <div key={f.text} style={{ display:'flex', alignItems:'center', gap:14, animation:`auth-fadein .5s ${.3+i*.1}s ease-out both` }}>
                  <div style={{ width:38, height:38, borderRadius:11, background:'rgba(255,255,255,.07)', display:'grid', placeItems:'center', fontSize:18, flexShrink:0, border:'1px solid rgba(255,255,255,.08)' }}>
                    {f.icon}
                  </div>
                  <span style={{ fontSize:14.5, fontWeight:600, color:'rgba(255,255,255,.8)' }}>{f.text}</span>
                </div>
              ))}
            </div>

            {/* footer */}
            <a href="https://www.instagram.com/h_gandev/?hl=es" target="_blank" rel="noopener noreferrer"
              style={{ position:'relative', fontSize:12, color:'rgba(255,255,255,.3)', textDecoration:'none', display:'flex', alignItems:'center', gap:6, transition:'color .2s' }}
              onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,.6)'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.3)'}>
              Hecho por h_gandev &nbsp;·&nbsp; S/ Soles &nbsp;·&nbsp; 🇵🇪 Perú
            </a>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div style={{ display:'grid', placeItems:'center', padding:'48px 24px', background:'var(--bg)' }}>
            <div className="auth-form-wrap" style={{ width:'100%', maxWidth:400 }}>

              {/* logo mobile */}
              <div className="auth-logo-mobile" style={{ marginBottom:32, display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:38, height:38, borderRadius:11, background:'var(--primary)', display:'grid', placeItems:'center', fontSize:18 }}>🐷</div>
                <div style={{ fontWeight:900, fontSize:18, letterSpacing:'-.03em' }}>GASTOS</div>
              </div>

              {mode !== 'recover' && (
                <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:22 }}>

                  <div>
                    <h2 style={{ fontSize:28, fontWeight:900, letterSpacing:'-.04em', margin:0, color:'var(--text)' }}>
                      {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
                    </h2>
                    <p style={{ marginTop:6, fontSize:14.5, color:'var(--muted)', lineHeight:1.5 }}>
                      {mode === 'login'
                        ? 'Ingresa para revisar tu situación financiera.'
                        : 'Empieza a tomar control de tu dinero hoy.'}
                    </p>
                  </div>

                  {mode === 'register' && (
                    <Field label="Nombre completo" icon="user" value={name} onChange={setName} placeholder="Tu nombre" />
                  )}

                  <Field label="Correo electrónico" icon="mail" type="email" value={email} onChange={setEmail} placeholder="correo@ejemplo.com" />

                  <div>
                    <Field label="Contraseña" icon="lock" type="password" value={pass} onChange={setPass} placeholder="Mínimo 6 caracteres" rightToggle />
                    {mode === 'login' && (
                      <div style={{ textAlign:'right', marginTop:8 }}>
                        <span style={{ fontSize:13, fontWeight:600, color:'var(--primary)', cursor:'pointer' }}
                          onClick={() => { setMode('recover'); setSent(false); }}>
                          ¿Olvidaste tu contraseña?
                        </span>
                      </div>
                    )}
                  </div>

                  {err && (
                    <div style={{ background:'var(--danger-tint)', color:'var(--danger)', borderRadius:12, padding:'13px 16px', fontSize:13.5, fontWeight:600, display:'flex', gap:8 }}>
                      <span style={{ flexShrink:0 }}>⚠️</span>{err}
                    </div>
                  )}

                  <button className="btn-primary auth-btn-main" type="submit" disabled={busy} style={{
                    height:52, borderRadius:14, border:'none', cursor:busy?'not-allowed':'pointer',
                    background:'var(--primary)', color:'#fff', fontSize:16, fontWeight:800,
                    letterSpacing:'-.02em', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                    opacity: busy ? .7 : 1,
                  }}>
                    {busy ? 'Cargando…' : mode === 'login' ? 'Ingresar' : 'Crear cuenta gratuita'}
                    {!busy && <Icon name="chevR" size={18} />}
                  </button>

                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ flex:1, height:1, background:'var(--border)' }} />
                    <span style={{ fontSize:13, color:'var(--faint)', fontWeight:600 }}>
                      {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                    </span>
                    <div style={{ flex:1, height:1, background:'var(--border)' }} />
                  </div>

                  <button type="button" disabled={busy}
                    onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr(''); }}
                    style={{ height:48, borderRadius:14, border:'1.5px solid var(--border)', background:'transparent', cursor:'pointer', fontSize:15, fontWeight:700, color:'var(--text)', transition:'border-color .2s, background .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.background='var(--primary-tint)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='transparent'; }}>
                    {mode === 'login' ? 'Registrarme gratis' : 'Iniciar sesión'}
                  </button>
                </form>
              )}

              {mode === 'recover' && (
                <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:22 }}>
                  <button type="button" onClick={() => setMode('login')}
                    style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontSize:13, fontWeight:600, padding:0, width:'fit-content' }}>
                    <Icon name="chevL" size={15} />Volver
                  </button>

                  {!sent ? (
                    <>
                      <div>
                        <h2 style={{ fontSize:26, fontWeight:900, letterSpacing:'-.04em', margin:0 }}>Recuperar acceso</h2>
                        <p style={{ marginTop:6, fontSize:14.5, color:'var(--muted)', lineHeight:1.5 }}>Te enviaremos un enlace para restablecer tu contraseña.</p>
                      </div>
                      <Field label="Correo electrónico" icon="mail" type="email" value={email} onChange={setEmail} placeholder="correo@ejemplo.com" />
                      <button className="auth-btn-main" type="submit" disabled={busy} style={{
                        height:52, borderRadius:14, border:'none', cursor:busy?'not-allowed':'pointer',
                        background:'var(--primary)', color:'#fff', fontSize:16, fontWeight:800,
                      }}>
                        {busy ? 'Enviando…' : 'Enviar enlace'}
                      </button>
                    </>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:18, padding:'24px 0' }}>
                      <div style={{ width:72, height:72, borderRadius:22, background:'var(--good-tint)', display:'grid', placeItems:'center', fontSize:34 }}>📬</div>
                      <div>
                        <h2 style={{ fontSize:22, fontWeight:900, margin:'0 0 8px' }}>Revisa tu correo</h2>
                        <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.6, margin:0 }}>
                          Enviamos un enlace a <b style={{ color:'var(--text)' }}>{email}</b>.<br />Puede tardar unos minutos.
                        </p>
                      </div>
                      <button type="button" onClick={() => setMode('login')} style={{
                        height:48, borderRadius:14, border:'1.5px solid var(--border)', background:'transparent',
                        cursor:'pointer', fontSize:15, fontWeight:700, color:'var(--text)', width:'100%',
                      }}>
                        Volver al inicio
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
