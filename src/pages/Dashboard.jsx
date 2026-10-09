import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Cpu,
  Database,
  Gauge,
  Images,
  LayoutDashboard,
  Microscope,
  Play,
  RefreshCcw,
  Server,
  Sparkles,
  Target,
} from 'lucide-react';

import PageHeader, { MetaItem } from '../components/PageHeader.jsx';
import MetricCard from '../components/MetricCard.jsx';
import SectionCard from '../components/SectionCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import DataTable from '../components/DataTable.jsx';
import Button from '../components/Button.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import WorkflowStepper from '../components/WorkflowStepper.jsx';
import ImageViewer from '../components/ImageViewer.jsx';
import { BarChart, DonutChart, LineChart } from '../components/charts/index.jsx';
import ChartCard from '../components/charts/ChartCard.jsx';
import { CHART } from '../components/charts/chartTheme.jsx';
import { useApp } from '../state/AppState.jsx';
import { IMAGES } from '../data/assets.js';
import {
  DATASET_DISTRIBUTION,
  DATASETS,
  DASHBOARD_METRICS,
  DATA_NOTICE,
  MODEL_PERFORMANCE,
  PIPELINE_STAGES,
  RECENT_EVALUATIONS,
  SYSTEM_STATUS,
  TRAINING_HISTORY,
} from '../data/mockData.js';
import { cn, num } from '../lib/utils.js';

const STATUS_TONE = {
  Completed: 'ok',
  Review: 'warn',
  Failed: 'bad',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [window, setWindow] = useState('all');

  const totalImages = DATASET_DISTRIBUTION.reduce((s, d) => s + d.images, 0);

  const metrics = useMemo(
    () =>
      DASHBOARD_METRICS.map((m) => {
        if (m.id === 'model') return { ...m, value: state.activeModel === 'yolov8n' ? 'YOLOv8n' : m.value };
        return m;
      }),
    [state.activeModel],
  );

  const filteredEvals = useMemo(() => {
    if (state.datasetFilter === 'Both') return RECENT_EVALUATIONS;
    return RECENT_EVALUATIONS.filter((e) => e.dataset === state.datasetFilter);
  }, [state.datasetFilter]);

  const recentHistory = useMemo(
    () => TRAINING_HISTORY.filter((d) => d.epoch % 2 === 0),
    [],
  );

  const pipelineSteps = useMemo(() => {
    const hasImage = Boolean(state.image);
    const hasQuality = Boolean(state.quality);
    const hasDet = Boolean(state.detections);
    const hasExplain = Boolean(state.explanation);
    return PIPELINE_STAGES.map((s, i) => ({
      ...s,
      status: i === 0 ? 'done' : null,
      tone: 'accent',
    })).map((s, i) => {
      const reached = [hasImage, hasQuality, hasQuality, hasDet, hasDet, hasExplain][i];
      return { ...s, status: reached ? 'done' : 'pending' };
    });
  }, [state.image, state.quality, state.detections, state.explanation]);

  const columns = [
    { key: 'dataset', header: 'Dataset', width: 108 },
    { key: 'model', header: 'Model', width: 116 },
    {
      key: 'quality',
      header: 'Quality',
      width: 96,
      render: (row) => (
        <StatusBadge tone={row.quality === 'High' ? 'ok' : row.quality === 'Medium' ? 'warn' : 'bad'} size="sm">
          {row.quality}
        </StatusBadge>
      ),
    },
    {
      key: 'map50',
      header: 'mAP@0.5',
      align: 'right',
      numeric: true,
      render: (row) => row.map50.toFixed(3),
    },
    { key: 'f1', header: 'F1', align: 'right', numeric: true, render: (row) => row.f1.toFixed(3) },
    {
      key: 'status',
      header: 'Status',
      width: 104,
      render: (row) => (
        <StatusBadge tone={STATUS_TONE[row.status] ?? 'muted'} size="sm" dot>
          {row.status}
        </StatusBadge>
      ),
    },
    { key: 'date', header: 'Date', numeric: true, render: (row) => <span className="font-mono text-2xs">{row.date}</span> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Overview"
        icon={LayoutDashboard}
        title="A-QALCD Home Dashboard"
        subtitle="Adaptive Quality-Aware and Explainable Leukemia Cell Detection System"
        description="Prototype control surface for the complete pipeline: image quality assessment, adaptive enhancement, YOLOv8n detection, confidence validation and Grad-CAM++ explanation."
        actions={
          <>
            <Button variant="subtle" icon={RefreshCcw} onClick={() => navigate('/performance')}>
              Refresh metrics
            </Button>
            <Button variant="primary" icon={Play} onClick={() => navigate('/quality-assessment')}>
              Start analysis
            </Button>
          </>
        }
        meta={
          <>
            <MetaItem icon={Cpu} label="Model" value="YOLOv8n" tone="accent" />
            <MetaItem icon={Database} label="Datasets" value="ALL + C-NMC" />
            <MetaItem icon={Server} label="Backend" value="Offline · simulated" tone="warn" />
            <MetaItem icon={Images} label="Records" value={num(totalImages)} />
          </>
        }
      />

      {/* ------------------------------------------------------ metric cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metrics.map((m) => (
          <MetricCard key={m.id} {...m} />
        ))}
      </div>

      {/* --------------------------------------------------------- pipeline */}
      <SectionCard
        title="Detection Pipeline"
        subtitle="Current state of the six-stage workflow"
        icon={Activity}
        actions={
          <Button variant="subtle" size="xs" iconRight={ArrowRight} onClick={() => navigate('/quality-assessment')}>
            Resume
          </Button>
        }
      >
        <WorkflowStepper steps={pipelineSteps} />
        <p className="mt-3 text-2xs leading-relaxed text-ink-faint">
          Stage state is shared across pages — analyse an image on Quality Assessment and the detection and
          explainability pages pick it up automatically.
        </p>
      </SectionCard>

      {/* ------------------------------------------- distribution + performance */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard
          title="Dataset Distribution"
          subtitle="Imaged fields per source"
          icon={Database}
          className="xl:col-span-1"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,150px)_1fr] sm:items-center">
            <DonutChart
              data={DATASET_DISTRIBUTION}
              height={168}
              centerValue={num(totalImages)}
              centerLabel="Total"
            />
            <ul className="space-y-2.5">
              {DATASET_DISTRIBUTION.map((d) => {
                const share = d.images / totalImages;
                return (
                  <li key={d.short}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span
                          className="h-2 w-2 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: d.color }}
                        />
                        <span className="truncate text-xs text-ink-soft">{d.name}</span>
                      </span>
                      <span className="tnum shrink-0 text-xs font-medium text-ink">
                        {num(d.images)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <ProgressBar value={share} tone="accent" size="xs" className="flex-1" />
                      <span className="tnum w-9 shrink-0 text-right text-2xs text-ink-muted">
                        {(share * 100).toFixed(1)}%
                      </span>
                    </div>
                  </li>
                );
              })}
              <li className="border-t border-line-soft pt-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-muted">Combined</span>
                  <span className="tnum text-xs font-medium text-ink">{num(totalImages)}</span>
                </div>
              </li>
            </ul>
          </div>
        </SectionCard>

        <SectionCard
          title="Model Performance"
          subtitle="YOLOv8n · validation split"
          icon={Target}
          className="xl:col-span-2"
          actions={
            <Button variant="subtle" size="xs" onClick={() => navigate('/performance')}>
              Full analytics
            </Button>
          }
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
            <ul className="space-y-3">
              {MODEL_PERFORMANCE.map((m) => (
                <li key={m.metric}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-ink-soft">{m.metric}</span>
                    <span className="tnum shrink-0 text-xs font-medium text-ink">
                      {(m.value * 100).toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar
                    value={m.value}
                    marker={m.target}
                    size="xs"
                    className="[&>div>div]:transition-none"
                    trackClassName="bg-base-700"
                  />
                </li>
              ))}
              <li className="flex items-center gap-1.5 pt-0.5 text-2xs text-ink-faint">
                <span className="h-3 w-px bg-ink/40" />
                Tick mark indicates the target threshold
              </li>
            </ul>

            <div className="min-w-0">
              <BarChart
                data={MODEL_PERFORMANCE}
                xKey="metric"
                height={210}
                yDomain={[0, 1]}
                yFormat={(v) => `${Math.round(v * 100)}%`}
                showLegend={false}
                series={[
                  {
                    key: 'value',
                    label: 'Score',
                    color: CHART.accent,
                    cellColors: MODEL_PERFORMANCE.map((m) => m.color),
                  },
                ]}
              />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ------------------------------------------ recent evals + system status */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard
          title="Recent Evaluations"
          subtitle={`${filteredEvals.length} run${filteredEvals.length === 1 ? '' : 's'} · filter: ${
            state.datasetFilter === 'Both' ? 'All datasets' : state.datasetFilter
          }`}
          icon={Microscope}
          className="xl:col-span-2"
          padded={false}
          actions={
            <div className="flex items-center gap-1">
              {['all', 'completed', 'issues'].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWindow(w)}
                  className={cn(
                    'rounded-sm px-2 py-1 text-2xs capitalize transition-colors',
                    window === w
                      ? 'bg-base-700 text-ink'
                      : 'text-ink-muted hover:bg-base-700 hover:text-ink-soft',
                  )}
                >
                  {w}
                </button>
              ))}
            </div>
          }
        >
          <DataTable
            columns={columns}
            rows={filteredEvals.filter((e) =>
              window === 'all' ? true : window === 'completed' ? e.status === 'Completed' : e.status !== 'Completed',
            )}
            rowKey={(r) => r.id}
            searchKeys={['dataset', 'model', 'status', 'date']}
            exportFilename="aqalcd-recent-evaluations.csv"
            dense
            emptyTitle="No evaluations in this window"
          />
        </SectionCard>

        <SectionCard title="System Status" subtitle="Runtime checks" icon={Server} padded={false}>
          <ul>
            {SYSTEM_STATUS.map((s, i) => (
              <li
                key={s.id}
                className="flex items-center gap-3 border-b border-line-soft px-3.5 py-2.5 last:border-b-0"
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 shrink-0 rounded-full',
                    s.status === 'ok' ? 'bg-ok' : s.status === 'warn' ? 'bg-warn' : 'bg-bad',
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-ink-soft">{s.label}</p>
                  <p className="truncate text-2xs text-ink-faint">{s.detail}</p>
                </div>
                <span
                  className={cn(
                    'tnum shrink-0 font-mono text-2xs',
                    s.status === 'ok' ? 'text-ok' : s.status === 'warn' ? 'text-warn' : 'text-bad',
                  )}
                >
                  {s.value}
                </span>
                {i === 0 && <span className="sr-only">first</span>}
              </li>
            ))}
          </ul>
          <div className="border-t border-line-soft px-3.5 py-2.5">
            <p className="text-[10px] leading-relaxed text-ink-faint">{DATA_NOTICE}</p>
          </div>
        </SectionCard>
      </div>

      {/* ------------------------------------------------- sample field + trend */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard
          title="Sample Microscopy Field"
          subtitle="Bundled demonstration asset"
          icon={Sparkles}
          className="xl:col-span-1"
          actions={
            <Button variant="subtle" size="xs" onClick={() => navigate('/detection')}>
              Open detector
            </Button>
          }
        >
          <ImageViewer
            src={IMAGES.sample}
            alt="Sample blood smear field"
            height={undefined}
            className="aspect-[4/3] w-full"
            showControls={false}
            badge={<StatusBadge tone="accent" size="sm">1280 × 960 · JPG</StatusBadge>}
            caption="Replace src/assets/blood-smear-sample.jpg with your own dataset image."
          />
        </SectionCard>

        <ChartCard
          title="Validation mAP@0.5"
          subtitle="Training convergence · every 2nd epoch"
          icon={Activity}
          height={280}
          className="xl:col-span-2"
          legend={
            <span className="text-2xs text-ink-muted">
              Final <span className="tnum font-medium text-ink">{TRAINING_HISTORY.at(-1).map50.toFixed(3)}</span> ·
              best <span className="tnum font-medium text-ok">
                {Math.max(...TRAINING_HISTORY.map((d) => d.map50)).toFixed(3)}
              </span>
            </span>
          }
        >
          <LineChart
            data={recentHistory}
            xKey="epoch"
            xFormat={(v) => `ep ${v}`}
            yFormat={(v) => `${(v * 100).toFixed(0)}%`}
            yDomain={[0.4, 1]}
            height={244}
            area
            showLegend={false}
            referenceLines={[{ y: 0.9, label: 'target 0.90', color: CHART.ok }]}
            series={[{ key: 'map50', label: 'mAP@0.5', color: CHART.accent }]}
          />
        </ChartCard>
      </div>

      {/* ------------------------------------------------------- dataset cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {DATASETS.map((d) => (
          <SectionCard key={d.id} title={d.label} subtitle={d.description} icon={Database} dense>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { k: 'Images', v: num(d.images) },
                { k: 'Classes', v: d.classes },
                { k: 'Annotations', v: num(d.images * 1.84) },
                { k: 'Source', v: 'Kaggle' },
              ].map((s) => (
                <div key={s.k} className="rounded border border-line-soft bg-base-850 px-2.5 py-2">
                  <p className="text-2xs uppercase tracking-[0.06em] text-ink-faint">{s.k}</p>
                  <p className="tnum mt-1 truncate text-sm font-medium text-ink">{s.v}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="truncate text-2xs text-ink-faint">{d.license}</span>
              <StatusBadge tone="muted" size="sm" icon={Gauge}>
                {d.id === 'ALL' ? 'Primary' : 'Secondary'}
              </StatusBadge>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
