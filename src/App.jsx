import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import CellBackground from './components/CellBackground.jsx';
import { useApp } from './state/AppState.jsx';
import { APP, DISCLAIMER, DATA_NOTICE } from './data/mockData.js';
import { cn } from './lib/utils.js';

import Dashboard from './pages/Dashboard.jsx';
import QualityAssessment from './pages/QualityAssessment.jsx';
import Detection from './pages/Detection.jsx';
import Explainability from './pages/Explainability.jsx';
import Performance from './pages/Performance.jsx';
import CrossDataset from './pages/CrossDataset.jsx';
import Ablation from './pages/Ablation.jsx';
import ErrorAnalysis from './pages/ErrorAnalysis.jsx';
import Settings from './pages/Settings.jsx';

/* ------------------------------------------------------------------ toast --- */

const TOAST_STYLE = {
  ok: { cls: 'border-[rgba(47,191,113,0.4)] text-ok', Icon: CheckCircle2 },
  warn: { cls: 'border-[rgba(224,163,58,0.4)] text-warn', Icon: TriangleAlert },
  bad: { cls: 'border-[rgba(225,85,90,0.4)] text-bad', Icon: TriangleAlert },
  info: { cls: 'border-line-strong text-ink-soft', Icon: Info },
};

function Toast() {
  const { state, dispatch } = useApp();
  const toast = state.toast;
  if (!toast) return null;
  const style = TOAST_STYLE[toast.tone] ?? TOAST_STYLE.info;
  const Icon = style.Icon;

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60]">
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'pointer-events-auto flex max-w-sm animate-slide-up items-start gap-2.5 rounded-md border bg-base-800 py-2.5 pl-3 pr-2 shadow-pop',
          style.cls,
        )}
      >
        <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
        <p className="flex-1 text-xs leading-relaxed">{toast.message}</p>
        <button
          type="button"
          onClick={() => dispatch({ type: 'TOAST', value: null })}
          className="rounded p-0.5 text-ink-faint transition-colors hover:text-ink"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- footer --- */

function Footer() {
  return (
    <footer className="mt-5 border-t border-line bg-base-850/60">
      <div className="mx-auto max-w-[1600px] px-3 py-3.5 sm:px-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-2xs font-semibold uppercase font-mono tracking-[0.09em] text-ink-muted">
              {APP.shortName} — Research Prototype
            </p>
            <p className="mt-1.5 max-w-3xl text-2xs leading-relaxed text-ink-faint">{DISCLAIMER}</p>
            <p className="mt-1 max-w-3xl text-2xs leading-relaxed text-ink-faint">{DATA_NOTICE}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-2xs text-ink-faint">
            <span className="font-mono">v{APP.version}</span>
            <span className="font-mono">{APP.build}</span>
            <span className="font-mono">{APP.institution}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------- app --- */

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.getElementById('aq-main')?.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

export default function App() {
  const { state } = useApp();

  return (
    <div className="flex h-full min-h-screen">
      <CellBackground />
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[208px]">
        <Topbar />
        <ScrollToTop />

        <main id="aq-main" className="min-w-0 flex-1 overflow-y-auto scroll-thin">
          <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-4">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/quality-assessment" element={<QualityAssessment />} />
              <Route path="/detection" element={<Detection />} />
              <Route path="/explainability" element={<Explainability />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/cross-dataset" element={<CrossDataset />} />
              <Route path="/ablation" element={<Ablation />} />
              <Route path="/error-analysis" element={<ErrorAnalysis />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
          <Footer />
        </main>
      </div>

      <Toast />
    </div>
  );
}
