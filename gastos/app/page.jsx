'use client';
import { useEffect, useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { ToastProvider } from '@/components/UI';
import { MascotaProvider } from '@/components/Mascota';
import Auth from '@/components/Auth';
import AppShell from '@/components/AppShell';
import Dashboard from '@/components/Dashboard';
import RegisterExpense from '@/components/RegisterExpense';
import History from '@/components/History';
import Budget, { IncomeTabView } from '@/components/Budget';
import Cash from '@/components/Cash';
import Reports from '@/components/Reports';
import Gamification from '@/components/Gamification';
import Settings from '@/components/Settings';
import { applyAccent } from '@/lib/palettes';

function AppContent() {
  const { user, loading } = useApp();
  const [view, setView]   = useState('dash');

  // apply saved theme + accent color on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('gastos_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const savedAccent = localStorage.getItem('gastos_accent') || 'teal';
    applyAccent(savedAccent);
  }, []);

  // reset scroll on view change
  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'grid', placeItems:'center', background:'var(--bg)' }}>
        <div className="col" style={{ alignItems:'center', gap:16 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'var(--primary)', display:'grid', placeItems:'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2H3Zm0 0v10a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-3M16 12h4v4h-4a2 2 0 0 1 0-4Z"/>
            </svg>
          </div>
          <span style={{ fontWeight:700, fontSize:16, color:'var(--muted)' }}>Cargando GASTOS…</span>
        </div>
      </div>
    );
  }

  if (!user) return <Auth />;

  const nav = v => setView(v);

  const screens = {
    dash:     <Dashboard onNav={nav} />,
    add:      <RegisterExpense onNav={nav} />,
    income:   <IncomeTabView />,
    budget:   <Budget />,
    cash:     <Cash onNav={nav} />,
    reports:  <Reports onNav={nav} />,
    history:  <History />,
    achiev:   <Gamification />,
    settings: <Settings />,
  };

  return (
    <AppShell view={view} onNav={nav}>
      {screens[view] || screens.dash}
    </AppShell>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <ToastProvider>
        <MascotaProvider>
          <AppContent />
        </MascotaProvider>
      </ToastProvider>
    </AppProvider>
  );
}
