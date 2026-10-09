import { useMemo, useState } from 'react';
import {
  ArrowUp,
  Boxes,
  CheckCircle2,
  Cpu,
  FlaskConical,
  Layers,
  Plus,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
} from 'lucide-react';

import PageHeader, { MetaItem } from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import DataTable from '../components/DataTable.jsx';
import Button from '../components/Button.jsx';
import ChartCard from '../components/charts/ChartCard.jsx';
import { BarChart, RadarChart } from '../components/charts/index.jsx';
import { CHART } from '../components/charts/chartTheme.jsx';
import { ABLATION_MODELS, DATA_NOTICE } from '../data/mockData.js';
import { cn } from '../lib/utils.js';

const METRIC_META = [
  { key: 'precision', label: 'Precision', suffix: '' },
  { key: 'recall', label: 'Recall', suffix: '' },
  { key: 'f1', label: 'F1-score', suffix: '' },
  { key: 'map50', label: 'mAP@0.5', suffix: '' },
  { key: 'map5095', label: 'mAP@0.5:0.95', suffix: '' },
  { key: 'inferenceMs', label: 'Inference Time', suffix: ' ms' },
];

const pct1 = (v) => `${(v * 100).toFixed(1)}%`;
const baseline = ABLATION_MODELS[0];
const finalModel = ABLATION_MODELS.at(-1);

export default function Ablation() {
  const [focus, setFocus] = useState(finalModel.id);
  const selected = useMemo(
    () => ABLATION_MODELS.find((m) => m.id === focus) ?? finalModel,
    [focus],
  );

  const improvements = useMemo(() => {
    return ABLATION_MODELS.map((m) => {
      const delta = {};
      METRIC_META.forEach(({ key }) => {
        const a = m.metrics[key] ?? m[key];
        const b = baseline.metrics[key] ?? baseline[key];
        delta[key] = a - b;
      });
      return { id: m.id, ...delta };
    });
  }, []);

  const improvementFor = (id, key) =>
    improvements.find((i) => i.id === id)?.[key] ?? 0;

  const chartData = useMemo(
    () =>
      ABLATION_MODELS.map((m) => ({
        model: m.code.replace('Model ', ''),
        precision: m.metrics.precision,
        recall: m.metrics.recall,
        f1: m.metrics.f1,
        map50: m.metrics.map50,
        map5095: m.metrics.map5095,
      })),
    [],
  );

  const radarData = useMemo(
    () => [
      ...METRIC_META.filter((m) => m.key !== 'inferenceMs').map(({ key }) => ({
        metric: key === 'map5095' ? 'mAP@0.5:0.95' : key.toUpperCase(),
        [baseline.code]: baseline.metrics[key],
        [finalModel.code]: finalModel.metrics[key],
      })),
      {
        metric: 'Speed (1/ms)',
        [baseline.code]: 1000 / baseline.inferenceMs,
        [finalModel.code]: 1000 / finalModel.inferenceMs,
      },
    ],
    [],
  );

  const columns = [
    {
      key: 'code',
      header: 'Model',
      width: 88,
      render: (r) => (
        <span className="inline-flex items-center gap-1.5">
          {r.isFinal ? <CheckCircle2 className="h-3.5 w-3.5 text-ok" /> : <Boxes className="h-3 w-3 text-ink-faint" />}
          <span className={cn('font-medium', r.isFinal ? 'text-ink' : 'text-ink-soft')}>{r.code}</span>
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Configuration',
      render: (r) => (
        <span className="text-ink">{r.name}</span>
      ),
    },
    {
      key: 'components',
      header: 'Added components',
      sortable: false,
      render: (r) => (
        <span className="flex flex-wrap items-center gap-1">
          {r.stack.map((s) => (
            <span
              key={s}
              className="rounded-sm border border-line-soft bg-base-850 px-1.5 py-0.5 text-[10px] text-ink-muted"
            >
              {s}
            </span>
          ))}
        </span>
      ),
    },
    ...METRIC_META.map(({ key, label, suffix }) => ({
      key,
      header: label,
      align: 'right',
      numeric: true,
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <span className="tnum">
            {key === 'inferenceMs' ? r[key] : (r.metrics[key] * 100).toFixed(1)}
            {suffix === ' ms' ? ' ms' : '%'}
          </span>
          {r.id !== baseline.id && (
            <Delta
              value={improvementFor(r.id, key)}
              invert={key === 'inferenceMs'}
              scale={key === 'inferenceMs' ? 1 : 100}
              unit={key === 'inferenceMs' ? ' ms' : ''}
            />
          )}
        </div>
      ),
    })),
    {
      key: 'params',
      header: 'Params',
      align: 'right',
      numeric: true,
      render: (r) => `${r.params.toFixed(2)}M`,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Evaluation"
        icon={FlaskConical}
        title="Ablation Study"
        subtitle="Incremental contribution of each pipeline component"
        description="Six configurations are compared on a common data split. Each step adds exactly one component so its marginal contribution is attributable."
        actions={
          <StatusBadge tone="ok" dot>
            {`${(finalModel.metrics.map5095 - baseline.metrics.map5095) >= 0 ? '+' : ''}${(
              (finalModel.metrics.map5095 - baseline.metrics.map5095) *
              100
            ).toFixed(1)} pts mAP@0.5:0.95`}
          </StatusBadge>
        }
        meta={
          <>
            <MetaItem icon={Layers} label="Configurations" value="6" />
            <MetaItem icon={Target} label="Best F1" value={pct1(finalModel.metrics.f1)} tone="ok" />
            <MetaItem icon={Timer} label="Latency cost" value={`+${(finalModel.inferenceMs - baseline.inferenceMs).toFixed(1)} ms`} tone="warn" />
            <MetaItem icon={Cpu} label="Params" value={`+${(finalModel.params - baseline.params).toFixed(2)}M`} />
          </>
        }
      />

      {/* ------------------------------------------------------ configuration cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {ABLATION_MODELS.map((m) => {
          const isFocus = focus === m.id;
          const dMap50 = m.metrics.map50 - baseline.metrics.map50;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setFocus(m.id)}
              className={cn(
                'flex flex-col rounded-md border p-3 text-left shadow-panel transition-colors',
                m.isFinal
                  ? isFocus
                    ? 'border-ok/60 bg-ok-soft'
                    : 'border-[rgba(47,191,113,0.3)] bg-base-800 hover:border-[rgba(47,191,113,0.5)]'
                  : isFocus
                    ? 'border-accent/55 bg-accent-soft'
                    : 'border-line bg-base-800 hover:border-line-strong hover:bg-base-750',
              )}
            >
              <div className="flex items-start justify-between gap-1.5">
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border text-2xs font-semibold',
                    m.isFinal ? 'border-ok/40 bg-ok-soft text-ok' : 'border-line bg-base-850 text-ink-soft',
                  )}
                >
                  {m.id}
                </span>
                {m.id !== baseline.id && (
                  <Delta value={dMap50} />
                )}
              </div>

              <p className={cn('mt-2 text-xs font-medium leading-snug', m.isFinal ? 'text-ink' : 'text-ink-soft')}>
                {m.name}
              </p>

              <ul className="mt-2.5 space-y-1">
                {METRIC_META.slice(0, 5).map(({ key, label }) => (
                  <li key={key} className="flex items-center justify-between gap-1.5">
                    <span className="truncate text-[10px] text-ink-faint">{label}</span>
                    <span className="tnum shrink-0 text-[11px] font-medium text-ink-soft">
                      {(m.metrics[key] * 100).toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-2.5 flex items-center justify-between gap-1 border-t border-line-soft pt-2">
                <span className="text-[10px] text-ink-faint">{m.inferenceMs} ms</span>
                <span className="text-[10px] text-ink-faint">{m.params.toFixed(2)}M</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* --------------------------------------------------- final model composition */}
      <SectionCard
        title="Final Proposed Model — A-QALCD"
        subtitle="Composition of the selected configuration"
        icon={Sparkles}
        actions={
          <StatusBadge tone="ok" size="sm" dot>
            Model F
          </StatusBadge>
        }
      >
        <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
          {finalModel.stack.map((s, i) => {
            const ICON = [Sparkles, Layers, Boxes, ShieldIcon, ScanIcon][i] ?? Plus;
            return (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div
                  className={cn(
                    'flex min-w-0 flex-1 items-center gap-2.5 rounded border px-3 py-2.5 transition-colors',
                    i === finalModel.stack.length - 1
                      ? 'border-accent/50 bg-accent-soft'
                      : 'border-line bg-base-850',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border',
                      i === finalModel.stack.length - 1
                        ? 'border-accent/40 bg-accent-soft text-accent'
                        : 'border-line-soft bg-base-800 text-ink-muted',
                    )}
                  >
                    <ICON className="h-3.5 w-3.5" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.08em] text-ink-faint">
                      {['Gate', 'Enhance', 'Detect', 'Validate', 'Explain'][i] ?? 'Step'}
                    </p>
                    <p className="truncate text-xs font-medium text-ink">{s}</p>
                  </div>
                </div>
                {i < finalModel.stack.length - 1 && (
                  <Plus className="hidden h-3.5 w-3.5 shrink-0 text-ink-faint lg:block" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-line-soft pt-3.5 sm:grid-cols-3 lg:grid-cols-6">
          {METRIC_META.map(({ key, label }) => (
            <div key={key} className="rounded border border-line-soft bg-base-850 px-2.5 py-2">
              <p className="truncate text-[10px] uppercase tracking-[0.06em] text-ink-faint">{label}</p>
              <p className="tnum mt-1 text-base font-semibold leading-none text-ink">
                {key === 'inferenceMs' ? `${finalModel[key]} ms` : pct1(finalModel.metrics[key])}
              </p>
              {key !== 'inferenceMs' && (
                <p className="mt-1 text-[10px] text-ok">
                  +{(((finalModel.metrics[key] - baseline.metrics[key]) * 100)).toFixed(1)} pts vs Model A
                </p>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* -------------------------------------------------------------- charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Model Comparison"
          subtitle="Accuracy metrics across all six configurations"
          icon={TrendingUp}
          height={320}
          legend={
            <div className="flex flex-wrap items-center gap-3 text-2xs">
              {[
                ['mAP@0.5', CHART.accent],
                ['mAP@0.5:0.95', CHART.alt],
                ['F1', CHART.info],
              ].map(([l, c]) => (
                <span key={l} className="flex items-center gap-1.5 text-ink-muted">
                  <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: c }} />
                  {l}
                </span>
              ))}
            </div>
          }
          footer="Every step after Model B produces a monotonic gain — no component regresses the detector."
        >
          <BarChart
            data={chartData}
            xKey="model"
            height={284}
            yFormat={(v) => `${(v * 100).toFixed(0)}%`}
            yDomain={[0, 1]}
            series={[
              { key: 'map50', label: 'mAP@0.5', color: CHART.accent },
              { key: 'map5095', label: 'mAP@0.5:0.95', color: CHART.alt },
              { key: 'f1', label: 'F1', color: CHART.info },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Accuracy vs Latency"
          subtitle="Precision-recall-F1 against inference time"
          icon={Timer}
          height={320}
          footer="The proposed model trades ~3 ms of latency for +13.4 mAP@0.5:0.95 points."
        >
          <RadarChart
            data={radarData}
            height={300}
            domain={[0, 1]}
            series={[
              { key: baseline.code, label: `${baseline.code} · Basic`, color: '#68757F' },
              { key: finalModel.code, label: `${finalModel.code} · A-QALCD`, color: CHART.accent },
            ]}
          />
        </ChartCard>
      </div>

      {/* --------------------------------------------------- selected + improvement */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <SectionCard
          title={`${selected.code} — ${selected.name}`}
          subtitle="Selected configuration breakdown"
          icon={Boxes}
          actions={
            <StatusBadge tone={selected.isFinal ? 'ok' : 'muted'} size="sm">
              {selected.params.toFixed(2)}M params
            </StatusBadge>
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ul className="space-y-2.5">
              {METRIC_META.map(({ key, label }) => {
                const value = key === 'inferenceMs' ? selected[key] : selected.metrics[key];
                const isLatency = key === 'inferenceMs';
                const ratio = isLatency ? value / 20 : value;
                return (
                  <li key={key}>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-ink-soft">{label}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="tnum text-xs font-medium text-ink">
                          {isLatency ? `${value} ms` : pct1(value)}
                        </span>
                        {!isLatency && <Delta value={improvementFor(selected.id, key)} />}
                      </span>
                    </div>
                    <ProgressBar value={ratio} size="xs" tone={isLatency ? 'info' : 'accent'} />
                  </li>
                );
              })}
            </ul>

            <div className="space-y-3">
              <div className="rounded border border-line-soft bg-base-850 px-3 py-2.5">
                <p className="text-2xs uppercase tracking-[0.07em] text-ink-faint">Component stack</p>
                <ul className="mt-2 space-y-1.5">
                  {selected.stack.map((s) => (
                    <li key={s} className="flex items-start gap-1.5 text-xs text-ink-soft">
                      <Plus className="mt-1 h-2.5 w-2.5 shrink-0 text-accent" strokeWidth={3} />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded border border-line-soft bg-base-850 px-3 py-2.5">
                <p className="text-2xs uppercase tracking-[0.07em] text-ink-faint">
                  Marginal gain over previous step
                </p>
                {(() => {
                  const idx = ABLATION_MODELS.findIndex((m) => m.id === selected.id);
                  if (idx === 0) {
                    return (
                      <p className="mt-1.5 text-xs text-ink-muted">
                        Model A is the reference baseline — no prior step to compare against.
                      </p>
                    );
                  }
                  const prev = ABLATION_MODELS[idx - 1];
                  return (
                    <ul className="mt-2 space-y-1.5">
                      {METRIC_META.filter((m) => m.key !== 'inferenceMs').map(({ key, label }) => {
                        const d = selected.metrics[key] - prev.metrics[key];
                        return (
                          <li key={key} className="flex items-center justify-between gap-2">
                            <span className="truncate text-2xs text-ink-muted">{label}</span>
                            <Delta value={d} showZero />
                          </li>
                        );
                      })}
                      <li className="flex items-center justify-between gap-2 border-t border-line-soft pt-1.5">
                        <span className="truncate text-2xs text-ink-muted">Latency change</span>
                        <Delta
                          value={selected.inferenceMs - prev.inferenceMs}
                          invert
                          showZero
                          scale={1}
                          unit=" ms"
                        />
                      </li>
                    </ul>
                  );
                })()}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Improvement Indicators"
          subtitle="Cumulative gain of the proposed model over Model A"
          icon={ArrowUp}
          padded={false}
        >
          <ul>
            {METRIC_META.filter((m) => m.key !== 'inferenceMs').map(({ key, label }) => {
              const d = finalModel.metrics[key] - baseline.metrics[key];
              return (
                <li key={key} className="flex items-center gap-3 border-b border-line-soft px-3.5 py-2.5 last:border-b-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-ink-soft">{label}</p>
                    <p className="tnum mt-0.5 text-2xs text-ink-faint">
                      {(baseline.metrics[key] * 100).toFixed(1)}% → {(finalModel.metrics[key] * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-24 shrink-0">
                    <ProgressBar value={d * 5} size="xs" tone="ok" />
                  </div>
                  <span className="tnum w-14 shrink-0 text-right text-xs font-medium text-ok">
                    +{(d * 100).toFixed(1)}
                  </span>
                </li>
              );
            })}
            <li className="flex items-center gap-3 border-b border-line-soft bg-base-850/40 px-3.5 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-ink-soft">Inference Time</p>
                <p className="tnum mt-0.5 text-2xs text-ink-faint">
                  {baseline.inferenceMs} ms → {finalModel.inferenceMs} ms
                </p>
              </div>
              <div className="w-24 shrink-0">
                <ProgressBar value={(finalModel.inferenceMs - baseline.inferenceMs) * 8} size="xs" tone="warn" />
              </div>
              <span className="tnum w-14 shrink-0 text-right text-xs font-medium text-warn">
                +{(finalModel.inferenceMs - baseline.inferenceMs).toFixed(1)}
              </span>
            </li>
          </ul>
          <div className="border-t border-line-soft px-3.5 py-2.5">
            <p className="text-[10px] leading-relaxed text-ink-faint">{DATA_NOTICE}</p>
          </div>
        </SectionCard>
      </div>

      {/* ---------------------------------------------------------------- table */}
      <SectionCard
        title="Ablation Results Table"
        subtitle="All configurations · all metrics"
        icon={Layers}
        padded={false}
      >
        <DataTable
          columns={columns}
          rows={ABLATION_MODELS}
          rowKey={(r) => r.id}
          initialSort={{ key: 'code', dir: 'asc' }}
          onRowClick={(r) => setFocus(r.id)}
          exportFilename="aqalcd-ablation.csv"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-soft px-3.5 py-2.5">
          <p className="text-2xs text-ink-faint">Click a row to inspect its breakdown above.</p>
          <StatusBadge tone="ok" size="sm" dot>
            Model F selected as final
          </StatusBadge>
        </div>
      </SectionCard>

      <p className="text-2xs leading-relaxed text-ink-faint">
        Ablation results are simulated for interface demonstration. Re-run the study against the real training
        pipeline to obtain reportable numbers.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------- sub-parts --- */

function Delta({ value, invert = false, showZero = false, scale = 100, unit = '' }) {
  const v = Number(value ?? 0);
  if (!showZero && Math.abs(v) < 0.0005) return <span className="text-2xs text-ink-faint">-</span>;
  const positive = invert ? v < 0 : v > 0;
  const negative = invert ? v > 0 : v < 0;
  return (
    <span
      className={cn(
        'tnum inline-flex items-center gap-0.5 text-2xs font-medium',
        positive && 'text-ok',
        negative && 'text-bad',
        !positive && !negative && 'text-ink-faint',
      )}
    >
      {v > 0 ? '+' : ''}
      {(v * scale).toFixed(1)}
      {unit}
    </span>
  );
}

function ShieldIcon(props) {
  return <CheckCircle2 {...props} />;
}
function ScanIcon(props) {
  return <Sparkles {...props} />;
}
