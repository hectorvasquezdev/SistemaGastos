// Accent color palettes. Each palette has light and dark variants.
export const PALETTES = [
  {
    id: 'teal',   name: 'Verde',     swatch: '#0f766e',
    light: { primary:'#0f766e', p600:'#0c5f58', p700:'#0a4a45', tint:'#e4f1ef', tint2:'#d2e9e5', onP:'#ffffff' },
    dark:  { primary:'#1ba89a', p600:'#25b8a8', p700:'#34c5b4', tint:'#11302c', tint2:'#15413a', onP:'#04130f' },
  },
  {
    id: 'blue',   name: 'Azul',      swatch: '#1d4ed8',
    light: { primary:'#1d4ed8', p600:'#1a44c2', p700:'#1638a8', tint:'#e8effe', tint2:'#d4e2fd', onP:'#ffffff' },
    dark:  { primary:'#3b82f6', p600:'#60a5fa', p700:'#93c5fd', tint:'#0f1f40', tint2:'#142856', onP:'#030f22' },
  },
  {
    id: 'violet', name: 'Violeta',   swatch: '#7c3aed',
    light: { primary:'#7c3aed', p600:'#6d28d9', p700:'#5b21b6', tint:'#f1eafe', tint2:'#e8d8fd', onP:'#ffffff' },
    dark:  { primary:'#a78bfa', p600:'#c4b5fd', p700:'#ddd6fe', tint:'#1e1240', tint2:'#271952', onP:'#090418' },
  },
  {
    id: 'pink',   name: 'Rosa',      swatch: '#be185d',
    light: { primary:'#be185d', p600:'#9d1456', p700:'#831243', tint:'#fce7f3', tint2:'#fbcfe8', onP:'#ffffff' },
    dark:  { primary:'#f472b6', p600:'#f9a8d4', p700:'#fbcfe8', tint:'#3b1228', tint2:'#4a1535', onP:'#1a0612' },
  },
  {
    id: 'orange', name: 'Naranja',   swatch: '#c2410c',
    light: { primary:'#c2410c', p600:'#a33810', p700:'#882e0c', tint:'#fef2ee', tint2:'#fde8dd', onP:'#ffffff' },
    dark:  { primary:'#fb923c', p600:'#fdba74', p700:'#fed7aa', tint:'#3b1708', tint2:'#4a1e0a', onP:'#1a0a03' },
  },
  {
    id: 'amber',  name: 'Ámbar',     swatch: '#b45309',
    light: { primary:'#b45309', p600:'#924408', p700:'#783807', tint:'#fefce8', tint2:'#fef9c3', onP:'#ffffff' },
    dark:  { primary:'#fbbf24', p600:'#fcd34d', p700:'#fde68a', tint:'#2e1f04', tint2:'#3d2a05', onP:'#150e01' },
  },
  {
    id: 'sky',    name: 'Cielo',     swatch: '#0369a1',
    light: { primary:'#0369a1', p600:'#025d8e', p700:'#014f79', tint:'#e0f2fe', tint2:'#bae6fd', onP:'#ffffff' },
    dark:  { primary:'#38bdf8', p600:'#7dd3fc', p700:'#bae6fd', tint:'#082032', tint2:'#0a2940', onP:'#020e18' },
  },
  {
    id: 'emerald',name: 'Esmeralda', swatch: '#059669',
    light: { primary:'#059669', p600:'#047857', p700:'#036347', tint:'#d1fae5', tint2:'#a7f3d0', onP:'#ffffff' },
    dark:  { primary:'#34d399', p600:'#6ee7b7', p700:'#a7f3d0', tint:'#052e1a', tint2:'#063d23', onP:'#011a0d' },
  },
];

// Reads current data-theme from DOM and applies the matching palette vars as inline styles.
export function applyAccent(paletteId) {
  if (typeof window === 'undefined') return;
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  const p = PALETTES.find(x => x.id === paletteId) || PALETTES[0];
  const v = theme === 'dark' ? p.dark : p.light;
  const s = document.documentElement.style;
  s.setProperty('--primary',       v.primary);
  s.setProperty('--primary-600',   v.p600);
  s.setProperty('--primary-700',   v.p700);
  s.setProperty('--primary-tint',  v.tint);
  s.setProperty('--primary-tint2', v.tint2);
  s.setProperty('--on-primary',    v.onP);
}
