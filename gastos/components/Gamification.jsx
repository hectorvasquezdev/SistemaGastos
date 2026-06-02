'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useMascota, SKINS, ACCESORIOS } from './Mascota';
import { Ring, ProgressBar, SectionHead } from './UI';
import Icon from './Icons';

const BADGES = [
  { id:'ahorrador',   emoji:'⭐', name:'Ahorrador del mes',    desc:'¡Ahorraste más de lo que planeaste este mes!',
    como:'Registra un ahorro mayor a tu meta mensual. Ve a Presupuesto → categoría Ahorro y asegúrate de que lo registrado supere el objetivo.',
    reward:{ tipo:'skin', id:'dorado',   label:'Chanchito Dorado ✨' }},
  { id:'presupuesto', emoji:'🏆', name:'Presupuesto cumplido', desc:'¡Te mantuviste dentro de todos tus límites!',
    como:'Termina el mes sin pasarte en ninguna categoría de presupuesto. Si una categoría está en rojo, reduce tus gastos ahí.',
    reward:{ tipo:'acc',  id:'corona',   label:'Corona Real 👑' }},
  { id:'racha7',      emoji:'🔥', name:'7 días seguidos',      desc:'¡Registraste gastos 7 días sin falta!',
    como:'Entra a la app y registra al menos un gasto o ingreso cada día durante 7 días consecutivos.',
    reward:{ tipo:'acc',  id:'sombrero', label:'Sombrero Mago 🎩' }},
  { id:'meta',        emoji:'💰', name:'Ahorraste de más',     desc:'¡Superaste tu meta de ahorro del mes!',
    como:'Registra ahorros que superen el monto objetivo configurado en tu presupuesto de ahorro mensual.',
    reward:{ tipo:'skin', id:'rosa',     label:'Chanchito Rosa 💖' }},
  { id:'control',     emoji:'🚀', name:'Control mejorado',     desc:'¡Gastaste menos que el mes pasado!',
    como:'Cierra el mes con un total de gastos menor al mes anterior. Revisa el historial para comparar.',
    reward:{ tipo:'acc',  id:'gafas',    label:'Gafas Cool 🕶️' }},
  { id:'efectivo',    emoji:'💵', name:'Maestro del efectivo', desc:'¡Tienes todo tu efectivo registrado!',
    como:'Registra todos tus gastos en efectivo usando el método "Efectivo" al agregar un gasto. No dejes ninguno sin anotar.',
    reward:{ tipo:'acc',  id:'mono',     label:'Moño Rosa 🎀' }},
];

const SUPER_BADGE = {
  id:'maestro', emoji:'💜', name:'Maestro Chanchito', desc:'¡Desbloqueaste todas las insignias!',
  como:'Consigue las 6 insignias anteriores en cualquier orden.',
  reward:{ tipo:'skin', id:'morado', label:'Chanchito VIP 💜' },
};

function MiniChanchito({ skinId, accId, size = 72 }) {
  const skinData = SKINS[skinId]     || SKINS.default;
  const accData  = ACCESORIOS[accId] || ACCESORIOS.none;
  const fs = Math.round(size * 0.52);
  const accFs = Math.round(size * 0.33);
  const accTop = Math.round(size * -0.2);
  const accRight = Math.round(size * -0.13);

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `color-mix(in srgb, ${skinData.color} 18%, var(--surface))`,
      border: `3px solid color-mix(in srgb, ${skinData.color} 45%, transparent)`,
      display: 'grid', placeItems: 'center',
      fontSize: fs,
      position: 'relative',
      flexShrink: 0,
      boxShadow: skinData.glow,
      transition: 'box-shadow .3s ease, background .3s ease, border-color .3s ease',
    }}>
      🐷
      {accData.emoji && (
        <div style={{
          position: 'absolute', top: accTop, right: accRight,
          fontSize: accFs, lineHeight: 1,
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,.25))',
          pointerEvents: 'none',
        }}>
          {accData.emoji}
        </div>
      )}
    </div>
  );
}

export default function Gamification() {
  const { stats, achievements, money } = useApp();
  const { skin, acc, equipSkin, equipAcc } = useMascota();
  const [unlockAnim, setUnlockAnim] = useState(null);
  const s = stats();

  const unlocked = new Set(achievements);
  if (s.ahorroDiff >= 0)                     unlocked.add('meta');
  if (s.exceeded.length === 0)               unlocked.add('presupuesto');
  if (s.ahorroReal > s.ahorroEsperado)       unlocked.add('ahorrador');

  const earned = BADGES.filter(b => unlocked.has(b.id)).length;
  if (earned >= BADGES.length)               unlocked.add('maestro');

  const streak   = 0;
  const savePct  = s.ahorroEsperado ? Math.min(100, Math.round(s.ahorroReal / s.ahorroEsperado * 100)) : 0;
  const extra    = Math.max(0, s.ahorroReal - s.ahorroEsperado);

  const skinData = SKINS[skin]     || SKINS.default;
  const accData  = ACCESORIOS[acc] || ACCESORIOS.none;

  function handleEquip(badge) {
    if (badge.reward.tipo === 'skin') equipSkin(badge.reward.id);
    else                              equipAcc(badge.reward.id);
    setUnlockAnim(badge.id);
    setTimeout(() => setUnlockAnim(null), 800);
  }

  function isEquipped(badge) {
    return badge.reward.tipo === 'skin' ? skin === badge.reward.id : acc === badge.reward.id;
  }

  const ALL_BADGES = [...BADGES, SUPER_BADGE];

  return (
    <div className="view-in">
      <div className="col" style={{ gap: 6, marginBottom: 18 }}>
        <h1 className="h-page">Tus logros 🏆</h1>
        <p className="muted" style={{ fontSize: 14.5 }}>Ahorrar también puede ser divertido. ¡Sigue sumando!</p>
      </div>

      {/* ── stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 16, marginBottom: 16 }} className="dash-charts">
        {/* streak */}
        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center', background: 'linear-gradient(160deg, var(--warn-tint), transparent)' }}>
          <div style={{ fontSize: 46, lineHeight: 1 }}>🔥</div>
          <div className="col" style={{ gap: 2 }}>
            <span className="num" style={{ fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{streak}</span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>días de racha</span>
          </div>
          <p className="tiny muted" style={{ margin: 0 }}>Registra gastos todos los días para aumentar tu racha.</p>
        </div>

        {/* savings ring */}
        <div className="card card-pad">
          <SectionHead icon="coins" title="Meta de ahorro del mes" />
          <div className="row" style={{ gap: 20, alignItems: 'center' }}>
            <Ring pct={savePct} size={104} stroke={11} color="var(--lime)">
              <div className="col" style={{ alignItems: 'center' }}>
                <span className="num" style={{ fontSize: 22, fontWeight: 800 }}>{savePct}%</span>
              </div>
            </Ring>
            <div className="col grow" style={{ gap: 10 }}>
              <div className="col" style={{ gap: 3 }}>
                <span className="tiny muted">Ahorrado</span>
                <span className="num" style={{ fontWeight: 800, fontSize: 22 }}>
                  {money(s.ahorroReal)} <span className="muted" style={{ fontSize: 14, fontWeight: 600 }}>/ {money(s.ahorroEsperado)}</span>
                </span>
              </div>
              <ProgressBar pct={savePct} color="var(--lime)" height={11} />
              {extra > 0
                ? <span className="pill pill-good" style={{ width: 'fit-content' }}>⭐ ¡{money(extra)} extra ahorrado!</span>
                : <span className="tiny muted">Te faltan {money(Math.max(0, s.ahorroEsperado - s.ahorroReal))} para tu meta 💪</span>
              }
            </div>
          </div>
        </div>
      </div>

      {/* ── motivational banner ── */}
      {extra > 0 && (
        <div className="card card-pad" style={{ marginBottom: 16, display: 'flex', gap: 14, alignItems: 'center', background: 'linear-gradient(120deg, var(--lime-tint), transparent)', border: '1px solid color-mix(in srgb,var(--lime) 30%,transparent)' }}>
          <span style={{ fontSize: 30 }}>🎉</span>
          <p style={{ margin: 0, fontSize: 15.5, fontWeight: 600, lineHeight: 1.4 }}>¡Excelente! Ahorraste <b className="num">{money(extra)}</b> más de lo presupuestado este mes. ¡Ganaste una estrella! ⭐</p>
        </div>
      )}

      {/* ── tu chanchito (preview + equipo activo) ── */}
      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <SectionHead icon="star" title="Tu Chanchito" sub="Personaliza con tus recompensas desbloqueadas" />
        <div className="row" style={{ gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <MiniChanchito skinId={skin} accId={acc} size={80} />
          <div className="col grow" style={{ gap: 8, minWidth: 160 }}>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              <span className="pill pill-primary" style={{ fontSize: 12 }}>
                🎨 {skinData.nombre}
              </span>
              {accData.emoji
                ? <span className="pill pill-good" style={{ fontSize: 12 }}>
                    {accData.emoji} {accData.nombre}
                  </span>
                : <span className="pill" style={{ fontSize: 12, color: 'var(--faint)' }}>Sin accesorio</span>
              }
            </div>
            <p className="tiny muted" style={{ margin: 0 }}>
              Gana insignias para desbloquear nuevos looks. Toca <b>Equipar</b> en cualquier recompensa.
            </p>
            {acc !== 'none' && (
              <button className="btn btn-sm btn-ghost" style={{ width: 'fit-content', fontSize: 12 }}
                onClick={() => equipAcc('none')}>
                Quitar accesorio
              </button>
            )}
            {skin !== 'default' && (
              <button className="btn btn-sm btn-ghost" style={{ width: 'fit-content', fontSize: 12 }}
                onClick={() => equipSkin('default')}>
                Skin normal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── badges ── */}
      <div className="card card-pad">
        <SectionHead icon="trophy" title="Insignias" sub={`${earned} de ${BADGES.length} desbloqueadas`}
          right={<span className="pill pill-primary">{earned}/{BADGES.length}</span>} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(168px,1fr))', gap: 12 }}>
          {ALL_BADGES.map(b => {
            const on      = unlocked.has(b.id);
            const equip   = on && isEquipped(b);
            const isMaestro = b.id === 'maestro';
            const popping   = unlockAnim === b.id;

            return (
              <div key={b.id} className="col" style={{
                alignItems: 'center', textAlign: 'center', gap: 8,
                padding: '20px 14px', borderRadius: 16,
                border: `1px solid ${equip ? 'color-mix(in srgb,var(--lime) 40%,transparent)' : isMaestro && on ? 'color-mix(in srgb,#7c3aed 35%,transparent)' : 'var(--border)'}`,
                background: equip ? 'var(--lime-tint)' : on ? 'var(--surface-2)' : 'var(--surface)',
                position: 'relative', opacity: on ? 1 : .55,
                transition: 'transform .15s ease, box-shadow .15s ease',
                transform: popping ? 'scale(1.04)' : 'none',
                boxShadow: equip ? '0 0 0 2px color-mix(in srgb,var(--lime) 40%,transparent)' : 'none',
              }}>
                {/* emoji circle */}
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  display: 'grid', placeItems: 'center', fontSize: 28,
                  background: on ? (isMaestro ? 'color-mix(in srgb,#7c3aed 18%,var(--surface))' : 'var(--gold-tint)') : 'var(--surface-3)',
                  border: `2px solid ${on ? (isMaestro ? 'color-mix(in srgb,#7c3aed 35%,transparent)' : 'var(--gold)') : 'transparent'}`,
                  filter: on ? 'none' : 'grayscale(1)',
                  animation: on ? 'ringPop .4s ease both' : 'none',
                }}>
                  {b.emoji}
                </div>

                <span style={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.3 }}>{b.name}</span>
                {on
                  ? <span className="tiny muted" style={{ lineHeight: 1.4 }}>{b.desc}</span>
                  : <span className="tiny" style={{ lineHeight: 1.45, color: 'var(--text-2)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--warn)', display: 'block', marginBottom: 2 }}>¿Cómo ganarla?</span>
                      {b.como}
                    </span>
                }

                {/* reward info */}
                <div style={{
                  fontSize: 11.5, fontWeight: 700,
                  color: on ? 'var(--primary)' : 'var(--faint)',
                  background: on ? 'var(--primary-tint)' : 'var(--surface-3)',
                  borderRadius: 99, padding: '3px 9px',
                  lineHeight: 1.6,
                }}>
                  {on ? '🔓 ' : '🔒 '}{b.reward.label}
                </div>

                {/* equip button */}
                {on && (
                  equip
                    ? <span className="pill pill-good" style={{ fontSize: 11, padding: '3px 9px' }}>✓ Equipado</span>
                    : <button className="btn btn-sm btn-primary" style={{ fontSize: 12, padding: '6px 14px' }}
                        onClick={() => handleEquip(b)}>
                        Equipar
                      </button>
                )}

                {/* corner indicator */}
                {on
                  ? <span className="pill pill-good" style={{ position: 'absolute', top: 10, right: 10, padding: '3px 7px' }}>
                      <Icon name="check" size={12} />
                    </span>
                  : <span style={{ position: 'absolute', top: 12, right: 12, color: 'var(--faint)' }}>
                      <Icon name="lock" size={14} />
                    </span>
                }
              </div>
            );
          })}
        </div>

        {/* super badge hint */}
        {!unlocked.has('maestro') && (
          <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 12, background: 'var(--surface-3)', display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 22 }}>💜</span>
            <p className="tiny muted" style={{ margin: 0, lineHeight: 1.5 }}>
              Desbloquea las <b>6 insignias</b> para obtener la recompensa secreta: <b>Chanchito VIP</b>.
              Te faltan <b>{BADGES.length - earned}</b>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
