import { useMemo, useState } from 'react';
import {
  Activity,
  ChartLine,
  Crosshair,
  Gauge,
  Radar,
  Scale,
  Target,
  Timer,
  TrendingUp,
  Zap,
} from 'lucide-react';

import PageHeader, { MetaItem } from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import MetricCard from '../components/MetricCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Tabs from '../components/Tabs.jsx';
import ChartCard from '../components/charts/ChartCard.jsx';
import { LineChart, RadarChart, BarChart } from '../components/charts/index.jsx';
import { CHART } from '../components/charts/chartTheme.jsx';
import {
  CONFIDENCE_DISTRIBUTION,
  MAP5095_CURVE,
  MAP50_CURVE,
  MODEL_PERFORMANCE,
  PERFORMANCE_METRICS,
  PRECISION_CURVE,
  PR_CURVE,
  RECALL_CURVE,
  TRAINING_HISTORY,
  DATA_NOTICE,
} from '../data/mockData.js';
import { downloadCSV } from '../lib/exporters.js';
import { cn } from '../lib/utils.js';

const pct = (v) => `${(v * 100).toFixed(0)}%`;
const dec = (v) => v.toFixed(3);

export default function Performance() {
  const [range, setRange] = useState('all');

  const history = useMemo(() => {
    if (range === 'all') return TRAINING_HISTORY;
    const window = range === 'last25' ? 25 : 50;
    return TRAINING_HISTORY.slice(-window);
  }, [range]);

  const best = useMemo(
    () => ({
      map50: Math.max(...TRAINING_HISTORY.map((d) => d.map50)),
      map5095: Math.max(...TRAINING_HISTORY.map((d) => d.map5095)),
      epoch: TRAINING_HISTORY.reduce((bestRow, d) => (d.map50 > bestRow.map50 ? d : bestRow)),
    }),
    [],
  );

  const lossSeries = [
    { key: 'box_loss', label: 'box_loss', color: CHART.accent },
    { key: 'obj_loss', label: 'obj_loss', color: CHART.info },
    { key: 'cls_loss', label: 'cls_loss', color: CHART.alt },
  ];
  const valLossSeries = [
    { key: 'val_box_loss', label: 'val_box_loss', color: CHART.accent, dashed: true },
    { key: 'val_obj_loss', label: 'val_obj_loss', color: CHART.info, dashed: true },
    { key: 'val_cls_loss', label: 'val_cls_loss', color: CHART.alt, dashed: true },
  ];

  const radarData = useMemo(
    () => [
      { metric: 'Precision', 'Model A': 0.851, 'Model F (A-QALCD)': 0.943 },
      { metric: 'Recall', 'Model A': 0.792, 'Model F (A-QALCD)': 0.921 },
      { metric: 'F1', 'Model A': 0.82, 'Model F (A-QALCD)': 0.932 },
      { metric: 'mAP@0.5', 'Model A': 0.813, 'Model F (A-QALCD)': 0.918 },
      { metric: 'mAP@0.5:0.95', 'Model A': 0.612, 'Model F (A-QALCD)': 0.746 },
      { metric: 'Contrast robustness', 'Model A': 0.548, 'Model F (A-QALCD)': 0.889 },
      { metric: 'Blur robustness', 'Model A': 0.502, 'Model F (A-QALCD)': 0.861 },
    ],
    [],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Evaluation"
        icon={Activity}
        title="Performance Analytics & Robustness Evaluation"
        subtitle="Training convergence, threshold behaviour and quality robustness"
        description="All curves are rendered from a deterministic 120-epoch simulated training run. Use the epoch-range control to inspect convergence detail."
        actions={
          <Tabs
            items={[
              { id: 'last25', label: 'Last 25' },
              { id: 'last50', label: 'Last 50' },
              { id: 'all', label: 'All 120' },
            ]}
            value={range}
            onChange={setRange}
            variant="segmented"
            size="sm"
            ariaLabel="Epoch range"
          />
        }
        meta={
          <>
            <MetaItem icon={Target} label="Best mAP@0.5" value={dec(best.map50)} tone="ok" />
            <MetaItem icon={Radar} label="Best epoch" value={`${best.epoch.epoch}`} />
            <MetaItem icon={Zap} label="Model" value="YOLOv8n" tone="accent" />
            <MetaItem icon={Timer} label="Train time" value="2 h 41 m" />
          </>
        }
      />

      {/* --------------------------------------------------------- metric cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        {PERFORMANCE_METRICS.map((m) => (
          <MetricCard
            key={m.id}
            label={m.label}
            value={m.display}
            sub={m.sub}
            icon={m.icon}
            tone={m.tone}
            progress={m.value <= 1 ? m.value : undefined}
          />
        ))}
      </div>

      {/* ------------------------------------------------------------- losses */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Training Loss"
          subtitle="box / objectness / classification · train split"
          icon={TrendingUp}
          height={280}
          footer={`Final epoch: box ${dec(history.at(-1).box_loss)} · obj ${dec(history.at(-1).obj_loss)} · cls ${dec(
            history.at(-1).cls_loss,
          )}`}
        >
          <LineChart
            data={history}
            xKey="epoch"
            xFormat={(v) => `ep ${v}`}
            yFormat={(v) => v.toFixed(2)}
            height={244}
            yDomain={[0, 3]}
            series={lossSeries}
          />
        </ChartCard>

        <ChartCard
          title="Validation Loss"
          subtitle="Held-out split · generalisation gap"
          icon={Crosshair}
          height={280}
          footer={`Final epoch: box ${dec(history.at(-1).val_box_loss)} · obj ${dec(
            history.at(-1).val_obj_loss,
          )} · cls ${dec(history.at(-1).val_cls_loss)}`}
        >
          <LineChart
            data={history}
            xKey="epoch"
            xFormat={(v) => `ep ${v}`}
            yFormat={(v) => v.toFixed(2)}
            height={244}
            yDomain={[0, 3]}
            series={valLossSeries}
          />
        </ChartCard>
      </div>

      {/* -------------------------------------------------------- PR threshold */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Precision Curve"
          subtitle="Precision vs confidence threshold"
          icon={Crosshair}
          height={280}
          footer="Precision rises monotonically as the acceptance threshold is tightened."
        >
          <LineChart
            data={PRECISION_CURVE}
            xKey="threshold"
            xFormat={(v) => v.toFixed(2)}
            yFormat={pct}
            height={244}
            yDomain={[0.6, 1]}
            area
            referenceLines={[{ y: 0.943, label: 'operating point', color: CHART.ok }]}
            series={[
              { key: 'precision', label: 'Precision', color: CHART.accent },
              { key: 'f1', label: 'F1', color: CHART.info },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Recall Curve"
          subtitle="Recall vs confidence threshold"
          icon={Gauge}
          height={280}
          footer="Recall decays as the threshold rises — the classic precision/recall trade-off."
        >
          <LineChart
            data={RECALL_CURVE}
            xKey="threshold"
            xFormat={(v) => v.toFixed(2)}
            yFormat={pct}
            height={244}
            yDomain={[0, 1]}
            area
            referenceLines={[{ y: 0.921, label: 'operating point', color: CHART.warn }]}
            series={[{ key: 'recall', label: 'Recall', color: CHART.info }]}
          />
        </ChartCard>
      </div>

      {/* ------------------------------------------------------------ mAP curves */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="mAP@0.5 Curve"
          subtitle="Mean average precision at IoU 0.50"
          icon={ChartLine}
          height={280}
          footer={`Best ${dec(best.map50)} at epoch ${best.epoch.epoch}`}
        >
          <LineChart
            data={MAP50_CURVE.filter((d) => (range === 'all' ? true : d.epoch > 120 - Number(range.replace('last', ''))))}
            xKey="epoch"
            xFormat={(v) => `ep ${v}`}
            yFormat={pct}
            height={244}
            yDomain={[0.5, 1]}
            area
            referenceLines={[{ y: 0.9, label: 'target 0.90', color: CHART.ok }]}
            series={[{ key: 'map50', label: 'mAP@0.5', color: CHART.accent }]}
          />
        </ChartCard>

        <ChartCard
          title="mAP@0.5:0.95 Curve"
          subtitle="Strict COCO-style average across IoU 0.50 → 0.95"
          icon={Radar}
          height={280}
          footer={`Best ${dec(best.map5095)} — the metric that separates a prototype from a usable model.`}
        >
          <LineChart
            data={MAP5095_CURVE.filter((d) => (range === 'all' ? true : d.epoch > 120 - Number(range.replace('last', ''))))}
            xKey="epoch"
            xFormat={(v) => `ep ${v}`}
            yFormat={pct}
            height={244}
            yDomain={[0.2, 0.85]}
            area
            referenceLines={[{ y: 0.72, label: 'target 0.72', color: CHART.warn }]}
            series={[{ key: 'map5095', label: 'mAP@0.5:0.95', color: CHART.alt }]}
          />
        </ChartCard>
      </div>

      {/* ------------------------------------------------- PR curve + distribution */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          title="Precision-Recall Curve"
          subtitle="ALL validation split · 41 operating points"
          icon={Scale}
          height={320}
          className="xl:col-span-2"
          legend={
            <div className="flex flex-wrap items-center gap-3 text-2xs">
              {[
                ['PR curve', CHART.accent],
                ['F1 iso-line', CHART.info],
              ].map(([l, c]) => (
                <span key={l} className="flex items-center gap-1.5 text-ink-muted">
                  <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: c }} />
                  {l}
                </span>
              ))}
            </div>
          }
          footer="Area under this curve is the operating-characteristic summary of the detector."
        >
          <LineChart
            data={PR_CURVE}
            xKey="recall"
            xFormat={pct}
            yFormat={pct}
            height={284}
            yDomain={[0, 1]}
            xDomain={[0, 1]}
            area
            series={[
              { key: 'precision', label: 'Precision', color: CHART.accent },
              { key: 'f1', label: 'F1', color: CHART.info, dashed: true },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Confidence Distribution"
          subtitle="Raw-model score histogram"
          icon={Radar}
          height={320}
          footer="Sharp right skew indicates a well-calibrated detector."
        >
          <BarChart
            data={CONFIDENCE_DISTRIBUTION}
            xKey="bin"
            height={284}
            yFormat={(v) => v.toLocaleString('en-US')}
            showLegend
            legendHeight={26}
            series={[
              { key: 'count', label: 'All detections', color: 'rgba(45,127,249,0.55)' },
              { key: 'actual', label: 'True positives', color: CHART.ok },
            ]}
            stacked
          />
        </ChartCard>
      </div>

      {/* ------------------------------------------------------------- summary */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <SectionCard
          title="Robustness Comparison"
          subtitle="Baseline YOLOv8n vs the final A-QALCD model"
          icon={Radar}
          exportData={() => {
            downloadCSV(
              MODEL_PERFORMANCE.map((m) => ({ metric: m.metric, score: m.value, target: m.target })),
              [
                { key: 'metric', label: 'Metric' },
                { key: 'score', label: 'Score' },
                { key: 'target', label: 'Target' },
              ],
              'aqalcd-performance.csv',
            );
          }}
          exportName="Export"
        >
          <RadarChart
            data={radarData}
            height={300}
            series={[
              { key: 'Model A', label: 'Model A · Basic YOLOv8n', color: CHART.ink ?? '#68757F' },
              { key: 'Model F (A-QALCD)', label: 'Model F · A-QALCD', color: CHART.accent },
            ]}
          />
        </SectionCard>

        <SectionCard title="Metric Targets" subtitle="Acceptance thresholds per specification" icon={Target} padded={false}>
          <ul>
            {MODEL_PERFORMANCE.map((m) => {
              const met = m.value >= m.target;
              return (
                <li key={m.metric} className="border-b border-line-soft px-3.5 py-3 last:border-b-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-ink-soft">{m.metric}</span>
                    <span className="flex items-center gap-2">
                      <span className="tnum text-xs font-medium text-ink">{(m.value * 100).toFixed(1)}%</span>
                      <StatusBadge tone={met ? 'ok' : 'warn'} size="sm" dot>
                        {met ? 'Met' : 'Below'}
                      </StatusBadge>
                    </span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={m.value} size="xs" marker={m.target} tone={met ? 'ok' : 'warn'} />
                  </div>
                  <p className="tnum mt-1 text-[10px] text-ink-faint">
                    target {(m.target * 100).toFixed(0)}% · margin{' '}
                    <span className={cn(m.value >= m.target ? 'text-ok' : 'text-warn')}>
                      {((m.value - m.target) * 100 >= 0 ? '+' : '') + ((m.value - m.target) * 100).toFixed(1)} pts
                    </span>
                  </p>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-line-soft px-3.5 py-2.5">
            <p className="text-[10px] leading-relaxed text-ink-faint">{DATA_NOTICE}</p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
