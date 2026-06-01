'use client';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/components/UI';
import Icon from './Icons';
import { PALETTES, applyAccent } from '@/lib/palettes';
import * as store from '@/lib/store';
import { supabase } from '@/lib/supabaseClient';

function Avatar({ profile, user, size = 80 }) {
  const name     = profile?.name || user?.email?.split('@')[0] || 'U';
  const initials = profile?.initials || name.slice(0, 2).toUpperCase();
  const avatar   = profile?.avatar_url;
  if (avatar) {
    return (
      <img src={avatar} alt="avatar"
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover',
          border: '3px solid var(--primary)', display: 'block' }} />
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--primary)',
      color: 'var(--on-primary)', display: 'grid', placeItems: 'center',
      fontSize: size * 0.35, fontWeight: 800, flex: 'none' }}>
      {initials}
    </div>
  );
}

function PasswordSection({ user }) {
  const pushToast = useToast();
  const [curr,  setCurr]  = useState('');
  const [newP,  setNewP]  = useState('');
  const [conf,  setConf]  = useState('');
  const [errors, setErrors] = useState({});
  const [busy,  setBusy]  = useState(false);

  const validate = () => {
    const e = {};
    if (!curr)                          e.curr = 'Ingresa tu contraseña actual';
    if (newP.length < 6)                e.newP = 'Mínimo 6 caracteres';
    if (newP !== conf)                  e.conf = 'Las contraseñas no coinciden';
    if (curr && newP && curr === newP)  e.newP = 'La nueva contraseña debe ser diferente a la actual';
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setBusy(true);
    setErrors({});
    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({ email: user.email, password: curr });
      if (authErr) { setErrors({ curr: 'Contraseña actual incorrecta' }); setBusy(false); return; }
      const { error } = await supabase.auth.updateUser({ password: newP });
      if (error) throw error;
      pushToast({ title: 'Contraseña actualizada', emoji: '🔐', type: 'good' });
      setCurr(''); setNewP(''); setConf('');
    } catch (err) {
      pushToast({ title: 'Error al cambiar contraseña', emoji: '✕', msg: err.message });
    } finally {
      setBusy(false);
    }
  };

  const fieldErr = (key) => errors[key] && (
    <span className="tiny" style={{ color: 'var(--danger)', marginTop: 2 }}>{errors[key]}</span>
  );

  return (
    <div className="card card-pad col" style={{ gap: 16 }}>
      <div className="row" style={{ gap: 10, alignItems: 'center' }}>
        <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--warn-tint)', color: 'var(--warn)', display: 'grid', placeItems: 'center' }}>
          <Icon name="lock" size={19} />
        </span>
        <div>
          <h2 className="h-sec" style={{ margin: 0 }}>Cambiar contraseña</h2>
          <p className="tiny muted" style={{ margin: 0 }}>Actualiza tu contraseña de acceso</p>
        </div>
      </div>

      <div className="field">
        <label className="label">Contraseña actual</label>
        <input type="password" className="input" value={curr} placeholder="Tu contraseña actual"
          onChange={e => { setCurr(e.target.value); setErrors(x => ({ ...x, curr: undefined })); }} />
        {fieldErr('curr')}
      </div>

      <div className="field">
        <label className="label">Nueva contraseña</label>
        <input type="password" className="input" value={newP} placeholder="Mínimo 6 caracteres"
          onChange={e => { setNewP(e.target.value); setErrors(x => ({ ...x, newP: undefined, conf: undefined })); }} />
        {fieldErr('newP')}
      </div>

      <div className="field">
        <label className="label">Confirmar nueva contraseña</label>
        <input type="password" className="input" value={conf} placeholder="Repite la nueva contraseña"
          onChange={e => { setConf(e.target.value); setErrors(x => ({ ...x, conf: undefined })); }} />
        {fieldErr('conf')}
      </div>

      <button className="btn btn-primary" onClick={submit} disabled={busy || !curr || !newP || !conf}>
        <Icon name="lock" size={16} />
        {busy ? 'Verificando…' : 'Cambiar contraseña'}
      </button>
    </div>
  );
}

export default function Settings() {
  const { user, profile, updateProfile } = useApp();
  const pushToast = useToast();

  const [name,      setName]      = useState(profile?.name || '');
  const [savingName, setSavingName] = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [accentId,   setAccentId]   = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('gastos_accent') || 'teal';
    return 'teal';
  });

  const fileRef = useRef();

  // keep name in sync if profile loads after mount
  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile?.name]);

  const handleSaveName = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSavingName(true);
    try {
      const initials = trimmed.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      await updateProfile({ name: trimmed, initials });
      pushToast({ title: 'Nombre actualizado', emoji: '✓', type: 'good' });
    } catch {
      pushToast({ title: 'Error al guardar', emoji: '✕' });
    } finally {
      setSavingName(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      pushToast({ title: 'Imagen muy grande', msg: 'Máximo 3 MB', emoji: '⚠️' });
      return;
    }
    setUploading(true);
    try {
      const url = await store.uploadAvatar(file);
      await updateProfile({ avatar_url: url });
      pushToast({ title: 'Foto actualizada', emoji: '✓', type: 'good' });
    } catch {
      pushToast({ title: 'Error al subir la foto', msg: 'Verifica el bucket avatars en Supabase', emoji: '✕' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAccent = async (id) => {
    setAccentId(id);
    localStorage.setItem('gastos_accent', id);
    applyAccent(id);
    try {
      await updateProfile({ accent_color: id });
    } catch {
      // non-fatal: color already applied locally
    }
  };

  const currentPalette = PALETTES.find(p => p.id === accentId) || PALETTES[0];

  return (
    <div className="view-in col" style={{ gap: 24, maxWidth: 600 }}>
      <h1 className="h-page">Configuración</h1>

      {/* ── FOTO DE PERFIL ── */}
      <div className="card card-pad col" style={{ gap: 20 }}>
        <div className="row" style={{ gap: 10, alignItems: 'center' }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-tint)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
            <Icon name="camera" size={19} />
          </span>
          <h2 className="h-sec" style={{ margin: 0 }}>Foto de perfil</h2>
        </div>

        <div className="row" style={{ gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 'none' }}>
            <Avatar profile={profile} user={user} size={80} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%',
                background: 'var(--surface)', border: '2px solid var(--border)', cursor: 'pointer',
                display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <Icon name="camera" size={13} />
            </button>
          </div>
          <div className="col" style={{ gap: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Icon name="camera" size={15} />
              {uploading ? 'Subiendo…' : 'Cambiar foto'}
            </button>
            <span className="tiny muted">JPG, PNG o WEBP · máx. 3 MB</span>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }} onChange={handleAvatarChange} />
        </div>
      </div>

      {/* ── NOMBRE ── */}
      <div className="card card-pad col" style={{ gap: 16 }}>
        <div className="row" style={{ gap: 10, alignItems: 'center' }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-tint)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
            <Icon name="user" size={19} />
          </span>
          <h2 className="h-sec" style={{ margin: 0 }}>Nombre</h2>
        </div>
        <div className="field">
          <label className="label">Nombre para mostrar</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)}
            placeholder="Tu nombre" onKeyDown={e => e.key === 'Enter' && handleSaveName()} />
        </div>
        <button className="btn btn-primary" onClick={handleSaveName}
          disabled={savingName || !name.trim()}>
          {savingName ? 'Guardando…' : 'Guardar nombre'}
        </button>
      </div>

      {/* ── COLOR DE ACENTO ── */}
      <div className="card card-pad col" style={{ gap: 16 }}>
        <div className="row" style={{ gap: 10, alignItems: 'center' }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-tint)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
            <Icon name="palette" size={19} />
          </span>
          <div>
            <h2 className="h-sec" style={{ margin: 0 }}>Color del sistema</h2>
            <p className="tiny muted" style={{ margin: 0 }}>Cambia el color principal de la app al instante</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {PALETTES.map(p => {
            const active = accentId === p.id;
            return (
              <button key={p.id} onClick={() => handleAccent(p.id)} title={p.name}
                style={{
                  width: 44, height: 44, borderRadius: '50%', background: p.swatch,
                  border: active ? '3px solid var(--text)' : '3px solid transparent',
                  cursor: 'pointer', display: 'grid', placeItems: 'center',
                  boxShadow: active
                    ? `0 0 0 2px var(--bg), 0 0 0 4px ${p.swatch}`
                    : 'var(--shadow-sm)',
                  transition: 'box-shadow .18s, border-color .18s',
                }}>
                {active && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        <div className="row" style={{ gap: 10, alignItems: 'center' }}>
          <div style={{ width: 22, height: 22, borderRadius: 7, background: currentPalette.swatch, flex: 'none' }} />
          <span style={{ fontSize: 14, fontWeight: 700 }}>{currentPalette.name} seleccionado</span>
        </div>
      </div>

      {/* ── CUENTA ── */}
      <div className="card card-pad col" style={{ gap: 12 }}>
        <div className="row" style={{ gap: 10, alignItems: 'center' }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-tint)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
            <Icon name="user" size={19} />
          </span>
          <h2 className="h-sec" style={{ margin: 0 }}>Cuenta</h2>
        </div>
        <div style={{ fontSize: 14, padding: '4px 0' }}>
          <span className="muted">Email: </span>
          <span style={{ fontWeight: 600 }}>{user?.email}</span>
        </div>
      </div>

      {/* ── CAMBIAR CONTRASEÑA ── */}
      <PasswordSection user={user} />
    </div>
  );
}
