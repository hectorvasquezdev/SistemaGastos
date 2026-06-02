'use client';
import { useState, useCallback, createContext, useContext, useRef, useEffect } from 'react';

const MascotaCtx = createContext(null);

// ── Recompensas visuales desbloqueables ─────────────────────────
export const SKINS = {
  default: { nombre: 'Normal',           color: 'var(--primary)', glow: '' },
  dorado:  { nombre: 'Chanchito Dorado', color: '#c9920a',        glow: '0 0 20px 6px rgba(201,146,10,.55)' },
  rosa:    { nombre: 'Chanchito Rosa',   color: '#db2777',        glow: '0 0 20px 6px rgba(219,39,119,.4)' },
  morado:  { nombre: 'Chanchito VIP',    color: '#7c3aed',        glow: '0 0 20px 6px rgba(124,58,237,.4)' },
};

export const ACCESORIOS = {
  none:     { nombre: 'Sin accesorio', emoji: '' },
  corona:   { nombre: 'Corona Real',   emoji: '👑' },
  mono:     { nombre: 'Moño Rosa',     emoji: '🎀' },
  sombrero: { nombre: 'Sombrero Mago', emoji: '🎩' },
  gafas:    { nombre: 'Gafas Cool',    emoji: '🕶️' },
  diamante: { nombre: 'Diamante',      emoji: '💎' },
};

const TIPS_GENERALES = [
  'Registra todos tus gastos, hasta el más pequeño cuenta. 💡',
  'Revisa tu presupuesto cada semana para no llevarte sorpresas. 📅',
  'El efectivo se va sin que te des cuenta. ¡Anótalo siempre! 💵',
  'Ahorrar S/ 50 al mes suma S/ 600 al año. Empieza hoy. 🐷',
  'Antes de comprar pregúntate: ¿lo necesito o solo lo quiero? 🤔',
  'La regla 50/30/20: 50% necesidades, 30% gustos, 20% ahorro. ✨',
  'Los gastos pequeños frecuentes son los que más dañan tu bolsillo. ☕',
  'Un presupuesto no te limita — te da libertad de gastar sin culpa. 🎯',
  'Paga primero tu ahorro, luego gasta lo que queda. 🐷',
  'Evita compras por impulso: espera 24 horas antes de decidir. ⏰',
  'Si puedes reducir S/ 10 diarios, ahorras S/ 300 al mes. 📈',
  'Compara precios antes de comprar. En Perú hay mucha diferencia entre tiendas. 🛒',
  'Tener un fondo de emergencia de 3 meses de gastos te da tranquilidad. 🛡️',
  'Los servicios que no usas (Netflix, gym) son dinero que se va solo. Cancélalos. 📵',
];

const ESTADOS = {
  idle:     { color: 'var(--primary)' },
  hablando: { color: 'var(--lime)' },
  alerta:   { color: 'var(--warn)' },
  celebra:  { color: '#9333ea' },
};

export function MascotaProvider({ children }) {
  const [mensaje,  setMensaje]  = useState('');
  const [estado,   setEstado]   = useState('idle');
  const [abierto,  setAbierto]  = useState(false);
  const [appStats, setAppStats] = useState(null);
  const [skin,     setSkin]     = useState('default');
  const [acc,      setAcc]      = useState('none');
  const timer  = useRef(null);
  const tipIdx = useRef(0);

  useEffect(() => {
    const s = localStorage.getItem('gastos_skin');
    const a = localStorage.getItem('gastos_acc');
    if (s && SKINS[s])      setSkin(s);
    if (a && ACCESORIOS[a]) setAcc(a);
  }, []);

  const equipSkin = useCallback((id) => {
    if (!SKINS[id]) return;
    setSkin(id);
    localStorage.setItem('gastos_skin', id);
  }, []);

  const equipAcc = useCallback((id) => {
    if (!ACCESORIOS[id]) return;
    setAcc(id);
    localStorage.setItem('gastos_acc', id);
  }, []);

  const mostrarMensaje = useCallback((msg, tipo = 'hablando', dur = 5000) => {
    if (timer.current) clearTimeout(timer.current);
    setMensaje(msg);
    setEstado(tipo);
    setAbierto(true);
    timer.current = setTimeout(() => { setAbierto(false); setEstado('idle'); }, dur);
  }, []);

  const reaccionar = useCallback((tipo, stats) => {
    if (stats) setAppStats(stats);
    const msgs = {
      bien:      '¡Buen control! Vas dentro de tu presupuesto. 💪',
      ahorro:    '¡Registraste un ahorro! Cada sol cuenta. 🎉',
      cuidado:   'Ya vas por el 70% de ese presupuesto. Ve con calma. 👀',
      pasaste:   '¡Te pasaste del límite! Revisa qué está pasando. 😬',
      importado: '¡Gastos de Yape registrados! Tu historial está al día. 📲',
      ingreso:   '¡Ingreso registrado! Ahora planifica bien cómo usarlo. 💰',
      meta:      '¡Cumpliste tu meta de ahorro! Considera subir el objetivo. 🏆',
    };
    const tipoEstado = ['pasaste','cuidado'].includes(tipo) ? 'alerta' : ['ahorro','meta','ingreso'].includes(tipo) ? 'celebra' : 'hablando';
    mostrarMensaje(msgs[tipo] || TIPS_GENERALES[0], tipoEstado, 5000);
  }, [mostrarMensaje]);

  const getTipContextual = useCallback((stats) => {
    if (!stats) return TIPS_GENERALES[tipIdx.current++ % TIPS_GENERALES.length];

    const tips = [];
    const fmt = n => `S/ ${Math.round(n).toLocaleString('es-PE')}`;

    if (stats.byCat) {
      const excedidas = stats.byCat.filter(c => c.slug !== 'ahorro' && c.pct > 100);
      const cercanas  = stats.byCat.filter(c => c.slug !== 'ahorro' && c.pct >= 70 && c.pct <= 100);
      const sinUsar   = stats.byCat.filter(c => c.slug !== 'ahorro' && c.budget > 0 && c.pct === 0);
      const top3      = [...stats.byCat].filter(c => c.slug !== 'ahorro' && c.spent > 0).sort((a,b) => b.spent - a.spent).slice(0,3);
      const top       = top3[0];

      excedidas.forEach(c => {
        const exceso = c.spent - c.budget;
        tips.push(`Te pasaste ${fmt(exceso)} en ${c.name}. Intenta compensar reduciendo en otra categoría este mes. 🎯`);
      });
      cercanas.forEach(c => {
        tips.push(`En ${c.name} ya usaste el ${c.pct}%. Solo te quedan ${fmt(c.remaining)} — ve con calma esta semana. ⚠️`);
      });
      if (top && !excedidas.length) {
        tips.push(`Tu mayor gasto este mes es ${top.name} (${fmt(top.spent)}). ¿Hay algo que puedas recortar ahí? 💡`);
      }
      if (sinUsar.length && stats.spent > 0) {
        tips.push(`Tienes presupuesto asignado en ${sinUsar[0].name} pero no has gastado nada. ¿Puedes moverlo al ahorro? 🐷`);
      }
      if (top3.length >= 2 && stats.spent > 0) {
        const pctTop = Math.round((top3[0].spent + (top3[1]?.spent||0)) / stats.spent * 100);
        if (pctTop > 70)
          tips.push(`El ${pctTop}% de tus gastos se concentra en ${top3[0].name} y ${top3[1]?.name}. Diversifica un poco. 📊`);
      }
    }

    if (stats.available < 0)
      tips.push(`Tus gastos superan tu ingreso en ${fmt(-stats.available)}. Revisa qué puedes recortar urgente. 📉`);
    else if (stats.income > 0 && stats.available > 0)
      tips.push(`Te quedan ${fmt(stats.available)} disponibles este mes. ¿Los mueves al ahorro? 💰`);

    if (stats.pctSueldo > 90)
      tips.push(`Ya usaste el ${stats.pctSueldo}% de tu sueldo. Cuidado con los últimos días del mes. 🛑`);
    else if (stats.pctSueldo > 75)
      tips.push(`Vas en el ${stats.pctSueldo}% de tu sueldo. Aún puedes cerrar el mes bien si moderas los gastos. 👀`);

    if (stats.ahorroReal > 0 && stats.ahorroEsperado > 0) {
      if (stats.ahorroReal >= stats.ahorroEsperado)
        tips.push(`¡Cumpliste tu meta de ahorro de ${fmt(stats.ahorroEsperado)}! Considera subir el objetivo un 10%. 🏆`);
      else {
        const falta = stats.ahorroEsperado - stats.ahorroReal;
        tips.push(`Te faltan ${fmt(falta)} para tu meta de ahorro. ¿Puedes transferirlos antes de fin de mes? 🐷`);
      }
    } else if (stats.ahorroReal === 0 && stats.income > 0) {
      tips.push('Aún no registras ahorro este mes. Aunque sea S/ 50 marca la diferencia. 🐷');
    }

    if (stats.cash > 0 && stats.yape > 0) {
      const pctEfectivo = Math.round(stats.cash / (stats.cash + stats.yape) * 100);
      if (pctEfectivo > 60)
        tips.push(`El ${pctEfectivo}% de tus gastos son en efectivo. Ese dinero es más difícil de rastrear — sigue registrándolo. 💵`);
    }

    if (tips.length === 0 && stats.spent > 0 && stats.pctSueldo <= 60)
      tips.push(`¡Vas muy bien! Solo usaste el ${stats.pctSueldo}% de tu sueldo. Puedes adelantar tu ahorro del próximo mes. 🌟`);

    if (tips.length === 0)
      tips.push(TIPS_GENERALES[tipIdx.current++ % TIPS_GENERALES.length]);

    return tips[Math.floor(Math.random() * Math.min(tips.length, 3))];
  }, []);

  const alHacerClick = useCallback(() => {
    if (abierto) { setAbierto(false); setEstado('idle'); return; }
    const tip = getTipContextual(appStats);
    mostrarMensaje(tip, 'hablando', 6000);
  }, [abierto, appStats, getTipContextual, mostrarMensaje]);

  return (
    <MascotaCtx.Provider value={{ reaccionar, setAppStats, skin, acc, equipSkin, equipAcc }}>
      {children}
      <MascotaWidget estado={estado} abierto={abierto} mensaje={mensaje} onClick={alHacerClick} skin={skin} acc={acc} />
    </MascotaCtx.Provider>
  );
}

export function useMascota() {
  return useContext(MascotaCtx);
}

function MascotaWidget({ estado, abierto, mensaje, onClick, skin, acc }) {
  const e        = ESTADOS[estado] || ESTADOS.idle;
  const skinData = SKINS[skin]      || SKINS.default;
  const accData  = ACCESORIOS[acc]  || ACCESORIOS.none;
  const activeColor = estado === 'idle' ? skinData.color : e.color;

  return (
    <>
      <style>{`
        @keyframes chanchi-float {
          0%,100% { transform: translateY(0px) rotate(-2deg); }
          50%      { transform: translateY(-7px) rotate(2deg); }
        }
        @keyframes chanchi-habla {
          0%,100% { transform: scale(1) rotate(-2deg); }
          25%     { transform: scale(1.08) rotate(2deg); }
          75%     { transform: scale(1.05) rotate(-1deg); }
        }
        @keyframes chanchi-alerta {
          0%,100% { transform: rotate(-2deg); }
          20%     { transform: rotate(-8deg) scale(1.05); }
          40%     { transform: rotate(8deg) scale(1.05); }
          60%     { transform: rotate(-5deg); }
          80%     { transform: rotate(5deg); }
        }
        @keyframes chanchi-celebra {
          0%    { transform: scale(1) rotate(-2deg); }
          20%   { transform: scale(1.3) rotate(-10deg); }
          40%   { transform: scale(1.3) rotate(10deg); }
          70%   { transform: scale(1.15) rotate(-5deg); }
          100%  { transform: scale(1) rotate(-2deg); }
        }
        @keyframes burbuja-in {
          from { opacity:0; transform: scale(.85) translateY(8px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }
        .chanchi-body {
          cursor: pointer;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,.15));
          transition: filter .2s;
        }
        .chanchi-body:hover { filter: drop-shadow(0 6px 14px rgba(0,0,0,.22)); }
      `}</style>

      <div className="mascota-widget" style={{
        position: 'fixed', bottom: 24, right: 20, zIndex: 9998,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10,
      }}>
        {/* burbuja de consejo */}
        {abierto && mensaje && (
          <div style={{
            background: 'var(--surface)', border: '1.5px solid var(--border)',
            borderRadius: 16, padding: '12px 16px',
            fontSize: 13.5, fontWeight: 600, lineHeight: 1.5,
            color: 'var(--text)', boxShadow: 'var(--shadow-lg)',
            maxWidth: 220, textAlign: 'left',
            animation: 'burbuja-in .25s ease-out',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', bottom: -8, right: 28,
              width: 14, height: 14,
              background: 'var(--surface)', border: '1.5px solid var(--border)',
              borderTop: 'none', borderLeft: 'none',
              transform: 'rotate(45deg)',
            }} />
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: activeColor,
              display: 'inline-block', marginRight: 6, verticalAlign: 'middle',
            }} />
            {mensaje}
          </div>
        )}

        {/* chanchito */}
        <div className="chanchi-body" onClick={onClick} title="Tócame para un consejo 🐷">
          <div style={{
            width: 56, height: 56,
            borderRadius: '50%',
            background: `color-mix(in srgb, ${activeColor} 15%, var(--surface))`,
            border: `2.5px solid color-mix(in srgb, ${activeColor} 40%, transparent)`,
            display: 'grid', placeItems: 'center',
            fontSize: 30,
            position: 'relative',
            boxShadow: estado === 'idle' ? skinData.glow : '',
            animation: estado === 'idle'     ? 'chanchi-float 3s ease-in-out infinite'
                      : estado === 'hablando' ? 'chanchi-habla 1.2s ease-in-out infinite'
                      : estado === 'alerta'   ? 'chanchi-alerta .7s ease-in-out 3'
                      : estado === 'celebra'  ? 'chanchi-celebra .8s ease-in-out 2'
                      : 'chanchi-float 3s ease-in-out infinite',
          }}>
            🐷
            {accData.emoji && (
              <div style={{
                position: 'absolute', top: -12, right: -8,
                fontSize: 20, lineHeight: 1,
                filter: 'drop-shadow(0 1px 3px rgba(0,0,0,.3))',
                pointerEvents: 'none',
              }}>
                {accData.emoji}
              </div>
            )}
          </div>
          {!abierto && (
            <div style={{
              position: 'absolute', top: -4, right: -2,
              background: activeColor, borderRadius: '50%',
              width: 16, height: 16, display: 'grid', placeItems: 'center',
              fontSize: 9, fontWeight: 800, color: '#fff',
              border: '2px solid var(--bg)',
            }}>💡</div>
          )}
        </div>
      </div>
    </>
  );
}
