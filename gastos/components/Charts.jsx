'use client';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts';

function moneyFmt(v) { return 'S/ ' + Math.round(v || 0).toLocaleString('es-PE'); }

const TIP = {
  contentStyle: { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, fontSize:13, fontFamily:'inherit' },
  itemStyle:    { color:'var(--text-2)', fontWeight:600 },
  labelStyle:   { color:'var(--text)',   fontWeight:700 },
  cursor:       { fill:'var(--surface-3)' },
};

// ── Donut / Pie ───────────────────────────────────────────────────
export function DonutChart({ data, height = 170 }) {
  // data: [{ name, value, color }]
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%"
          paddingAngle={2} dataKey="value">
          {data.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
        </Pie>
        <Tooltip contentStyle={TIP.contentStyle} itemStyle={TIP.itemStyle}
          formatter={v => moneyFmt(v)} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Bar: presupuesto vs gasto ─────────────────────────────────────
export function BudgetBarChart({ data, height = 240 }) {
  // data: [{ name, budget, spent, color }]
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barGap={2} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="name" tick={{ fontSize:11, fill:'var(--muted)', fontFamily:'inherit', fontWeight:600 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize:11, fill:'var(--muted)', fontFamily:'inherit' }} tickLine={false} axisLine={false} tickFormatter={v => 'S/'+v} />
        <Tooltip contentStyle={TIP.contentStyle} itemStyle={TIP.itemStyle} cursor={TIP.cursor}
          formatter={v => moneyFmt(v)} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:12, fontWeight:600, color:'var(--muted)', fontFamily:'inherit' }} />
        <Bar dataKey="budget" name="Presupuesto" fill="var(--surface-3)" radius={[6,6,0,0]} />
        <Bar dataKey="spent"  name="Gastado"
          radius={[6,6,0,0]}
          label={false}>
          {data.map((d, i) => <Cell key={i} fill={d.pct > 100 ? 'var(--danger)' : d.pct >= 70 ? 'var(--warn)' : d.color || 'var(--primary)'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Line: saldo diario ────────────────────────────────────────────
export function LineChartComp({ data, height = 230 }) {
  // data: [{ day, available }]
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="day" tick={{ fontSize:11, fill:'var(--muted)', fontFamily:'inherit' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize:11, fill:'var(--muted)', fontFamily:'inherit' }} tickLine={false} axisLine={false} tickFormatter={v => 'S/'+v} />
        <Tooltip contentStyle={TIP.contentStyle} itemStyle={TIP.itemStyle} cursor={{ stroke:'var(--border)' }}
          formatter={v => moneyFmt(v)} labelFormatter={v => `Día ${v}`} />
        <Line type="monotone" dataKey="available" name="Disponible" stroke="var(--primary)"
          strokeWidth={2.5} dot={false} activeDot={{ r:5, fill:'var(--primary)' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Bar horizontal: ahorro ────────────────────────────────────────
export function SavingsBarChart({ esperado, real, height = 150 }) {
  const data = [
    { name:'Esperado', value: esperado, fill:'var(--surface-3)' },
    { name:'Real',     value: real,     fill:'var(--lime)' },
  ];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" barCategoryGap="35%">
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis type="number" tick={{ fontSize:11, fill:'var(--muted)', fontFamily:'inherit' }} tickLine={false} axisLine={false} tickFormatter={v => 'S/'+v} />
        <YAxis dataKey="name" type="category" tick={{ fontSize:12, fill:'var(--muted)', fontFamily:'inherit', fontWeight:600 }} tickLine={false} axisLine={false} width={60} />
        <Tooltip contentStyle={TIP.contentStyle} formatter={v => moneyFmt(v)} cursor={TIP.cursor} />
        <Bar dataKey="value" radius={[0,6,6,0]}>
          {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Donut simple (2 valores) ──────────────────────────────────────
export function CompareDonut({ a, b, colorA, colorB, height = 150 }) {
  const data = [
    { name:'a', value: a || 0 },
    { name:'b', value: b || 0 },
  ];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%"
          paddingAngle={2} dataKey="value">
          <Cell fill={colorA} stroke="none" />
          <Cell fill={colorB} stroke="none" />
        </Pie>
        <Tooltip contentStyle={TIP.contentStyle} formatter={v => moneyFmt(v)} />
      </PieChart>
    </ResponsiveContainer>
  );
}
