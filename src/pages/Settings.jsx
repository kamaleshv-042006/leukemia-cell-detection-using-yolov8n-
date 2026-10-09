import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  Layers,
  RefreshCcw,
  Save,
  ScanLine,
  Server,
  SlidersHorizontal,
  Sparkles,
  Timer,
  Trash2,
  Zap,
} from 'lucide-react';

import PageHeader, { MetaItem } from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Button from '../components/Button.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Modal from '../components/Modal.jsx';
import Tabs from '../components/Tabs.jsx';
import { CHART } from '../components/charts/chartTheme.jsx';
import { NumberInput, Select, Slider, TextInput, Toggle } from '../components/Field.jsx';
import { useApp } from '../state/AppState.jsx';
import { CELL_CLASSES } from '../data/classes.js';
import {
  APP,
  BATCH_SIZES,
  DEFAULT_SETTINGS,
  IMAGE_SIZES,
  OPTIMIZERS,
  OPTIMIZATION_METHODS,
} from '../data/mockData.js';
import { cn } from '../lib/utils.js';

const TABS = [
  { id: 'model', label: 'Model', icon: Cpu },
  { id: 'training', label: 'Training', icon: SlidersHorizontal },
  { id: 'inference', label: 'Inference', icon: Zap },
  { id: 'optimization', label: 'Optimization', icon: Gauge },
  { id: 'quality', label: 'Quality Gates', icon: ScanLine },
  { id: 'explainability', label: 'Explainability', icon: Sparkles },
  { id: 'backend', label: 'Backend', icon: Server },
];

export default function Settings() {
  const { state, patchSettings, resetSettings, setThreshold, toast } = useApp();
  const [tab, setTab] = useState('model');
  const [resetOpen, setResetOpen] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  const s = state.settings;

  const dirty = useMemo(
    () => JSON.stringify(s) !== JSON.stringify(DEFAULT_SETTINGS),
    [s],
  );

  const set = (section) => (key, value) => patchSettings(section, { [key]: value });

  const onSave = () => {
    setThreshold(s.inference.confidenceThreshold);
    setSavedAt(new Date().toLocaleTimeString());
    toast('Settings saved locally (frontend only)', 'ok');
  };

  const onReset = () => {
    resetSettings();
    setResetOpen(false);
    toast('Settings restored to defaults', 'info');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="System"
        icon={SlidersHorizontal}
        title="Model & System Settings"
        subtitle="Training, inference and quality-gate configuration"
        description="All values are stored in browser memory for this prototype. Connect the Python service to persist them server-side."
        actions={
          <>
            {dirty && <StatusBadge tone="warn" dot>Unsaved changes</StatusBadge>}
            {savedAt && !dirty && <StatusBadge tone="ok" dot>Saved {savedAt}</StatusBadge>}
            <Button variant="subtle" icon={RefreshCcw} onClick={() => setResetOpen(true)}>
              Reset
            </Button>
            <Button variant="primary" icon={Save} onClick={onSave} disabled={!dirty}>
              Save settings
            </Button>
          </>
        }
        meta={
          <>
            <MetaItem icon={Cpu} label="Model" value={s.model.name} tone="accent" />
            <MetaItem icon={HardDrive} label="Weights" value={s.model.weights} />
            <MetaItem icon={Server} label="Device" value={s.model.device} tone="ok" />
            <MetaItem icon={AlertTriangle} label="Backend" value="Not connected" tone="warn" />
          </>
        }
      />

      <Tabs items={TABS} value={tab} onChange={setTab} ariaLabel="Settings sections" />

      {/* ================================================================ MODEL */}
      {tab === 'model' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
          <SectionCard title="Model Identity" subtitle="Architecture and checkpoint" icon={Cpu}>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <TextInput
                label="Model Name"
                value={s.model.name}
                onChange={set('model')('name')}
                mono
              />
              <TextInput
                label="Framework Version"
                value={s.model.version}
                onChange={set('model')('version')}
                mono
              />
              <TextInput
                label="Weights File"
                value={s.model.weights}
                onChange={set('model')('weights')}
                mono
                className="sm:col-span-2"
              />
              <Select
                label="Device"
                value={s.model.device}
                onChange={set('model')('device')}
                options={['CUDA:0', 'CUDA:1', 'CPU', 'Auto']}
              />
              <Select
                label="Input Channels"
                value={String(s.model.inputChannels)}
                onChange={(v) => patchSettings('model', { inputChannels: Number(v) })}
                options={[
                  { value: '1', label: '1 · Grayscale' },
                  { value: '3', label: '3 · RGB' },
                  { value: '4', label: '4 · RGBA' },
                ]}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-line-soft pt-3.5 sm:grid-cols-4">
              {[
                ['Parameters', '3.2M'],
                ['Weights size', s.model.weightsSize],
                ['Classes', s.model.classes],
                ['FLOPs', '8.7 G'],
              ].map(([k, v]) => (
                <div key={k} className="rounded border border-line-soft bg-base-850 px-2.5 py-2">
                  <p className="text-[10px] uppercase tracking-[0.06em] text-ink-faint">{k}</p>
                  <p className="tnum mt-1 text-sm font-medium text-ink">{v}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Class Taxonomy" subtitle="Detector output classes" icon={Database}>
            <ul className="divide-y divide-line-soft">
              {CELL_CLASSES.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 py-1.5">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: c.color }}
                      aria-hidden="true"
                    />
                    <span className="truncate text-xs text-ink-soft">{c.label}</span>
                    <code className="truncate font-mono text-[10px] text-ink-faint">{c.id}</code>
                  </span>
                  <StatusBadge tone={c.malignant ? 'bad' : 'ok'} size="sm">
                    {c.malignant ? 'Malignant' : 'Normal'}
                  </StatusBadge>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-line-soft pt-2.5 text-2xs leading-relaxed text-ink-faint">
              {CELL_CLASSES.filter((c) => c.malignant).length} malignant precursor classes and{' '}
              {CELL_CLASSES.filter((c) => !c.malignant).length} normal reference classes. The taxonomy drives
              the malignant/normal grouping used in the detection summary.
            </p>
          </SectionCard>
        </div>
      )}

      {/* ============================================================= TRAINING */}
      {tab === 'training' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SectionCard title="Optimisation Hyper-Parameters" subtitle="Reproduce the training run" icon={SlidersHorizontal}>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <NumberInput
                label="Learning Rate"
                value={s.training.learningRate}
                onChange={(v) => patchSettings('training', { learningRate: v })}
                step={0.001}
                min={0.000001}
              />
              <Select
                label="Batch Size"
                value={String(s.training.batchSize)}
                onChange={(v) => patchSettings('training', { batchSize: Number(v) })}
                options={BATCH_SIZES.map((b) => ({ value: String(b), label: String(b) }))}
              />
              <NumberInput
                label="Epochs"
                value={s.training.epochs}
                onChange={(v) => patchSettings('training', { epochs: v })}
                min={1}
                max={1000}
              />
              <Select
                label="Image Size"
                value={String(s.training.imageSize)}
                onChange={(v) => patchSettings('training', { imageSize: Number(v) })}
                options={IMAGE_SIZES.map((i) => ({ value: String(i), label: `${i} × ${i}` }))}
              />
              <Select
                label="Optimizer"
                value={s.training.optimizer}
                onChange={set('training')('optimizer')}
                options={OPTIMIZERS}
              />
              <NumberInput
                label="Weight Decay"
                value={s.training.weightDecay}
                onChange={(v) => patchSettings('training', { weightDecay: v })}
                step={0.0001}
                min={0}
              />
              <NumberInput
                label="Momentum"
                value={s.training.momentum}
                onChange={(v) => patchSettings('training', { momentum: v })}
                step={0.001}
                min={0}
                max={1}
              />
              <NumberInput
                label="Warmup Epochs"
                value={s.training.warmupEpochs}
                onChange={(v) => patchSettings('training', { warmupEpochs: v })}
                min={0}
              />
              <NumberInput
                label="Early Stopping Patience"
                value={s.training.patience}
                onChange={(v) => patchSettings('training', { patience: v })}
                min={0}
                suffix="ep"
              />
              <Select
                label="LR Schedule"
                value="cosine"
                onChange={() => toast('Schedule is fixed to cosine in this prototype', 'info')}
                options={['cosine', 'step', 'linear', 'one-cycle']}
              />
            </div>
          </SectionCard>

          <div className="space-y-4">
            <SectionCard title="Effective Configuration" subtitle="Derived values" icon={Cpu}>
              <div className="space-y-3">
                <Row
                  label="Steps per epoch"
                  value={`${Math.ceil(18865 / 0.8 / s.training.batchSize).toLocaleString('en-US')} (est.)`}
                />
                <Row label="Total optimiser steps" value={`${(s.training.epochs * Math.ceil(18865 / 0.8 / s.training.batchSize)).toLocaleString('en-US')}`} />
                <Row label="Input tensor" value={`${s.training.batchSize} × 3 × ${s.training.imageSize} × ${s.training.imageSize}`} mono />
                <Row label="Approx. VRAM" value={`${(s.training.batchSize * s.training.imageSize * s.training.imageSize * 0.0021).toFixed(1)} GB`} />
                <Row label="Schedule" value={`Cosine decay → ${(0.01 * 0.5).toFixed(5)}`} mono />
              </div>
            </SectionCard>

            <SectionCard title="Data Split" subtitle="Reproducible partition" icon={Database}>
              <div className="space-y-3">
                {[
                  ['Train', 0.7, '13,105'],
                  ['Validation', 0.15, '2,810'],
                  ['Test', 0.15, '2,950'],
                ].map(([k, v, n]) => (
                  <div key={k}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-xs text-ink-soft">{k}</span>
                      <span className="tnum text-2xs text-ink-muted">
                        {(v * 100).toFixed(0)}% · {n} images
                      </span>
                    </div>
                    <ProgressBar value={v} size="xs" tone="accent" />
                  </div>
                ))}
                <p className="border-t border-line-soft pt-2.5 text-2xs leading-relaxed text-ink-faint">
                  Seed 4242 · stratified by class · patient-level grouping to prevent slide leakage.
                </p>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* =========================================================== INFERENCE */}
      {tab === 'inference' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SectionCard title="Detection Thresholds" subtitle="Applied at inference time" icon={Zap}>
            <div className="space-y-4">
              <Slider
                label="Confidence Threshold"
                value={s.inference.confidenceThreshold}
                onChange={(v) => {
                  patchSettings('inference', { confidenceThreshold: v });
                  setThreshold(v);
                }}
                min={0}
                max={0.95}
                step={0.05}
                format={(v) => v.toFixed(2)}
                hint="Predictions below this score are suppressed. The detection page slider is kept in sync."
                ticks={['0.00', '0.25', '0.50', '0.75', '0.95']}
              />
              <Slider
                label="IoU Threshold (NMS)"
                value={s.inference.iouThreshold}
                onChange={(v) => patchSettings('inference', { iouThreshold: v })}
                min={0.1}
                max={0.9}
                step={0.01}
                format={(v) => v.toFixed(2)}
                hint="Higher values keep more overlapping boxes; lower values suppress duplicates more aggressively."
                ticks={['0.10', '0.30', '0.50', '0.70', '0.90']}
              />
              <div className="grid grid-cols-1 gap-3.5 border-t border-line-soft pt-3.5 sm:grid-cols-2">
                <NumberInput
                  label="Max Detections"
                  value={s.inference.maxDetections}
                  onChange={(v) => patchSettings('inference', { maxDetections: v })}
                  min={1}
                  max={1000}
                />
                <Select
                  label="Inference Image Size"
                  value={String(s.inference.imageSize)}
                  onChange={(v) => patchSettings('inference', { imageSize: Number(v) })}
                  options={IMAGE_SIZES.map((i) => ({ value: String(i), label: `${i} × ${i}` }))}
                />
              </div>
              <div className="border-t border-line-soft pt-3.5">
                <Toggle
                  label="Half precision (FP16)"
                  hint="Roughly halves memory and improves throughput on supported GPUs."
                  checked={s.inference.halfPrecision}
                  onChange={(v) => patchSettings('inference', { halfPrecision: v })}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Runtime Profile" subtitle="Measured on the simulated device" icon={Timer}>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                ['Preprocess', '2.1 ms', 'info'],
                ['Forward pass', '8.4 ms', 'accent'],
                ['NMS', '1.1 ms', 'alt'],
                ['Post-process', '0.8 ms', 'ok'],
                ['Total latency', '12.4 ms', 'warn'],
                ['Throughput', '80.6 FPS', 'ok'],
              ].map(([k, v, tone]) => (
                <div key={k} className="rounded border border-line-soft bg-base-850 px-2.5 py-2.5">
                  <p className="truncate text-2xs uppercase tracking-[0.06em] text-ink-faint">{k}</p>
                  <p
                    className={cn(
                      'tnum mt-1 text-base font-semibold leading-none',
                      tone === 'ok' && 'text-ok',
                      tone === 'warn' && 'text-warn',
                      tone === 'bad' && 'text-bad',
                      tone === 'info' && 'text-info',
                      tone === 'accent' && 'text-accent',
                      tone === 'alt' && 'text-alt',
                    )}
                  >
                    {v}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3.5 border-t border-line-soft pt-3">
              <p className="text-2xs uppercase tracking-[0.07em] text-ink-faint">Latency breakdown</p>
              <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-base-700">
                {[
                  ['Preprocess', 2.1, CHART.accent],
                  ['Forward', 8.4, CHART.info],
                  ['NMS', 1.1, CHART.alt],
                  ['Post', 0.8, CHART.ok],
                ].map(([k, v, c]) => (
                  <div
                    key={k}
                    className="h-full"
                    style={{ width: `${(v / 12.4) * 100}%`, backgroundColor: c }}
                    title={`${k}: ${v} ms`}
                  />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {[
                  ['Preprocess', CHART.accent],
                  ['Forward', CHART.info],
                  ['NMS', CHART.alt],
                  ['Post', CHART.ok],
                ].map(([k, c]) => (
                  <span key={k} className="flex items-center gap-1 text-[10px] text-ink-faint">
                    <span className="h-1.5 w-1.5 rounded-[1px]" style={{ backgroundColor: c }} />
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ========================================================= OPTIMIZATION */}
      {tab === 'optimization' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          <SectionCard
            title="Hyper-Parameter Search"
            subtitle="Select the strategy used to tune the final checkpoint"
            icon={Gauge}
          >
            <div className="space-y-2.5">
              {OPTIMIZATION_METHODS.map((m) => {
                const active = s.optimization.method === m.label;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      patchSettings('optimization', { method: m.label, trials: m.trials });
                      toast(`Optimization strategy: ${m.label}`, 'info');
                    }}
                    className={cn(
                      'flex w-full items-start gap-3 rounded border px-3 py-2.5 text-left transition-colors',
                      active
                        ? 'border-accent/55 bg-accent-soft'
                        : 'border-line-soft bg-base-850 hover:border-line-strong',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                        active ? 'border-accent bg-accent' : 'border-line-strong',
                      )}
                    >
                      {active && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[13px] font-medium text-ink">{m.label}</p>
                        <span className="tnum shrink-0 text-2xs text-ink-faint">{m.trials} trials</span>
                      </div>
                      <p className="mt-0.5 text-2xs leading-relaxed text-ink-muted">{m.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3.5 border-t border-line-soft pt-3.5 sm:grid-cols-2">
              <NumberInput
                label="Trials"
                value={s.optimization.trials}
                onChange={(v) => patchSettings('optimization', { trials: v })}
                min={1}
                max={1000}
              />
              <TextInput
                label="Search Space"
                value={s.optimization.searchSpace}
                onChange={set('optimization')('searchSpace')}
                mono
                className="sm:col-span-2"
              />
            </div>
          </SectionCard>

          <SectionCard title="Search Results" subtitle="Top configurations found" icon={Zap} padded={false}>
            <ul>
              {[
                { rank: 1, lr: 0.01, batch: 16, wd: 0.0005, score: 0.932, best: true },
                { rank: 2, lr: 0.008, batch: 16, wd: 0.0005, score: 0.929 },
                { rank: 3, lr: 0.01, batch: 32, wd: 0.001, score: 0.924 },
                { rank: 4, lr: 0.005, batch: 8, wd: 0.0005, score: 0.917 },
                { rank: 5, lr: 0.02, batch: 16, wd: 0.0001, score: 0.911 },
              ].map((r) => (
                <li
                  key={r.rank}
                  className={cn(
                    'flex items-center gap-2.5 border-b border-line-soft px-3.5 py-2.5 last:border-b-0',
                    r.best && 'bg-ok-soft',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border text-[10px] font-semibold',
                      r.best ? 'border-ok/40 text-ok' : 'border-line text-ink-muted',
                    )}
                  >
                    {r.rank}
                  </span>
                  <div className="min-w-0 flex-1 font-mono text-2xs text-ink-muted">
                    lr {r.lr} · b{r.batch} · wd {r.wd}
                  </div>
                  <span className="tnum shrink-0 text-xs font-medium text-ink">{r.score.toFixed(3)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-line-soft px-3.5 py-2.5">
              <p className="text-[10px] leading-relaxed text-ink-faint">
                Objective: maximise validation F1 at IoU 0.5. Simulated search log.
              </p>
            </div>
          </SectionCard>
        </div>
      )}

      {/* =========================================================== QUALITY */}
      {tab === 'quality' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SectionCard
            title="Quality Gate Thresholds"
            subtitle="Per-metric cut-offs used by the analyser"
            icon={ScanLine}
          >
            <div className="space-y-4">
              {[
                ['sharpnessThreshold', 'Sharpness Threshold', 'Minimum variance-of-Laplacian score.'],
                ['contrastThreshold', 'Contrast Threshold', 'Minimum Michelson contrast score.'],
                ['brightnessThreshold', 'Brightness Threshold', 'Minimum luma stability score.'],
                ['noiseThreshold', 'Noise Threshold', 'Maximum tolerated noise index.'],
                ['colorThreshold', 'Colour Threshold', 'Minimum stain saturation and balance score.'],
              ].map(([key, label, hint]) => (
                <Slider
                  key={key}
                  label={label}
                  value={s.quality[key]}
                  onChange={(v) => patchSettings('quality', { [key]: v })}
                  min={0}
                  max={100}
                  step={1}
                  tone={key === 'noiseThreshold' ? 'warn' : 'accent'}
                  format={(v) => (key === 'noiseThreshold' ? `≤ ${v.toFixed(0)}` : v.toFixed(0))}
                  hint={hint}
                  ticks={['0', '25', '50', '75', '100']}
                />
              ))}
            </div>
          </SectionCard>

          <div className="space-y-4">
            <SectionCard title="Classification Bands" subtitle="Score → quality level mapping" icon={Gauge}>
              <div className="space-y-4">
                {/* band scale */}
                <div>
                  <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-base-700">
                    <div
                      className="h-full bg-bad"
                      style={{ width: `${s.quality.lowCutoff}%` }}
                      title="LOW band"
                    />
                    <div
                      className="h-full bg-warn"
                      style={{ width: `${Math.max(0, s.quality.highCutoff - s.quality.lowCutoff)}%` }}
                      title="MEDIUM band"
                    />
                    <div
                      className="h-full bg-ok"
                      style={{ width: `${Math.max(0, 100 - s.quality.highCutoff)}%` }}
                      title="HIGH band"
                    />
                  </div>
                  <div className="relative mt-1 h-3 text-[10px] text-ink-faint">
                    <span className="tnum absolute left-0">0</span>
                    <span
                      className="tnum absolute -translate-x-1/2"
                      style={{ left: `${s.quality.lowCutoff}%` }}
                    >
                      {s.quality.lowCutoff}
                    </span>
                    <span
                      className="tnum absolute -translate-x-1/2"
                      style={{ left: `${s.quality.highCutoff}%` }}
                    >
                      {s.quality.highCutoff}
                    </span>
                    <span className="tnum absolute right-0">100</span>
                  </div>
                </div>

                <ul className="space-y-2">
                  {[
                    { level: 'LOW', range: `0 – ${s.quality.lowCutoff}`, tone: 'bad', action: 'Strong Enhancement' },
                    {
                      level: 'MEDIUM',
                      range: `${s.quality.lowCutoff} – ${s.quality.highCutoff}`,
                      tone: 'warn',
                      action: 'Mild Enhancement',
                    },
                    { level: 'HIGH', range: `${s.quality.highCutoff} – 100`, tone: 'ok', action: 'Direct Processing' },
                  ].map((b) => (
                    <li
                      key={b.level}
                      className="flex items-center justify-between gap-2 rounded border border-line-soft bg-base-850 px-3 py-2"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <StatusBadge tone={b.tone} size="sm" dot>
                          {b.level}
                        </StatusBadge>
                        <span className="truncate text-2xs text-ink-faint">{b.action}</span>
                      </span>
                      <span className="tnum shrink-0 font-mono text-2xs text-ink-muted">{b.range}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-4 border-t border-line-soft pt-3.5">
                  <Slider
                    label="LOW / MEDIUM Cut-off"
                    value={s.quality.lowCutoff}
                    onChange={(v) => patchSettings('quality', { lowCutoff: v })}
                    min={0}
                    max={100}
                    step={1}
                    tone="bad"
                    format={(v) => v.toFixed(0)}
                    hint="Scores at or below this value are classified LOW."
                    ticks={['0', '25', '50', '75', '100']}
                  />
                  <Slider
                    label="MEDIUM / HIGH Cut-off"
                    value={s.quality.highCutoff}
                    onChange={(v) => patchSettings('quality', { highCutoff: v })}
                    min={0}
                    max={100}
                    step={1}
                    tone="ok"
                    format={(v) => v.toFixed(0)}
                    hint="Scores at or above this value are classified HIGH."
                    ticks={['0', '25', '50', '75', '100']}
                  />
                </div>

                {s.quality.lowCutoff >= s.quality.highCutoff && (
                  <p className="flex items-start gap-1.5 rounded border border-[rgba(225,85,90,0.3)] bg-bad-soft px-2.5 py-2 text-2xs text-bad">
                    <AlertTriangle className="mt-px h-3 w-3 shrink-0" />
                    The LOW cut-off must stay below the MEDIUM/HIGH cut-off, otherwise a band becomes
                    unreachable.
                  </p>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Enhancement Policies" subtitle="Applied automatically per band" icon={SlidersHorizontal}>
              <div className="space-y-3">
                {[
                  ['High', 'Direct Processing', 'ok'],
                  ['Medium', 'Mild Enhancement', 'warn'],
                  ['Low', 'Strong Enhancement', 'bad'],
                ].map(([lvl, action, tone]) => (
                  <div key={lvl} className="flex items-center justify-between gap-2 border-b border-line-soft pb-2 last:border-b-0 last:pb-0">
                    <span className="flex items-center gap-2">
                      <StatusBadge tone={tone} size="sm">
                        {lvl}
                      </StatusBadge>
                      <span className="text-xs text-ink-soft">{action}</span>
                    </span>
                    <code className="truncate font-mono text-[10px] text-ink-faint">
                      {lvl === 'High' ? 'none' : lvl === 'Medium' ? 'clahe, contrast' : 'denoise, clahe, stainNorm'}
                    </code>
                  </div>
                ))}
                <Toggle
                  label="Force enhancement for high-quality input"
                  hint="Off by default — high-quality fields are processed as-is."
                  checked={false}
                  onChange={(v) =>
                    toast(
                      v ? 'Not applied in this prototype' : 'Automatic forcing is disabled',
                      'info',
                    )
                  }
                />
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* ===================================================== EXPLAINABILITY */}
      {tab === 'explainability' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SectionCard title="Grad-CAM++ Configuration" subtitle="Attribution parameters" icon={Sparkles}>
            <div className="space-y-4">
              <Toggle
                label="Enable explainability"
                hint="Exposes the Explainability page and adds a small inference cost."
                checked={s.explainability.enabled}
                onChange={(v) => patchSettings('explainability', { enabled: v })}
              />
              <div className="grid grid-cols-1 gap-3.5 border-t border-line-soft pt-3.5 sm:grid-cols-2">
                <Select
                  label="Method"
                  value={s.explainability.method}
                  onChange={set('explainability')('method')}
                  options={['Grad-CAM++', 'Grad-CAM', 'HiResCAM', 'Ablation-CAM']}
                />
                <Select
                  label="Target Layer"
                  value={s.explainability.targetLayer}
                  onChange={set('explainability')('targetLayer')}
                  options={['layer-4', 'layer-6', 'layer-8', 'layer-9', 'layer-10']}
                />
                <Select
                  label="Colormap"
                  value={s.explainability.colormap}
                  onChange={set('explainability')('colormap')}
                  options={['Turbo', 'Jet', 'Inferno', 'Viridis', 'Magma']}
                />
                <NumberInput
                  label="Overlay Alpha"
                  value={s.explainability.alpha}
                  onChange={(v) => patchSettings('explainability', { alpha: v })}
                  step={0.05}
                  min={0}
                  max={1}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Layer Candidates" subtitle="Resolution vs attribution fidelity" icon={Layers} dense>
            <ul className="divide-y divide-line-soft">
              {[
                ['layer-4', '128 × 128', 'Coarse, stable', false],
                ['layer-6', '128 × 128', 'Coarse, stable', false],
                ['layer-8', '40 × 40', 'Balanced', false],
                ['layer-9', '40 × 40', 'Best for nuclei', true],
                ['layer-10', '20 × 20', 'Very coarse', false],
              ].map(([l, res, note, active]) => (
                <li key={l} className="flex items-center justify-between gap-2 py-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <code className="font-mono text-xs text-ink-soft">{l}</code>
                    <span className="tnum text-2xs text-ink-faint">{res}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="truncate text-2xs text-ink-muted">{note}</span>
                    {active ? (
                      <StatusBadge tone="ok" size="sm" dot>
                        Active
                      </StatusBadge>
                    ) : (
                      <span className="w-14" />
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-line-soft pt-2.5 text-2xs leading-relaxed text-ink-faint">
              layer-9 is the default because it resolves individual nuclei while retaining enough spatial
              extent for a usable attribution map.
            </p>
          </SectionCard>
        </div>
      )}

      {/* ============================================================= BACKEND */}
      {tab === 'backend' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SectionCard
            title="Python Service Connection"
            subtitle="Replaces the simulated inference with the real YOLOv8 backend"
            icon={Server}
          >
            <div className="space-y-3.5">
              <TextInput label="API Endpoint" value={APP.apiEndpoint} onChange={() => {}} mono readOnly />
              <TextInput
                label="Request Timeout"
                value="30"
                onChange={() => {}}
                mono
                readOnly
              />
              <div className="grid grid-cols-2 gap-2.5">
                <Toggle
                  label="Auto-detect GPU"
                  checked
                  onChange={() => toast('Hardware detection is simulated', 'info')}
                />
                <Toggle
                  label="Stream results"
                  checked={false}
                  onChange={() => toast('Streaming is simulated', 'info')}
                />
              </div>

              <div className="rounded border border-line-soft bg-base-850 px-3 py-2.5">
                <p className="text-2xs uppercase tracking-[0.07em] text-ink-faint">Expected endpoints</p>
                <ul className="mt-2 space-y-1 font-mono text-2xs text-ink-muted">
                  {[
                    ['POST', '/api/quality'],
                    ['POST', '/api/detect'],
                    ['POST', '/api/gradcam'],
                    ['GET', '/api/system/status'],
                  ].map(([m, p]) => (
                    <li key={p} className="flex gap-2">
                      <span className="w-11 shrink-0 text-accent">{m}</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2.5 border-t border-line-soft pt-2.5 text-2xs leading-relaxed text-ink-faint">
                  These map one-to-one onto the functions in{' '}
                  <code className="text-ink-muted">src/data/mockApi.js</code> — replace the bodies with{' '}
                  <code className="text-ink-muted">fetch</code> calls and the UI needs no changes.
                </p>
              </div>

              <Button variant="subtle" icon={Server} onClick={() => toast('No backend is running in this prototype', 'warn')}>
                Test connection
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Environment" subtitle="Prototype runtime" icon={Cpu} padded={false}>
            <ul>
              {[
                ['Frontend', 'React 18 + Vite 5', 'ok'],
                ['Styling', 'Tailwind CSS 3.4', 'ok'],
                ['Charts', 'Recharts 2.15', 'ok'],
                ['Icons', 'Lucide React', 'ok'],
                ['Router', 'React Router 6', 'ok'],
                ['Backend', 'Not connected', 'warn'],
                ['Model runtime', 'Simulated (mock API)', 'warn'],
                ['Data', 'Simulated mock dataset', 'warn'],
              ].map(([k, v, tone]) => (
                <li
                  key={k}
                  className="flex items-center justify-between gap-2 border-b border-line-soft px-3.5 py-2.5 last:border-b-0"
                >
                  <span className="text-xs text-ink-soft">{k}</span>
                  <span className="flex items-center gap-2">
                    <span className="truncate font-mono text-2xs text-ink-muted">{v}</span>
                    <span
                      className={cn(
                        'h-1.5 w-1.5 shrink-0 rounded-full',
                        tone === 'ok' ? 'bg-ok' : 'bg-warn',
                      )}
                    />
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-line-soft px-3.5 py-2.5">
              <p className="text-[10px] leading-relaxed text-ink-faint">
                Research prototype only. Not a medical diagnostic device.
              </p>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ================================================================ MODAL */}
      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset all settings?"
        description="Every value returns to the shipped defaults."
        icon={Trash2}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={Trash2} onClick={onReset}>
              Reset settings
            </Button>
          </>
        }
      >
        <p className="text-xs leading-relaxed text-ink-soft">
          This resets model configuration, training hyper-parameters, inference thresholds, optimisation
          strategy, quality gates and explainability settings. It does not delete any uploaded image or
          detection result.
        </p>
      </Modal>
    </div>
  );
}

/* -------------------------------------------------------------- sub-parts --- */

function Row({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line-soft pb-2 last:border-b-0 last:pb-0">
      <span className="shrink-0 text-xs text-ink-soft">{label}</span>
      <span className={cn('truncate text-right text-xs font-medium text-ink', mono && 'font-mono text-2xs')}>
        {value}
      </span>
    </div>
  );
}
