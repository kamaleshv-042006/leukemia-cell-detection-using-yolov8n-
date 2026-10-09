import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowRightLeft,
  Boxes,
  Clock,
  Database,
  Filter,
  Layers,
  ScanLine,
  TrendingDown,
  TriangleAlert,
} from 'lucide-react';

import PageHeader, { MetaItem } from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import DataTable from '../components/DataTable.jsx';
import Button from '../components/Button.jsx';
import ChartCard from '../components/charts/ChartCard.jsx';
import {
  BarChart,
  ConfusionMatrix,
  LineChart,
  RadarChart,
} from '../components/charts/index.jsx';
import { CHART } from '../components/charts/chartTheme.jsx';
import { useApp } from '../state/AppState.jsx';
import {
  CONFUSION_LABELS,
  CONFUSION_MATRIX,
  CROSS_DATASET_EXPERIMENTS,
  CROSS_DATASET_TABLE,
  PR_CURVE,
  DATA_NOTICE,
} from '../data/mockData.js';
import { cn } from '../lib/utils.js';

const pct1 = (v) => `${(v * 100).toFixed(1)}%`;
const pct0 = (v) => `${(v * 100).toFixed(0)}%`;

const TONE = { ok: 'ok', warn: 'warn', bad: 'bad' };

export default function CrossDataset() {
  const { toast } = useApp();
  const [focus, setFocus] = useState('EXP-1');

  const focused = useMemo(
    () => CROSS_DATASET_EXPERIMENTS.find((e) => e.id === focus) ?? CROSS_DATASET_EXPERIMENTS[0],
    [focus],
  );

  const inDomain = useMemo(
    () => CROSS_DATASET_EXPERIMENTS.filter((e) => e.domain === 'In-domain'),
    [],
  );
  const crossDomain = useMemo(
    () => CROSS_DATASET_EXPERIMENTS.filter((e) => e.domain === 'Cross-domain'),
    [],
  );

  const meanIn = useMemo(
    () => avgMetrics(inDomain),
    [],
  );
  const meanCross = useMemo(() => avgMetrics(crossDomain), []);
  const gap = useMemo(
    () => Object.fromEntries(Object.keys(meanIn).map((k) => [k, meanCross[k] - meanIn[k]])),
    [meanIn, meanCross],
  );

  const comparisonData = useMemo(
    () =>
      CROSS_DATASET_EXPERIMENTS.map((e) => ({
        id: e.id,
        experiment: e.title.replace('Experiment ', 'E'),
        train: e.train,
        test: e.test,
        map50: e.metrics.map50,
        map5095: e.metrics.map5095,
        f1: e.metrics.f1,
        precision: e.metrics.precision,
        recall: e.metrics.recall,
      })),
    [],
  );

  const radarData = useMemo(
    () => [
      { metric: 'Precision', ...Object.fromEntries(CROSS_DATASET_EXPERIMENTS.map((e) => [e.title.replace('Experiment ', 'E'), e.metrics.precision])) },
      { metric: 'Recall', ...Object.fromEntries(CROSS_DATASET_EXPERIMENTS.map((e) => [e.title.replace('Experiment ', 'E'), e.metrics.recall])) },
      { metric: 'F1', ...Object.fromEntries(CROSS_DATASET_EXPERIMENTS.map((e) => [e.title.replace('Experiment ', 'E'), e.metrics.f1])) },
      { metric: 'mAP@0.5', ...Object.fromEntries(CROSS_DATASET_EXPERIMENTS.map((e) => [e.title.replace('Experiment ', 'E'), e.metrics.map50])) },
      { metric: 'mAP@0.5:0.95', ...Object.fromEntries(CROSS_DATASET_EXPERIMENTS.map((e) => [e.title.replace('Experiment ', 'E'), e.metrics.map5095])) },
    ],
    [],
  );

  const columns = [
    { key: 'id', header: 'ID', width: 74, render: (r) => <span className="font-mono text-2xs text-ink-muted">{r.id}</span> },
    { key: 'dataset', header: 'Dataset', width: 100 },
    { key: 'training', header: 'Training', width: 100, render: (r) => <span className="text-ink">{r.training}</span> },
    { key: 'testing', header: 'Testing', width: 100 },
    {
      key: 'domain',
      header: 'Domain',
      width: 122,
      render: (r) => (
        <StatusBadge tone={r.domain === 'In-domain' ? 'ok' : 'bad'} size="sm">
          {r.domain}
        </StatusBadge>
      ),
    },
    { key: 'precision', header: 'Precision', align: 'right', numeric: true, render: (r) => r.precision.toFixed(3) },
    { key: 'recall', header: 'Recall', align: 'right', numeric: true, render: (r) => r.recall.toFixed(3) },
    { key: 'f1', header: 'F1', align: 'right', numeric: true, render: (r) => r.f1.toFixed(3) },
    { key: 'map50', header: 'mAP@0.5', align: 'right', numeric: true, render: (r) => r.map50.toFixed(3) },
    { key: 'map5095', header: 'mAP@0.5:0.95', align: 'right', numeric: true, render: (r) => r.map5095.toFixed(3) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Evaluation"
        icon={ArrowRightLeft}
        title="Cross-Dataset Evaluation"
        subtitle="In-domain baselines against cross-domain generalisation"
        description="Two public leukaemia datasets are used: ALL (acute lymphoblastic) and C-NMC (chronic myelogenous). Four train/test combinations quantify the domain shift."
        actions={
          <StatusBadge tone="bad" dot>
            Cross-domain gap: {(gap.map50 * 100).toFixed(1)} mAP pts
          </StatusBadge>
        }
        meta={
          <>
            <MetaItem icon={Database} label="Datasets" value="ALL · C-NMC" />
            <MetaItem icon={ScanLine} label="Experiments" value="4" tone="accent" />
            <MetaItem icon={Layers} label="Model" value="YOLOv8n" />
            <MetaItem icon={Filter} label="Active" value={focus} />
          </>
        }
      />

      {/* ------------------------------------------------------ experiment cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {CROSS_DATASET_EXPERIMENTS.map((e) => {
          const isFocus = focus === e.id;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => {
                setFocus(e.id);
                toast(`${e.title} selected`, 'info');
              }}
              className={cn(
                'flex flex-col rounded-md border bg-base-800 p-3.5 text-left shadow-panel transition-colors',
                isFocus ? 'border-accent/55 bg-accent-soft' : 'border-line hover:border-line-strong hover:bg-base-750',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink">{e.title}</p>
                  <p className="truncate text-2xs text-ink-muted">{e.subtitle}</p>
                </div>
                <StatusBadge tone={TONE[e.tone]} size="sm" dot>
                  {e.domain === 'In-domain' ? 'In' : 'Cross'}
                </StatusBadge>
              </div>

              {/* train -> test */}
              <div className="mt-3 flex items-center gap-2 rounded border border-line-soft bg-base-850 px-2.5 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] uppercase tracking-[0.08em] text-ink-faint">Train</p>
                  <p className="truncate text-xs font-medium text-ink-soft">{e.train}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-[9px] uppercase tracking-[0.08em] text-ink-faint">Test</p>
                  <p className="truncate text-xs font-medium text-ink-soft">{e.test}</p>
                </div>
              </div>

              <ul className="mt-3 space-y-1.5">
                {[
                  ['Precision', e.metrics.precision],
                  ['Recall', e.metrics.recall],
                  ['F1', e.metrics.f1],
                  ['mAP@0.5', e.metrics.map50],
                  ['mAP@0.5:0.95', e.metrics.map5095],
                ].map(([k, v]) => (
                  <li key={k}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-2xs text-ink-muted">{k}</span>
                      <span className="tnum text-2xs font-medium text-ink">{pct1(v)}</span>
                    </div>
                    <ProgressBar
                      value={v}
                      size="xs"
                      tone={TONE[e.tone]}
                    />
                  </li>
                ))}
              </ul>

              <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-line-soft pt-2.5">
                {[
                  ['FP', e.counts.fp, 'bad'],
                  ['FN', e.counts.fn, 'warn'],
                  ['ms', e.inferenceMs, 'info'],
                ].map(([k, v, t]) => (
                  <div key={k} className="text-center">
                    <p className="text-[9px] uppercase tracking-[0.06em] text-ink-faint">{k}</p>
                    <p
                      className={cn(
                        'tnum text-xs font-medium',
                        t === 'bad' ? 'text-bad' : t === 'warn' ? 'text-warn' : 'text-info',
                      )}
                    >
                      {v}
                    </p>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* ----------------------------------------------- focused experiment detail */}
      <SectionCard
        title={`${focused.title} — ${focused.train} → ${focused.test}`}
        subtitle="Full metric breakdown for the selected configuration"
        icon={Boxes}
        actions={
          <StatusBadge tone={TONE[focused.tone]} size="sm" dot>
            {focused.domain}
          </StatusBadge>
        }
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
          <div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[
                ['Precision', focused.metrics.precision],
                ['Recall', focused.metrics.recall],
                ['F1', focused.metrics.f1],
                ['mAP@0.5', focused.metrics.map50],
                ['mAP@0.5:0.95', focused.metrics.map5095],
              ].map(([k, v]) => (
                <div key={k} className="rounded border border-line-soft bg-base-850 px-2.5 py-2.5">
                  <p className="truncate text-2xs uppercase tracking-[0.06em] text-ink-faint">{k}</p>
                  <p className="tnum mt-1 text-lg font-semibold leading-none text-ink">{pct1(v)}</p>
                </div>
              ))}
              <div className="rounded border border-line-soft bg-base-850 px-2.5 py-2.5">
                <p className="text-2xs uppercase tracking-[0.06em] text-ink-faint">False Positives</p>
                <p className="tnum mt-1 text-lg font-semibold leading-none text-bad">{focused.counts.fp}</p>
              </div>
              <div className="rounded border border-line-soft bg-base-850 px-2.5 py-2.5">
                <p className="text-2xs uppercase tracking-[0.06em] text-ink-faint">False Negatives</p>
                <p className="tnum mt-1 text-lg font-semibold leading-none text-warn">{focused.counts.fn}</p>
              </div>
              <div className="rounded border border-line-soft bg-base-850 px-2.5 py-2.5">
                <p className="text-2xs uppercase tracking-[0.06em] text-ink-faint">Inference</p>
                <p className="tnum mt-1 text-lg font-semibold leading-none text-info">
                  {focused.inferenceMs}
                  <span className="ml-0.5 text-2xs font-normal text-ink-faint">ms</span>
                </p>
              </div>
            </div>

            <div className="mt-4 rounded border border-line-soft bg-base-850 px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-2xs uppercase tracking-[0.07em] text-ink-faint">
                <TriangleAlert className="h-3 w-3" />
                Interpretation
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                {focused.domain === 'In-domain'
                  ? 'Train and test distributions match, so this row measures the achievable ceiling for the architecture. Use it as the reference point for every other configuration.'
                  : `Performance drops by ${Math.abs(gap.map50 * 100).toFixed(1)} mAP points against the in-domain mean, and mAP@0.5:0.95 by ${Math.abs(
                      gap.map5095 * 100,
                    ).toFixed(1)} points. The strict-IoU metric degrades faster, indicating localisation drift on differently stained cells rather than a pure classification failure.`}
              </p>
            </div>
          </div>

          {/* error composition */}
          <div className="rounded-md border border-line-soft bg-base-850 p-3">
            <p className="mb-2.5 text-2xs font-semibold uppercase tracking-[0.07em] text-ink-muted">
              Error composition
            </p>
            {(() => {
              const total = focused.counts.fp + focused.counts.fn;
              const fpShare = focused.counts.fp / total;
              return (
                <>
                  <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-base-700">
                    <div className="h-full bg-bad" style={{ width: `${fpShare * 100}%` }} />
                    <div className="h-full bg-warn" style={{ width: `${(1 - fpShare) * 100}%` }} />
                  </div>
                  <ul className="mt-3 space-y-2">
                    {[
                      ['False positives', focused.counts.fp, 'bad'],
                      ['False negatives', focused.counts.fn, 'warn'],
                    ].map(([k, v, t]) => (
                      <li key={k} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-xs text-ink-soft">
                          <span
                            className={cn('h-2 w-2 rounded-[2px]', t === 'bad' ? 'bg-bad' : 'bg-warn')}
                          />
                          {k}
                        </span>
                        <span className="tnum text-xs font-medium text-ink">
                          {v}{' '}
                          <span className="font-normal text-ink-faint">
                            ({((v / total) * 100).toFixed(1)}%)
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 border-t border-line-soft pt-2.5">
                    <p className="flex items-center gap-1.5 text-2xs text-ink-faint">
                      <Clock className="h-3 w-3" />
                      Mean latency <span className="tnum font-medium text-ink-soft">{focused.inferenceMs} ms</span>
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </SectionCard>

      {/* --------------------------------------------------- confusion + PR */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Confusion Matrix"
          subtitle="Aggregated over all four experiments"
          icon={Layers}
          height={260}
          footer="Diagonal dominance confirms the class separation; off-diagonal mass concentrates on normal ↔ leukaemia."
        >
          <ConfusionMatrix matrix={CONFUSION_MATRIX} labels={CONFUSION_LABELS} />
        </ChartCard>

        <ChartCard
          title="Precision-Recall by Domain"
          subtitle="In-domain vs cross-domain operating characteristics"
          icon={TrendingDown}
          height={260}
          legend={
            <div className="flex flex-wrap items-center gap-3 text-2xs">
              {[
                ['In-domain mean', CHART.ok],
                ['Cross-domain mean', CHART.bad],
              ].map(([l, c]) => (
                <span key={l} className="flex items-center gap-1.5 text-ink-muted">
                  <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: c }} />
                  {l}
                </span>
              ))}
            </div>
          }
          footer="The cross-domain curve is generated by offsetting the in-domain curve by the measured metric gap."
        >
          <LineChart
            data={buildPrComparison(PR_CURVE, gap.precision)}
            xKey="recall"
            xFormat={pct0}
            yFormat={pct0}
            xDomain={[0, 1]}
            yDomain={[0, 1]}
            height={224}
            series={[
              { key: 'inDomain', label: 'In-domain', color: CHART.ok },
              { key: 'crossDomain', label: 'Cross-domain', color: CHART.bad, dashed: true },
            ]}
          />
        </ChartCard>
      </div>

      {/* ------------------------------------------------------ comparison bars */}
      <ChartCard
        title="Cross-Dataset Comparison"
        subtitle="All four train/test configurations"
        icon={ArrowRightLeft}
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
        footer="Click a bar group in the table below to change the selected experiment."
      >
        <BarChart
          data={comparisonData}
          xKey="experiment"
          height={284}
          yFormat={pct0}
          yDomain={[0, 1]}
          series={[
            { key: 'map50', label: 'mAP@0.5', color: CHART.accent },
            { key: 'map5095', label: 'mAP@0.5:0.95', color: CHART.alt },
            { key: 'f1', label: 'F1', color: CHART.info },
          ]}
        />
      </ChartCard>

      {/* ------------------------------------------------------------- radar */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Metric Profile"
          subtitle="Every experiment across five metrics"
          icon={Layers}
          height={320}
        >
          <RadarChart
            data={radarData}
            height={300}
            series={CROSS_DATASET_EXPERIMENTS.map((e, i) => ({
              key: e.title.replace('Experiment ', 'E'),
              label: `${e.title} · ${e.train}→${e.test}`,
              color: [CHART.ok, CHART.info, CHART.warn, CHART.bad][i],
            }))}
          />
        </ChartCard>

        <SectionCard
          title="Domain Shift Summary"
          subtitle="In-domain mean vs cross-domain mean"
          icon={TrendingDown}
          padded={false}
          actions={
            <StatusBadge tone="bad" size="sm" dot>
              {((1 - meanCross.map50 / meanIn.map50) * 100).toFixed(1)}% relative drop
            </StatusBadge>
          }
        >
          <ul>
            {[
              ['Precision', meanIn.precision, meanCross.precision],
              ['Recall', meanIn.recall, meanCross.recall],
              ['F1', meanIn.f1, meanCross.f1],
              ['mAP@0.5', meanIn.map50, meanCross.map50],
              ['mAP@0.5:0.95', meanIn.map5095, meanCross.map5095],
            ].map(([k, a, b]) => {
              const delta = b - a;
              return (
                <li key={k} className="flex items-center gap-3 border-b border-line-soft px-3.5 py-2.5 last:border-b-0">
                  <span className="w-28 shrink-0 text-xs text-ink-soft">{k}</span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-12 shrink-0 text-[10px] text-ink-faint">in</span>
                      <ProgressBar value={a} size="xs" tone="ok" className="flex-1" />
                      <span className="tnum w-11 shrink-0 text-right text-2xs text-ink-soft">
                        {pct1(a)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-12 shrink-0 text-[10px] text-ink-faint">cross</span>
                      <ProgressBar value={b} size="xs" tone="bad" className="flex-1" />
                      <span className="tnum w-11 shrink-0 text-right text-2xs text-ink-soft">
                        {pct1(b)}
                      </span>
                    </div>
                  </div>
                  <span className="tnum w-14 shrink-0 text-right text-2xs font-medium text-bad">
                    {delta >= 0 ? '+' : ''}
                    {(delta * 100).toFixed(1)}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-line-soft px-3.5 py-2.5">
            <p className="text-[10px] leading-relaxed text-ink-faint">{DATA_NOTICE}</p>
          </div>
        </SectionCard>
      </div>

      {/* -------------------------------------------------------------- table */}
      <SectionCard
        title="Experiment Matrix"
        subtitle="Dataset · training · testing · all metrics"
        icon={Database}
        padded={false}
      >
        <DataTable
          columns={columns}
          rows={CROSS_DATASET_TABLE}
          rowKey={(r) => r.id}
          initialSort={{ key: 'map50', dir: 'desc' }}
          searchable
          searchKeys={['training', 'testing', 'domain', 'id']}
          filters={[
            { key: 'training', label: 'Train', options: ['ALL', 'C-NMC'] },
            { key: 'testing', label: 'Test', options: ['ALL', 'C-NMC'] },
          ]}
          onRowClick={(row) => setFocus(row.id)}
          exportFilename="aqalcd-cross-dataset.csv"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-soft px-3.5 py-2.5">
          <p className="text-2xs text-ink-faint">
            Click any row to load it into the detail panel above.
          </p>
          <div className="flex items-center gap-1.5">
            <StatusBadge tone="ok" size="sm" dot>
              {CROSS_DATASET_TABLE.filter((r) => r.domain === 'In-domain').length} in-domain
            </StatusBadge>
            <StatusBadge tone="bad" size="sm" dot>
              {CROSS_DATASET_TABLE.filter((r) => r.domain === 'Cross-domain').length} cross-domain
            </StatusBadge>
          </div>
        </div>
      </SectionCard>

      <p className="flex items-start gap-2 text-2xs leading-relaxed text-ink-faint">
        <ArrowRight className="mt-px h-3 w-3 shrink-0" />
        Cross-dataset degradation motivates the quality-assessment stage: stain and contrast variation between
        laboratories is handled by adaptive enhancement before inference rather than by retraining.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ utils --- */

function avgMetrics(list) {
  const keys = ['precision', 'recall', 'f1', 'map50', 'map5095'];
  return Object.fromEntries(
    keys.map((k) => [k, list.reduce((s, e) => s + e.metrics[k], 0) / list.length]),
  );
}

/** Offsets the in-domain PR curve by the measured cross-domain precision gap. */
function buildPrComparison(prCurve, gap) {
  return prCurve.map((d) => ({
    recall: d.recall,
    inDomain: d.precision,
    crossDomain: Math.max(0.02, d.precision + gap),
  }));
}
