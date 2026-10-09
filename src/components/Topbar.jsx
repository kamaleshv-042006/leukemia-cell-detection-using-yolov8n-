import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, Command, Cpu, Menu, Search, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../state/AppState.jsx';
import { NAV_ITEMS } from './Sidebar.jsx';
import {
  DATASET_FILTERS,
  MODELS,
  NOTIFICATIONS,
  APP,
  DATA_NOTICE,
} from '../data/mockData.js';
import { cn } from '../lib/utils.js';
import Modal from './Modal.jsx';
import { downloadText } from '../lib/exporters.js';

const TONE_DOT = {
  ok: 'bg-ok',
  warn: 'bg-warn',
  info: 'bg-info',
  alt: 'bg-alt',
  bad: 'bg-bad',
  muted: 'bg-ink-faint',
};

function SearchPalette({ open, onClose }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQ('');
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const results = NAV_ITEMS.filter((n) =>
    n.label.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <Modal open={open} onClose={onClose} size="md" title="Quick navigation" icon={Search}>
      <div className="relative mb-2">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search pages, metrics, settings…"
          className="h-9 w-full rounded-sm border border-line bg-base-850 pl-8 pr-2.5 text-[13px] text-ink placeholder:text-ink-faint outline-none focus:border-accent"
        />
      </div>
      <ul className="space-y-px">
        {results.map(({ to, label, icon: Icon, group }) => (
          <li key={to}>
            <Link
              to={to}
              onClick={onClose}
              className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-[12.5px] text-ink-soft transition-colors hover:bg-base-700 hover:text-ink"
            >
              <Icon className="h-4 w-4 shrink-0 text-ink-faint" strokeWidth={1.9} />
              <span>{label}</span>
              <span className="ml-auto text-[10px] uppercase tracking-[0.06em] text-ink-faint">{group}</span>
            </Link>
          </li>
        ))}
        {results.length === 0 && (
          <li className="px-2.5 py-6 text-center text-[12.5px] text-ink-muted">No matching pages</li>
        )}
      </ul>
    </Modal>
  );
}

export default function Topbar() {
  const { state, dispatch, setDatasetFilter, setModel, setNotifications, toast } = useApp();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [datasetOpen, setDatasetOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const wrapRef = useRef(null);

  const toMatch = (to, path) => (to === '/dashboard' ? path === '/' || path === to : path.startsWith(to));

  const current = NAV_ITEMS.find((n) => toMatch(n.to, location.pathname)) ?? NAV_ITEMS[0];
  const activeModel = MODELS.find((m) => m.id === state.activeModel) ?? MODELS[0];

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setDatasetOpen(false);
        setModelOpen(false);
        setProfileOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-2 border-b border-line bg-base-850/95 px-2.5 backdrop-blur sm:px-3">
        <button
          type="button"
          onClick={() => dispatch({ type: 'SIDEBAR_TOGGLE' })}
          className="rounded p-1.5 text-ink-muted transition-colors hover:bg-base-700 hover:text-ink lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        {/* breadcrumb */}
        <nav className="min-w-0 shrink" aria-label="Breadcrumb">
          <div className="flex items-center gap-1.5 text-[12.5px]">
            <span className="hidden font-mono text-[11.5px] uppercase tracking-[0.08em] text-ink-faint sm:inline">cell health</span>
            <span className="hidden text-ink-faint sm:inline">/</span>
            <span className="truncate font-medium leading-none text-ink">{current.label}</span>
          </div>
        </nav>

        {/* search */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="ml-1 hidden h-7 min-w-[160px] max-w-[260px] flex-1 items-center gap-2 rounded-sm border border-line bg-base-800 px-2 text-left text-[12px] text-ink-faint transition-colors hover:border-line-strong md:flex"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Search…</span>
          <span className="ml-auto hidden items-center gap-0.5 rounded-sm border border-line-soft bg-base-750 px-1 py-px font-mono text-[10px] leading-4 text-ink-faint lg:flex">
            <Command className="h-2.5 w-2.5" />K
          </span>
        </button>

        <div className="ml-auto flex items-center gap-1" ref={wrapRef}>
          {/* dataset selector */}
          <Dropdown
            open={datasetOpen}
            setOpen={setDatasetOpen}
            label={state.datasetFilter}
            title="Dataset"
            className="hidden md:flex"
            renderTrigger={(props) => (
              <button
                type="button"
                {...props}
                className={cn(
                  'inline-flex h-7 items-center gap-1.5 rounded-sm border border-line bg-base-800 px-2 text-[12px] text-ink-soft transition-colors hover:border-line-strong',
                  props.className,
                )}
              >
                <span className="text-[10px] uppercase leading-none tracking-[0.07em] text-ink-faint">
                  Dataset
                </span>
                <span className="font-medium leading-none text-ink">{state.datasetFilter}</span>
                <ChevronDown className="h-3 w-3 text-ink-faint" />
              </button>
            )}
          >
            {DATASET_FILTERS.map((d) => (
              <DropdownItem
                key={d}
                active={state.datasetFilter === d}
                onClick={() => {
                  setDatasetFilter(d);
                  setDatasetOpen(false);
                  toast(`Dataset filter: ${d}`, 'info');
                }}
              >
                {d}
              </DropdownItem>
            ))}
          </Dropdown>

          {/* model status */}
          <Dropdown
            open={modelOpen}
            setOpen={setModelOpen}
            title="Active model"
            renderTrigger={(props) => (
              <button
                type="button"
                {...props}
                className={cn(
                  'inline-flex h-7 items-center gap-1.5 rounded-sm border border-line bg-base-800 px-2 text-[12px] transition-colors hover:border-line-strong',
                  props.className,
                )}
              >
                <Cpu className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
                <span className="hidden font-medium leading-none text-ink lg:inline">{activeModel.label}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-ok" title="Model ready" />
              </button>
            )}
          >
            {MODELS.map((m) => (
              <DropdownItem
                key={m.id}
                active={state.activeModel === m.id}
                onClick={() => {
                  setModel(m.id);
                  setModelOpen(false);
                  toast(`Active model: ${m.label}`, 'info');
                }}
              >
                <span>{m.label}</span>
                <span className="ml-auto font-mono text-2xs text-ink-faint">{m.params}M</span>
              </DropdownItem>
            ))}
          </Dropdown>

          {/* backend link */}
          <span
            className="hidden h-7 items-center gap-1.5 rounded-sm border border-line bg-base-800 px-2 text-[10px] leading-none text-ink-muted xl:inline-flex"
            title="The Python / YOLOv8 service is not connected in this prototype"
          >
            {APP.apiConnected ? <Wifi className="h-3 w-3 text-ok" /> : <WifiOff className="h-3 w-3 text-warn" />}
            API {APP.apiConnected ? 'online' : 'offline'}
          </span>

          {/* notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                const next = !notifOpen;
                setNotifOpen(next);
                dispatch({ type: 'NOTIFICATIONS', value: next });
              }}
              className="relative flex h-7 w-7 items-center justify-center rounded-sm text-ink-muted transition-colors hover:bg-base-700 hover:text-ink"
              aria-label={`Notifications (${NOTIFICATIONS.length} unread)`}
              aria-expanded={notifOpen}
            >
              <Bell className="h-4 w-4" strokeWidth={1.9} />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent ring-2 ring-base-850" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full z-30 mt-1.5 w-[320px] animate-slide-up overflow-hidden rounded-md border border-line bg-base-800 shadow-pop">
                <div className="flex items-center justify-between border-b border-line-soft px-3 py-1.5">
                  <p className="text-[12.5px] font-semibold text-ink">Notifications</p>
                  <span className="tnum text-[10px] text-ink-muted">{NOTIFICATIONS.length} new</span>
                </div>
                <ul className="max-h-[320px] overflow-y-auto scroll-thin">
                  {NOTIFICATIONS.map((n) => (
                    <li key={n.id} className="flex gap-2 border-b border-line-soft px-3 py-2 last:border-b-0">
                      <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', TONE_DOT[n.tone])} />
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-medium leading-snug text-ink-soft">{n.title}</p>
                        <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">{n.body}</p>
                        <p className="mt-1 font-mono text-[10px] leading-none text-ink-faint">{n.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-line-soft px-3 py-1.5">
                  <p className="text-[10px] leading-relaxed text-ink-faint">{DATA_NOTICE}</p>
                </div>
              </div>
            )}
          </div>

          {/* profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex h-7 items-center gap-1.5 rounded-sm border border-line bg-base-800 pl-1 pr-1.5 transition-colors hover:border-line-strong"
              aria-label="Account"
              aria-expanded={profileOpen}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-accent-soft text-[10px] font-semibold leading-none text-accent">
                RA
              </span>
              <span className="hidden text-[12px] leading-none text-ink-soft lg:inline">Researcher</span>
              <ChevronDown className="h-3 w-3 text-ink-faint" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full z-30 mt-1.5 w-[240px] animate-slide-up overflow-hidden rounded-md border border-line bg-base-800 shadow-pop">
                <div className="border-b border-line-soft px-3 py-2.5">
                  <p className="text-xs font-medium text-ink">Research Account</p>
                  <p className="mt-0.5 truncate font-mono text-2xs text-ink-muted">
                    researcher@lab.local
                  </p>
                </div>
                <div className="p-1.5">
                  <MenuItem
                    onClick={() => {
                      downloadText(
                        `${APP.shortName} prototype session report\nGenerated: ${new Date().toISOString()}\n\n${DATA_NOTICE}\n\nPipeline: Upload → Quality → Adaptive Enhancement → YOLOv8n → Confidence Validation → Grad-CAM++\n`,
                        'aqalcd-session-report.txt',
                      );
                      setProfileOpen(false);
                      toast('Session report downloaded', 'ok');
                    }}
                  >
                    Download session report
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setProfileOpen(false);
                      toast('Prototype build — no account backend connected', 'warn');
                    }}
                  >
                    Account settings
                  </MenuItem>
                  <MenuItem
                    danger
                    onClick={() => {
                      setProfileOpen(false);
                      toast('Sign-out is disabled in the prototype', 'warn');
                    }}
                  >
                    Sign out
                  </MenuItem>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
/* ------------------------------------------------------------- primitives --- */

function Dropdown({ open, setOpen, children, renderTrigger, title }) {
  return (
    <div className="relative">
      {renderTrigger({
        onClick: () => setOpen(!open),
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        className: open ? 'border-accent' : undefined,
      })}
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1.5 min-w-[176px] animate-slide-up overflow-hidden rounded-md border border-line bg-base-800 py-1 shadow-pop"
        >
          {title && (
            <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase leading-none tracking-[0.08em] text-ink-faint">
              {title}
            </p>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

function DropdownItem({ children, active, onClick, className }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[12.5px] leading-snug transition-colors',
        active ? 'bg-accent-soft text-ink' : 'text-ink-soft hover:bg-base-700 hover:text-ink',
        className,
      )}
    >
      {children}
    </button>
  );
}

function MenuItem({ children, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-sm px-2.5 py-1.5 text-left text-[12.5px] leading-snug transition-colors',
        danger
          ? 'text-bad hover:bg-bad-soft'
          : 'text-ink-soft hover:bg-base-700 hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}
