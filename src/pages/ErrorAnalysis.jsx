import { useMemo, useState } from 'react';
import {
  Filter,
  Grid2x2,
  Image as ImageIcon,
  List,
  Search,
  ShieldAlert,
  Target,
  TrendingDown,
  TriangleAlert,
} from 'lucide-react';

import PageHeader, { MetaItem } from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Button from '../components/Button.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import ImageViewer from '../components/ImageViewer.jsx';
import ChartCard from '../components/charts/ChartCard.jsx';
import { BarChart } from '../components/charts/index.jsx';
import { CHART } from '../components/charts/chartTheme.jsx';
import { IMAGES } from '../data/assets.js';
import { DATA_NOTICE, ERROR_CATEGORIES, ERROR_EXAMPLES } from '../data/mockData.js';
import { downloadCSV } from '../lib/exporters.js';
import { cn } from '../lib/utils.js';

const SEVERITY_TONE = { High: 'bad', Medium: 'warn', Low: 'muted' };

export default function ErrorAnalysis() {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [view, setView] = useState('grid');
  const [detail, setDetail] = useState(null);

  const filtered = useMemo(() => {
    let rows = ERROR_EXAMPLES;
    if (category !== 'all') {
      const label = ERROR_CATEGORIES.find((c) => c.id === category)?.label;
      rows = rows.filter((e) => e.errorType === label);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((e) =>
        [e.id, e.errorType, e.predicted, e.actual, e.cause].some((v) =>
          String(v).toLowerCase().includes(q),
        ),
      );
    }
    return rows;
  }, [category, query]);

  const totalErrors = ERROR_CATEGORIES.reduce((s, c) => s + c.count, 0);
  const activeCategory = ERROR_CATEGORIES.find((c) => c.id === category);

  const chartData = useMemo(
    () =>
      ERROR_CATEGORIES.map((c) => ({
        category: c.label,
        count: c.count,
        share: +(c.share * 100).toFixed(1),
      })),
    [],
  );

  const columns = [
    { key: 'id', header: 'ID', width: 88, render: (r) => <span className="font-mono text-2xs text-ink-muted">{r.id}</span> },
    { key: 'errorType', header: 'Error Type', render: (r) => <span className="text-ink">{r.errorType}</span> },
    { key: 'predicted', header: 'Predicted Class' },
    { key: 'actual', header: 'Actual Class' },
    {
      key: 'confidence',
      header: 'Confidence',
      align: 'right',
      numeric: true,
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <ProgressBar
            value={r.confidence}
            size="xs"
            className="w-12"
            tone={r.confidence >= 0.7 ? 'warn' : 'bad'}
          />
          <span className="w-9 text-right">{r.confidence.toFixed(2)}</span>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      width: 88,
      render: (r) => (
        <StatusBadge tone={SEVERITY_TONE[r.severity]} size="sm" dot>
          {r.severity}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Evaluation"
        icon={ShieldAlert}
        title="Error Analysis"
        subtitle="Failure taxonomy with representative microscopy examples"
        description="Errors are grouped into ten categories spanning detection, classification, image quality and annotation causes. Each example links the visible artefact to the model behaviour it produced."
        actions={
          <Button
            variant="subtle"
            onClick={() => {
              downloadCSV(
                ERROR_EXAMPLES,
                [
                  { key: 'id', label: 'ID' },
                  { key: 'errorType', label: 'Error Type' },
                  { key: 'predicted', label: 'Predicted Class' },
                  { key: 'actual', label: 'Actual Class' },
                  { key: 'confidence', label: 'Confidence' },
                  { key: 'severity', label: 'Severity' },
                  { key: 'cause', label: 'Probable Cause' },
                ],
                'aqalcd-error-analysis.csv',
              );
            }}
          >
            Export error log
          </Button>
        }
        meta={
          <>
            <MetaItem icon={TriangleAlert} label="Total errors" value={totalErrors.toLocaleString('en-US')} tone="warn" />
            <MetaItem icon={Filter} label="Categories" value="10" />
            <MetaItem icon={ImageIcon} label="Examples" value={ERROR_EXAMPLES.length} tone="accent" />
          </>
        }
      />

      {/* ---------------------------------------------------------- category grid */}
      <SectionCard
        title="Error Categories"
        subtitle="Click a category to filter the gallery below"
        icon={Filter}
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={cn(
              'rounded border px-2.5 py-2 text-left transition-colors',
              category === 'all'
                ? 'border-accent/55 bg-accent-soft'
                : 'border-line-soft bg-base-850 hover:border-line-strong',
            )}
          >
            <p className="text-2xs font-semibold uppercase tracking-[0.06em] text-ink-muted">All</p>
            <p className="tnum mt-1 text-lg font-semibold leading-none text-ink">
              {totalErrors.toLocaleString('en-US')}
            </p>
          </button>

          {ERROR_CATEGORIES.map((c) => {
            const active = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(active ? 'all' : c.id)}
                className={cn(
                  'rounded border px-2.5 py-2 text-left transition-colors',
                  active ? 'border-accent/55 bg-accent-soft' : 'border-line-soft bg-base-850 hover:border-line-strong',
                )}
              >
                <p className="truncate text-2xs font-semibold uppercase tracking-[0.05em] text-ink-muted">
                  {c.label}
                </p>
                <p className="tnum mt-1 text-lg font-semibold leading-none text-ink">{c.count}</p>
                <div className="mt-1.5">
                  <ProgressBar
                    value={c.share / 0.35}
                    size="xs"
                    tone={c.tone === 'muted' ? 'muted' : c.tone}
                  />
                </div>
                <p className="tnum mt-1 text-[10px] text-ink-faint">{(c.share * 100).toFixed(0)}% of total</p>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* --------------------------------------------------------- distribution */}
      <ChartCard
        title="Error Distribution"
        subtitle="Count per category across the evaluated split"
        icon={TrendingDown}
        height={260}
        className="xl:max-w-none"
        legend={
          <span className="text-2xs text-ink-muted">
            Highest contributors:{' '}
            <span className="font-medium text-bad">False Positive</span>,{' '}
            <span className="font-medium text-bad">False Negative</span>
          </span>
        }
        footer="Detection errors dominate; quality-driven errors are the addressable subset."
      >
        <BarChart
          data={chartData}
          xKey="category"
          height={224}
          yFormat={(v) => v.toLocaleString('en-US')}
          showLegend={false}
          series={[
            {
              key: 'count',
              label: 'Errors',
              color: CHART.bad,
              cellColors: chartData.map((d) => {
                const cat = ERROR_CATEGORIES.find((c) => c.label === d.category);
                return cat?.tone === 'muted'
                  ? '#68757F'
                  : cat?.tone === 'bad'
                    ? CHART.bad
                    : cat?.tone === 'warn'
                      ? CHART.warn
                      : cat?.tone === 'info'
                        ? CHART.info
                        : CHART.alt;
              }),
            },
          ]}
        />
      </ChartCard>

      {/* --------------------------------------------------------------- gallery */}
      <SectionCard
        title="Error Examples"
        subtitle={
          activeCategory
            ? `${activeCategory.label} — ${filtered.length} example${filtered.length === 1 ? '' : 's'}`
            : `${filtered.length} example${filtered.length === 1 ? '' : 's'}`
        }
        icon={ImageIcon}
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search causes, classes…"
                className="h-8 w-[200px] rounded border border-line bg-base-850 pl-8 pr-2.5 text-xs text-ink placeholder:text-ink-faint outline-none focus:border-accent"
              />
            </div>
            <div className="flex items-center gap-0.5 rounded border border-line bg-base-850 p-0.5">
              {[
                { id: 'grid', icon: Grid2x2, label: 'Grid' },
                { id: 'list', icon: List, label: 'List' },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(v.id)}
                  aria-label={v.label}
                  title={v.label}
                  className={cn(
                    'rounded-sm p-1.5 transition-colors',
                    view === v.id ? 'bg-accent text-white' : 'text-ink-muted hover:bg-base-700 hover:text-ink',
                  )}
                >
                  <v.icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching error examples"
            description="Try clearing the search box or selecting a different category."
            action={
              <Button
                variant="subtle"
                size="sm"
                onClick={() => {
                  setQuery('');
                  setCategory('all');
                }}
              >
                Reset filters
              </Button>
            }
          />
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((e) => (
              <ErrorCard key={e.id} error={e} onClick={() => setDetail(e)} />
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-line-soft">
            {filtered.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => setDetail(e)}
                  className="flex w-full items-center gap-3 px-1 py-2.5 text-left transition-colors hover:bg-base-750"
                >
                  <img
                    src={IMAGES[e.image]}
                    alt={e.errorType}
                    className="h-12 w-16 shrink-0 rounded-sm border border-line object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-ink">
                      {e.errorType} <span className="font-mono text-2xs text-ink-faint">{e.id}</span>
                    </p>
                    <p className="truncate text-2xs text-ink-muted">
                      Predicted <span className="text-ink-soft">{e.predicted}</span> · Actual{' '}
                      <span className="text-ink-soft">{e.actual}</span>
                    </p>
                  </div>
                  <span className="tnum shrink-0 text-xs text-ink-soft">{e.confidence.toFixed(2)}</span>
                  <StatusBadge tone={SEVERITY_TONE[e.severity]} size="sm" dot>
                    {e.severity}
                  </StatusBadge>
                </button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {/* -------------------------------------------------------------- summary */}
      <SectionCard
        title="Error Summary Table"
        subtitle="Predicted vs actual class for every logged failure"
        icon={Target}
        padded={false}
      >
        <div className="max-h-[420px] overflow-y-auto scroll-thin">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-base-750">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    style={{ width: c.width }}
                    className={cn(
                      'whitespace-nowrap border-b border-line px-3 py-2 text-2xs font-semibold uppercase tracking-[0.06em] text-ink-muted',
                      c.align === 'right' && 'text-right',
                    )}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr
                  key={row.id}
                  onClick={() => setDetail(row)}
                  className={cn(
                    'cursor-pointer border-b border-line-soft transition-colors last:border-b-0 hover:bg-accent-soft',
                    i % 2 === 1 && 'bg-base-850/40',
                  )}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        'px-3 py-2 text-xs text-ink-soft',
                        c.numeric && 'tnum text-ink',
                        c.align === 'right' && 'text-right',
                      )}
                    >
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line-soft px-3.5 py-2.5">
          <p className="text-[10px] leading-relaxed text-ink-faint">{DATA_NOTICE}</p>
        </div>
      </SectionCard>

      {/* ------------------------------------------------------------ detail modal */}
      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.errorType} · ${detail.id}` : ''}
        description={detail?.cause}
        icon={TriangleAlert}
        size="lg"
        footer={
          <Button variant="subtle" onClick={() => setDetail(null)}>
            Close
          </Button>
        }
      >
        {detail && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
            <ImageViewer
              src={IMAGES[detail.image]}
              alt={detail.errorType}
              className="aspect-[4/3] w-full"
              showControls={false}
              badge={
                <StatusBadge tone={SEVERITY_TONE[detail.severity]} size="sm" dot>
                  {detail.severity} severity
                </StatusBadge>
              }
            />
            <div className="space-y-3">
              {[
                ['Error type', detail.errorType],
                ['Predicted class', detail.predicted],
                ['Actual class', detail.actual],
                ['Confidence', detail.confidence.toFixed(3)],
                ['Severity', detail.severity],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between gap-3 border-b border-line-soft pb-2 last:border-b-0"
                >
                  <span className="shrink-0 text-2xs uppercase tracking-[0.06em] text-ink-faint">{k}</span>
                  <span className="truncate text-right text-xs font-medium text-ink">{v}</span>
                </div>
              ))}

              <div className="rounded border border-line-soft bg-base-850 px-3 py-2.5">
                <p className="text-2xs uppercase tracking-[0.07em] text-ink-faint">Probable cause</p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{detail.cause}</p>
              </div>

              <div className="rounded border border-line-soft bg-base-850 px-3 py-2.5">
                <p className="text-2xs uppercase tracking-[0.07em] text-ink-faint">Suggested mitigation</p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                  {mitigationFor(detail.errorType)}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* -------------------------------------------------------------- sub-parts --- */

function ErrorCard({ error, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-md border border-line bg-base-850 text-left transition-colors hover:border-line-strong hover:bg-base-800"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#07090B]">
        <img
          src={IMAGES[error.image]}
          alt={error.errorType}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="pointer-events-none absolute left-2 top-2">
          <StatusBadge tone={SEVERITY_TONE[error.severity]} size="sm" dot>
            {error.errorType}
          </StatusBadge>
        </div>
        <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2">
          <span className="font-mono text-[10px] text-ink-soft">{error.id}</span>
          <span className="tnum rounded-sm bg-black/60 px-1.5 py-0.5 text-[10px] text-ink-soft">
            {(error.confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="space-y-2 p-2.5">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[9px] uppercase tracking-[0.07em] text-ink-faint">Predicted</p>
            <p className="truncate text-xs font-medium text-bad">{error.predicted}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.07em] text-ink-faint">Actual</p>
            <p className="truncate text-xs font-medium text-ok">{error.actual}</p>
          </div>
        </div>
        <ProgressBar
          value={error.confidence}
          size="xs"
          tone={error.confidence >= 0.7 ? 'warn' : 'bad'}
        />
        <p className="line-clamp-2 text-2xs leading-relaxed text-ink-muted">{error.cause}</p>
      </div>
    </button>
  );
}

function mitigationFor(type) {
  const map = {
    'Low Quality': 'Route to the adaptive-enhancement stage and re-run detection after denoising and CLAHE.',
    'Low Contrast': 'Apply stain normalisation before inference; consider raising the contrast gate threshold.',
    'Overlapping Cells': 'Lower the NMS IoU threshold or enable tiled inference for dense regions.',
    'Staining Variation': 'Extend the training distribution with additional stain batches, or increase the colour-normalisation weight.',
    'False Positive': 'Increase the confidence threshold or add a negative-example training pass over RBC-only fields.',
    Blur: 'Reject the field at the quality gate, or apply stronger deconvolution before detection.',
    'Similar Morphology': 'Increase input resolution so chromatin texture becomes discriminative, or add a second-stage classifier.',
    'Annotation Problem': 'Re-review the ground-truth box; the model output may be correct against the visual field.',
    'False Negative': 'Investigate suppression by adaptive enhancement — check the preprocessing did not remove the cell.',
    'Dataset-Specific Variation': 'Fine-tune on the target laboratory distribution, or apply stain-aware domain adaptation.',
  };
  return map[type] ?? 'Review the raw field and re-run the pipeline with an alternative enhancement strategy.';
}
