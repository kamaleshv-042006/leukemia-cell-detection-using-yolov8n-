import { NavLink } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Crosshair,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  Microscope,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../state/AppState.jsx';
import { APP } from '../data/mockData.js';
import { cn } from '../lib/utils.js';

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { to: '/quality-assessment', label: 'Quality Assessment', icon: Gauge, group: 'Workflow' },
  { to: '/detection', label: 'Cell Detection', icon: Crosshair, group: 'Workflow' },
  { to: '/explainability', label: 'Explainability', icon: Sparkles, group: 'Workflow' },
  { to: '/performance', label: 'Performance Analytics', icon: Activity, group: 'Evaluation' },
  { to: '/cross-dataset', label: 'Cross-Dataset Evaluation', icon: BarChart3, group: 'Evaluation' },
  { to: '/ablation', label: 'Ablation Study', icon: FlaskConical, group: 'Evaluation' },
  { to: '/error-analysis', label: 'Error Analysis', icon: ShieldAlert, group: 'Evaluation' },
  { to: '/settings', label: 'Settings', icon: Settings, group: 'System' },
];

const GROUP_ORDER = ['Overview', 'Workflow', 'Evaluation', 'System'];

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-accent/40 bg-accent-soft">
        <Microscope className="h-4 w-4 text-accent" strokeWidth={1.9} />
        <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full border-2 border-base-850 bg-ok" />
      </span>
      <div className="min-w-0">
        <p className="truncate font-mono text-[12.5px] font-semibold uppercase leading-tight tracking-[0.08em] text-ink">
          {APP.shortName}
        </p>
        <p className="truncate text-[10px] leading-tight text-ink-faint">Leukemia Detection</p>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { state, closeSidebar } = useApp();
  const { sidebarOpen } = state;

  return (
    <>
      {/* mobile scrim */}
      <div
        onClick={closeSidebar}
        className={cn(
          'fixed inset-0 z-30 bg-black/60 backdrop-blur-[1px] transition-opacity duration-200 lg:hidden',
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[208px] flex-col border-r border-line bg-base-850',
          'transition-transform duration-200 ease-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-3">
          <Logo />
          <button
            type="button"
            onClick={closeSidebar}
            className="rounded p-1 text-ink-muted transition-colors hover:bg-base-700 hover:text-ink lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-2.5 scroll-thin" aria-label="Main navigation">
          {GROUP_ORDER.map((group) => {
            const items = NAV_ITEMS.filter((n) => n.group === group);
            if (!items.length) return null;
            return (
              <div key={group} className="mb-3 last:mb-0">
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase leading-none tracking-[0.11em] text-ink-faint">
                  {group}
                </p>
                <ul className="space-y-px">
                  {items.map(({ to, label, icon: Icon }) => (
                    <li key={to}>
                      <NavLink
                        to={to}
                        onClick={closeSidebar}
                        title={label}
                        className={({ isActive }) =>
                          cn(
                            'group relative flex items-center gap-2 rounded-sm px-2 py-[5px] text-[12.5px] leading-tight transition-colors',
                            isActive
                              ? 'bg-accent-soft font-medium text-ink'
                              : 'text-ink-muted hover:bg-base-700 hover:text-ink-soft',
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className={cn(
                                'absolute left-0 top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-r transition-colors',
                                isActive ? 'bg-accent' : 'bg-transparent',
                              )}
                            />
                            <Icon
                              className={cn(
                                'h-4 w-4 shrink-0 transition-colors',
                                isActive ? 'text-accent' : 'text-ink-faint group-hover:text-ink-muted',
                              )}
                              strokeWidth={1.9}
                            />
                            <span className="truncate">{label}</span>
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-line px-2.5 py-2.5">
          <div className="flex items-center justify-between gap-1.5 rounded-sm border border-line-soft bg-base-800 px-2 py-1.5">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-medium uppercase leading-none tracking-[0.06em] text-ink-faint">
                Model
              </p>
              <p className="truncate font-mono text-[10.5px] leading-tight text-ink-muted">YOLOv8n · 3.2M</p>
            </div>
            <span className="flex shrink-0 items-center gap-1 rounded-sm bg-ok-soft px-1.5 py-0.5 text-[10px] font-medium leading-none text-ok">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" />
              Ready
            </span>
          </div>
          <p className="mt-1.5 text-center font-mono text-[10px] leading-none text-ink-faint">
            v{APP.version} · demo build
          </p>
        </div>
      </aside>
    </>
  );
}
