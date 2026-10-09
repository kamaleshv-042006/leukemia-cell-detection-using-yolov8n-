import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Boxes,
  Crosshair,
  Download,
  Eye,
  EyeOff,
  Gauge,
  Info,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Tag,
  Timer,
  TriangleAlert,
} from 'lucide-react';

import PageHeader, { MetaItem } from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Button from '../components/Button.jsx';
import EmptyState from '../components/EmptyState.jsx';
import DataTable from '../components/DataTable.jsx';
import ImageViewer from '../components/ImageViewer.jsx';
import DetectionOverlay from '../components/DetectionOverlay.jsx';
import Modal from '../components/Modal.jsx';
import MetricCard from '../components/MetricCard.jsx';
import { Slider } from '../components/Field.jsx';
import { useApp } from '../state/AppState.jsx';
import { IMAGES } from '../data/assets.js';
import { getClass } from '../data/classes.js';
import { DATA_NOTICE, SAMPLE_DETECTIONS } from '../data/mockData.js';
import { detectionBreakdown, summariseDetections, toDetectionRows } from '../lib/detection.js';
import { downloadCSV, downloadJSON } from '../lib/exporters.js';
import { ENHANCEMENT_TECHNIQUES } from '../data/mockData.js';
import { cn } from '../lib/utils.js';

const STATUS_TONE = { High: 'ok', Review: 'warn', Low: 'bad' };

export default function Detection() {
  const navigate = useNavigate();
  const {
    state,
    runDetectionPipeline,
    setShowBoxes,
    setShowLabels,
    setThreshold,
    toast,
  } = useApp();
  const [exportOpen, setExportOpen] = useState(false);

  const { detections, detectionMeta, detectionLoading, image, quality, appliedTechnique } = state;
  const source = image?.url ?? IMAGES.sample;
  const activeTech = ENHANCEMENT_TECHNIQUES.find((t) => t.id === appliedTechnique);

  // Before any run, preview the seeded sample predictions so the page is
  // populated; the real pipeline overwrites them on "Run Detection".
  const effectiveDetections = detections ?? SAMPLE_DETECTIONS;
  const isPreview = !detections;

  const summary = useMemo(
    () => summariseDetections(effectiveDetections, state.threshold),
    [effectiveDetections, state.threshold],
  );
  const breakdown = useMemo(
    () => detectionBreakdown(effectiveDetections, state.threshold),
    [effectiveDetections, state.threshold],
  );
  const rows = useMemo(
    () => toDetectionRows(effectiveDetections, state.threshold),
    [effectiveDetections, state.threshold],
  );

  const visibleDetections = useMemo(
    () => effectiveDetections.filter((d) => d.confidence >= state.threshold),
    [effectiveDetections, state.threshold],
  );

  const onRun = async () => {
    const result = await runDetectionPipeline();
    if (result) toast(`YOLOv8n returned ${result.detections.length} predictions`, 'ok');
  };

  const onReset = () => {
    setThreshold(0.5);
    setShowBoxes(true);
    setShowLabels(true);
    toast('Viewer reset to defaults', 'info');
  };

  const onExport = (format) => {
    const payload = {
      model: 'YOLOv8n',
      weights: 'yolov8n-aqalcd-best.pt',
      image: image?.name ?? 'blood-smear-sample.jpg',
      quality: quality ? { level: quality.level, score: quality.score } : null,
      threshold: state.threshold,
      iouThreshold: state.settings.inference.iouThreshold,
      summary: {
        detected: summary.total,
        leukemiaCells: summary.malignant,
        normalCells: summary.normal,
        averageConfidence: Number(summary.avgConfidence.toFixed(4)),
        status: summary.band.label,
      },
      detections: rows,
      note: DATA_NOTICE,
    };
    if (format === 'csv') {
      downloadCSV(rows, Object.keys(rows[0] ?? { id: '' }).map((k) => ({ key: k, label: k })), 'aqalcd-detections.csv');
    } else {
      downloadJSON(payload, 'aqalcd-detections.json');
    }
    setExportOpen(false);
    toast(`Result exported as ${format.toUpperCase()}`, 'ok');
  };

  const columns = [
    { key: 'id', header: 'ID', width: 52, align: 'center' },
    {
      key: 'class',
      header: 'Class',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: row.color }} />
          <span className="text-ink">{row.class}</span>
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: 108,
      render: (row) => (
        <StatusBadge tone={row.type === 'Leukemia' ? 'bad' : 'ok'} size="sm">
          {row.type}
        </StatusBadge>
      ),
    },
    {
      key: 'confidence',
      header: 'Confidence',
      align: 'right',
      numeric: true,
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <ProgressBar
            value={row.confidence}
            size="xs"
            className="w-14"
            tone={row.confidence >= 0.85 ? 'ok' : row.confidence >= 0.6 ? 'warn' : 'bad'}
          />
          <span className="w-10 text-right">{row.confidence.toFixed(2)}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: 88,
      render: (row) => (
        <StatusBadge tone={STATUS_TONE[row.status]} size="sm" dot>
          {row.status}
        </StatusBadge>
      ),
    },
    { key: 'x', header: 'X', align: 'right', numeric: true },
    { key: 'y', header: 'Y', align: 'right', numeric: true },
    { key: 'width', header: 'Width', align: 'right', numeric: true },
    { key: 'height', header: 'Height', align: 'right', numeric: true },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Step 4 · Workflow"
        icon={Crosshair}
        title="Leukemia Cell Detection & AI Explanation"
        subtitle="YOLOv8n inference with confidence-gated post-processing"
        description="Bounding boxes, per-cell confidence and a gated summary. The confidence threshold filters the overlay, the summary counters and the results table simultaneously."
        actions={
          <>
            <StatusBadge tone={summary.band.tone} dot pulse={detectionLoading}>
              {summary.band.label}
            </StatusBadge>
            <Button variant="primary" icon={Play} onClick={onRun} loading={detectionLoading}>
              Run Detection
            </Button>
            <Button variant="subtle" icon={Download} onClick={() => setExportOpen(true)}>
              Export Result
            </Button>
          </>
        }
        meta={
          <>
            <MetaItem icon={Boxes} label="Model" value="YOLOv8n" tone="accent" />
            <MetaItem icon={Gauge} label="Threshold" value={state.threshold.toFixed(2)} />
            <MetaItem icon={Timer} label="Latency" value={`${detectionMeta?.inferenceMs ?? 12.4} ms`} />
            <MetaItem icon={Sparkles} label="Enhancement" value={activeTech?.label ?? 'None'} />
            {isPreview && (
              <MetaItem icon={Info} label="Data" value="Preview — run detection for live output" tone="warn" />
            )}
          </>
        }
      />

      {/* pre-flight banner */}
      {!image && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-[rgba(224,163,58,0.3)] bg-warn-soft px-3.5 py-2.5">
          <TriangleAlert className="h-4 w-4 shrink-0 text-warn" />
          <p className="min-w-0 flex-1 text-xs text-ink-soft">
            No image has been uploaded. The bundled sample field is shown below — run the quality stage first
            for the full workflow.
          </p>
          <Button variant="subtle" size="xs" onClick={() => navigate('/quality-assessment')}>
            Go to Quality Assessment
          </Button>
        </div>
      )}

      {/* --------------------------------------------------------- viewer + summary */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <SectionCard
          title="Detection Viewer"
          subtitle={image?.name ?? 'blood-smear-sample.jpg'}
          icon={Eye}
          padded={false}
          actions={
            <>
              <Button
                variant={state.showBoxes ? 'subtle' : 'ghost'}
                size="xs"
                icon={state.showBoxes ? Eye : EyeOff}
                onClick={() => setShowBoxes(!state.showBoxes)}
              >
                {state.showBoxes ? 'Hide Boxes' : 'Show Boxes'}
              </Button>
              <Button
                variant={state.showLabels ? 'subtle' : 'ghost'}
                size="xs"
                icon={Tag}
                onClick={() => setShowLabels(!state.showLabels)}
              >
                {state.showLabels ? 'Hide Labels' : 'Show Labels'}
              </Button>
              <Button variant="ghost" size="xs" icon={RotateCcw} onClick={onReset}>
                Reset
              </Button>
            </>
          }
        >
          <div className="relative">
            <ImageViewer
              src={source}
              alt="Detection result"
              filter={activeTech?.id === 'original' ? 'none' : (activeTech?.filter ?? 'none')}
              className="aspect-[4/3] w-full rounded-none border-0"
              imgClassName="max-h-full"
              overlay={
                <DetectionOverlay
                  detections={visibleDetections}
                  showBoxes={state.showBoxes}
                  showLabels={state.showLabels}
                />
              }
              badge={
                <>
                  <StatusBadge tone="muted" size="sm" icon={Layers}>
                    YOLOv8n · conf ≥ {state.threshold.toFixed(2)}
                  </StatusBadge>
                  {state.showLabels && (
                    <StatusBadge tone="accent" size="sm">
                      {summary.total} shown
                    </StatusBadge>
                  )}
                </>
              }
            />
            {detectionLoading && (
              <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
                <div className="absolute inset-x-0 h-24 animate-scan bg-gradient-to-b from-transparent via-[rgba(45,127,249,0.16)] to-transparent" />
              </div>
            )}
          </div>
        </SectionCard>

        {/* summary panel */}
        <div className="space-y-4">
          <SectionCard title="Detection Summary" subtitle="Gated by confidence threshold" icon={Gauge}>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'Detected Cells', value: summary.total, tone: 'accent', icon: Boxes },
                {
                  label: 'Leukemia Cells',
                  value: summary.malignant,
                  tone: 'bad',
                  icon: TriangleAlert,
                },
                { label: 'Normal Cells', value: summary.normal, tone: 'ok', icon: Eye },
                {
                  label: 'Average Confidence',
                  value: `${(summary.avgConfidence * 100).toFixed(1)}%`,
                  tone: summary.avgConfidence >= 0.85 ? 'ok' : summary.avgConfidence >= 0.6 ? 'warn' : 'bad',
                  icon: Gauge,
                },
              ].map((s) => (
                <div key={s.label} className="rounded border border-line-soft bg-base-850 px-2.5 py-2.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-2xs uppercase tracking-[0.06em] text-ink-faint">
                      {s.label}
                    </span>
                    <s.icon
                      className={cn(
                        'h-3 w-3 shrink-0',
                        s.tone === 'ok' && 'text-ok',
                        s.tone === 'bad' && 'text-bad',
                        s.tone === 'accent' && 'text-accent',
                      )}
                    />
                  </div>
                  <p className="tnum mt-1.5 text-xl font-semibold leading-none text-ink">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 rounded border border-line-soft bg-base-850 px-2.5 py-2">
              <span className="text-2xs uppercase tracking-[0.06em] text-ink-faint">Prediction Status</span>
              <StatusBadge tone={summary.band.tone} dot pulse>
                {summary.band.label}
              </StatusBadge>
            </div>

            {summary.requiresReview && (
              <p className="mt-2 flex items-start gap-1.5 rounded border border-[rgba(224,163,58,0.28)] bg-warn-soft px-2.5 py-2 text-2xs leading-relaxed text-warn">
                <TriangleAlert className="mt-px h-3 w-3 shrink-0" />
                At least one prediction is below 0.60 — flagged for manual review in a real deployment.
              </p>
            )}

            {/* confidence bars per class */}
            <div className="mt-4 border-t border-line-soft pt-3">
              <p className="mb-2.5 text-2xs font-semibold uppercase tracking-[0.07em] text-ink-muted">
                Confidence by class
              </p>
              {breakdown.length ? (
                <ul className="space-y-2.5">
                  {breakdown.map((b) => (
                    <li key={b.classId}>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span
                            className="h-2 w-2 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: b.color }}
                          />
                          <span className="truncate text-xs text-ink-soft">{b.label}</span>
                          <span className="tnum shrink-0 text-2xs text-ink-faint">×{b.count}</span>
                        </span>
                        <span className="tnum shrink-0 text-xs font-medium text-ink">
                          {(b.avgConfidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <ProgressBar value={b.avgConfidence} size="xs" />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-2xs text-ink-muted">
                  No detections pass the current threshold. Lower it to reveal predictions.
                </p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Confidence Threshold" subtitle="Filters overlay, summary and table" icon={Gauge}>
            <Slider
              label="Confidence Threshold"
              value={state.threshold}
              onChange={setThreshold}
              min={0}
              max={0.95}
              step={0.05}
              format={(v) => v.toFixed(2)}
              ticks={['0.00', '0.25', '0.50', '0.75', '0.95']}
            />
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-line-soft pt-3 text-2xs">
              <span className="text-ink-faint">
                <span className="tnum font-medium text-ink">{summary.total}</span> shown ·{' '}
                <span className="tnum font-medium text-ink-muted">{summary.hidden}</span> hidden
              </span>
              <Button variant="ghost" size="xs" onClick={() => setThreshold(0.5)}>
                Reset to 0.50
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Next Step" subtitle="Explain the prediction" icon={Sparkles} dense>
            <div className="space-y-2.5">
              <p className="text-2xs leading-relaxed text-ink-muted">
                Generate a Grad-CAM++ map to inspect which regions drove the top prediction, and compare
                attribution stability across quality bands.
              </p>
              <Button
                variant="primary"
                fullWidth
                iconRight={ArrowRight}
                onClick={() => navigate('/explainability')}
              >
                Generate Explanation
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ------------------------------------------------------------- metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Inference Time"
          value={`${detectionMeta?.inferenceMs ?? 12.4} ms`}
          sub="Simulated · batch 1"
          icon="Timer"
          tone="accent"
        />
        <MetricCard
          label="Throughput"
          value={`${detectionMeta?.fps ?? 80.6} FPS`}
          sub="CUDA (simulated)"
          icon="Gauge"
          tone="info"
        />
        <MetricCard
          label="Max Confidence"
          value={`${(summary.maxConfidence * 100).toFixed(1)}%`}
          sub="Highest visible score"
          icon="Sparkles"
          tone="alt"
        />
        <MetricCard
          label="Cells Suppressed"
          value={summary.hidden}
          sub={`Below ${state.threshold.toFixed(2)}`}
          icon="EyeOff"
          tone={summary.hidden ? 'warn' : 'ok'}
        />
      </div>

      {/* -------------------------------------------------------------- table */}
      <SectionCard
        title="Detection Results"
        subtitle={`${rows.length} prediction${rows.length === 1 ? '' : 's'} above the threshold`}
        icon={Tag}
        padded={false}
      >
        {rows.length ? (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            searchable
            searchPlaceholder="Filter by class, type or status…"
            searchKeys={['class', 'type', 'status']}
            filters={[
              { key: 'type', label: 'Type', options: ['Leukemia', 'Normal'] },
              { key: 'status', label: 'Status', options: ['High', 'Review', 'Low'] },
            ]}
            initialSort={{ key: 'confidence', dir: 'desc' }}
            exportFilename="aqalcd-detections.csv"
            dense
          />
        ) : (
          <div className="p-4">
            <EmptyState
              icon={Crosshair}
              title="No detections above threshold"
              description={`All ${effectiveDetections.length} predictions fall below ${state.threshold.toFixed(
                2,
              )}. Lower the confidence threshold to display them.`}
              compact
              action={
                <Button variant="subtle" size="sm" onClick={() => setThreshold(0.3)}>
                  Set threshold to 0.30
                </Button>
              }
            />
          </div>
        )}
      </SectionCard>

      <p className="text-2xs leading-relaxed text-ink-faint">{DATA_NOTICE}</p>

      <Modal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Export detection result"
        description="Generated entirely in the browser — no server involved."
        icon={Download}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setExportOpen(false)}>
              Cancel
            </Button>
            <Button variant="subtle" icon={Download} onClick={() => onExport('csv')}>
              CSV
            </Button>
            <Button variant="primary" icon={Download} onClick={() => onExport('json')}>
              JSON
            </Button>
          </>
        }
      >
        <ul className="space-y-2 text-xs text-ink-soft">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span>
              <span className="font-medium text-ink">CSV</span> — one row per detection with normalised box
              geometry.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-info" />
            <span>
              <span className="font-medium text-ink">JSON</span> — full payload including model metadata,
              thresholds and the quality report.
            </span>
          </li>
        </ul>
        <div className="mt-3 rounded border border-line-soft bg-base-850 px-3 py-2">
          <p className="text-2xs text-ink-faint">Preview</p>
          <p className="tnum mt-1 font-mono text-2xs text-ink-muted">
            {summary.total} rows · conf ≥ {state.threshold.toFixed(2)} · {summary.malignant} leukemia ·{' '}
            {summary.normal} normal
          </p>
        </div>
      </Modal>
    </div>
  );
}

export { getClass };
