import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Crosshair,
  GitBranch,
  Gauge,
  ImagePlus,
  Info,
  Layers,
  ScanLine,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  SplitSquareVertical,
  Wand2,
} from 'lucide-react';

import PageHeader, { MetaItem } from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import QualityGauge from '../components/QualityGauge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Button from '../components/Button.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ImageViewer from '../components/ImageViewer.jsx';
import UploadZone from '../components/UploadZone.jsx';
import { Select, Slider, Toggle } from '../components/Field.jsx';
import { useApp } from '../state/AppState.jsx';
import { IMAGES } from '../data/assets.js';
import {
  ENHANCEMENT_STRATEGIES,
  ENHANCEMENT_TECHNIQUES,
  QUALITY_BRANCHES,
  QUALITY_GATEWAY_FLOW,
  DATA_NOTICE,
} from '../data/mockData.js';
import { cn } from '../lib/utils.js';

const LEVEL_TONE = { HIGH: 'ok', MEDIUM: 'warn', LOW: 'bad' };

const METRIC_META = [
  { key: 'sharpness', label: 'Sharpness', unit: '', hint: 'Variance of Laplacian', max: 100 },
  { key: 'contrast', label: 'Contrast', unit: '', hint: 'RMS contrast (Michelson)', max: 100 },
  { key: 'brightness', label: 'Brightness', unit: '', hint: 'Mean luma deviation', max: 100 },
  { key: 'colorQuality', label: 'Colour Quality', unit: '', hint: 'Stain saturation & balance', max: 100 },
];

export default function QualityAssessment() {
  const navigate = useNavigate();
  const {
    state,
    setStrategy,
    setTechnique,
    setThreshold,
    runDetectionPipeline,
    toast,
  } = useApp();
  const { quality, image, strategy, appliedTechnique, enhancementApplied, qualityLoading } = state;
  const [autoApply, setAutoApply] = useState(true);

  const activeTechnique = useMemo(
    () => ENHANCEMENT_TECHNIQUES.find((t) => t.id === appliedTechnique) ?? ENHANCEMENT_TECHNIQUES[0],
    [appliedTechnique],
  );

  const previewSrc = image?.url ?? IMAGES.sample;

  const onContinue = async () => {
    if (!quality) {
      toast('Run the quality analysis first', 'warn');
      return;
    }
    const result = await runDetectionPipeline();
    if (result) {
      toast(`Detection complete — ${result.detections.length} cells returned`, 'ok');
      navigate('/detection');
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Step 2 · Workflow"
        icon={Gauge}
        title="Quality Assessment & Adaptive Processing"
        subtitle="No-reference image quality analysis drives an adaptive decision before YOLOv8n inference"
        description="Sharpness, contrast, brightness, noise and colour quality are measured, classified into High / Medium / Low, and mapped to an enhancement strategy. Nothing is enhanced automatically unless a strategy is selected."
        actions={
          <>
            <StatusBadge tone={quality ? LEVEL_TONE[quality.level] : 'muted'} dot pulse={qualityLoading}>
              {quality ? `Quality: ${quality.level}` : qualityLoading ? 'Analysing…' : 'Awaiting analysis'}
            </StatusBadge>
            <Button
              variant="primary"
              iconRight={ArrowRight}
              onClick={onContinue}
              disabled={!quality}
              title={quality ? 'Run YOLOv8n detection' : 'Analyse an image first'}
            >
              Continue to Detection
            </Button>
          </>
        }
        meta={
          <>
            <MetaItem icon={ScanLine} label="Metrics" value="5 no-reference" />
            <MetaItem icon={GitBranch} label="Branches" value="3" />
            <MetaItem icon={Sparkles} label="Enhancer" value={activeTechnique.label} tone="accent" />
            <MetaItem
              icon={ShieldCheck}
              label="Enhancement applied"
              value={enhancementApplied ? 'Yes' : 'No'}
              tone={enhancementApplied ? 'warn' : 'muted'}
            />
          </>
        }
      />

      {/* ------------------------------------------------------------- upload */}
      <SectionCard
        title="Upload Peripheral Blood Smear Image"
        subtitle="Stage 1 — supply a microscopy field for analysis"
        icon={ImagePlus}
        actions={
          quality && (
            <StatusBadge tone="muted" size="sm" icon={Info}>
              Report {quality.id}
            </StatusBadge>
          )
        }
      >
        <UploadZone />
        {state.imageError && (
          <p className="mt-3 rounded border border-[rgba(225,85,90,0.3)] bg-bad-soft px-3 py-2 text-xs text-bad">
            {state.imageError}
          </p>
        )}
      </SectionCard>

      {/* --------------------------------------------------------- metrics row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <SectionCard
          title="Overall Quality Score"
          subtitle={quality ? `Report ${quality.id}` : 'No report generated yet'}
          icon={Gauge}
        >
          {quality ? (
            <div className="flex flex-col items-center">
              <QualityGauge
                value={quality.score}
                tone={LEVEL_TONE[quality.level]}
                label={`${quality.score.toFixed(1)} / 100`}
                sublabel={quality.noise ? `Noise: ${quality.noise}` : undefined}
                size={176}
              />
              <StatusBadge
                tone={LEVEL_TONE[quality.level]}
                className="mt-3"
                pulse
                dot
              >
                {quality.level} QUALITY
              </StatusBadge>

              <div className="mt-4 w-full rounded border border-line-soft bg-base-850 px-3 py-2.5">
                <p className="text-2xs uppercase tracking-[0.07em] text-ink-faint">Adaptive decision</p>
                <p className="mt-1 text-[13px] font-medium text-ink">{quality.decision}</p>
                <p className="mt-0.5 text-2xs leading-relaxed text-ink-muted">{quality.rationale}</p>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Gauge}
              title="No quality report"
              description="Load or upload an image above, then press Analyze to generate the five no-reference metrics."
              compact
            />
          )}
        </SectionCard>

        <SectionCard
          title="Quality Metrics"
          subtitle="Five no-reference measures · normalised 0–100"
          icon={ScanLine}
          actions={
            quality && (
              <Button
                variant="ghost"
                size="xs"
                icon={Wand2}
                onClick={() => setThreshold(state.threshold)}
              >
                Detection gate {state.threshold.toFixed(2)}
              </Button>
            )
          }
        >
          {quality ? (
            <>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {METRIC_META.map((m) => {
                  const v = quality.metrics[m.key];
                  const tone = v >= 70 ? 'ok' : v >= 50 ? 'warn' : 'bad';
                  return (
                    <div key={m.key} className="rounded border border-line-soft bg-base-850 px-3 py-2.5">
                      <div className="mb-1.5 flex items-baseline justify-between gap-2">
                        <span className="text-xs text-ink-soft">{m.label}</span>
                        <span
                          className={cn(
                            'tnum text-base font-semibold leading-none',
                            tone === 'ok' && 'text-ok',
                            tone === 'warn' && 'text-warn',
                            tone === 'bad' && 'text-bad',
                          )}
                        >
                          {v.toFixed(1)}
                        </span>
                      </div>
                      <ProgressBar value={v} tone={tone} size="xs" />
                      <p className="mt-1.5 text-[10px] text-ink-faint">{m.hint}</p>
                    </div>
                  );
                })}

                <div className="rounded border border-line-soft bg-base-850 px-3 py-2.5">
                  <div className="mb-1.5 flex items-baseline justify-between gap-2">
                    <span className="text-xs text-ink-soft">Noise</span>
                    <span
                      className={cn(
                        'text-base font-semibold leading-none',
                        quality.noise === 'Low'
                          ? 'text-ok'
                          : quality.noise === 'Moderate'
                            ? 'text-warn'
                            : 'text-bad',
                      )}
                    >
                      {quality.noise}
                    </span>
                  </div>
                  <ProgressBar
                    value={quality.metrics.noiseIndex}
                    tone={
                      quality.noise === 'Low' ? 'ok' : quality.noise === 'Moderate' ? 'warn' : 'bad'
                    }
                    size="xs"
                  />
                  <p className="mt-1.5 text-[10px] text-ink-faint">Noise index · higher = noisier</p>
                </div>
              </div>

              <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-line-soft pt-3 text-2xs text-ink-faint">
                <span>
                  Analysed <span className="font-mono text-ink-muted">{new Date(quality.analysedAt).toLocaleString()}</span>
                </span>
                <span>
                  Recommended <span className="font-medium text-ink-soft">{quality.recommendedStrategy}</span>
                </span>
                <span>
                  Applied <span className="font-medium text-ink-soft">{quality.appliedStrategy}</span>
                </span>
              </div>
            </>
          ) : (
            <EmptyState
              icon={ScanLine}
              title="Metrics unavailable"
              description="Sharpness, contrast, brightness, noise and colour quality appear here once an image has been analysed."
              compact
            />
          )}
        </SectionCard>
      </div>

      {/* ------------------------------------------------------ decision flow */}
      <SectionCard
        title="Quality Decision Gateway"
        subtitle="How the measured score selects the processing path"
        icon={GitBranch}
        actions={
          quality && (
            <StatusBadge tone={LEVEL_TONE[quality.level]} size="sm">
              Branch taken: {quality.level}
            </StatusBadge>
          )
        }
      >
        <div className="overflow-x-auto scroll-thin">
          <div className="flex min-w-[720px] flex-col items-center">
            {QUALITY_GATEWAY_FLOW.slice(0, 3).map((node, i) => (
              <FlowNode key={node.id} node={node} active={i < 3} highlight={i === 2 && quality} />
            ))}

            {/* branch row */}
            <div className="w-full px-2">
              <div className="mx-auto h-5 w-px bg-line" />
              <div className="mx-auto h-px w-[50%] bg-line" />
              <div className="grid grid-cols-3 gap-3">
                {QUALITY_BRANCHES.map((b) => {
                  const taken = quality?.level === b.level;
                  return (
                    <div key={b.level} className="relative pt-5">
                      <span
                        className={cn(
                          'absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-line',
                        )}
                      />
                      <div
                        className={cn(
                          'h-full rounded border px-3 py-2.5 transition-colors',
                          taken
                            ? b.tone === 'ok'
                              ? 'border-[rgba(47,191,113,0.45)] bg-ok-soft'
                              : b.tone === 'warn'
                                ? 'border-[rgba(224,163,58,0.45)] bg-warn-soft'
                                : 'border-[rgba(225,85,90,0.45)] bg-bad-soft'
                            : 'border-line-soft bg-base-850',
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              'text-xs font-semibold',
                              taken ? 'text-ink' : 'text-ink-muted',
                            )}
                          >
                            {b.level}
                          </span>
                          <span className="tnum text-2xs text-ink-faint">{b.scoreRange}</span>
                        </div>
                        <p className={cn('mt-1 text-[13px]', taken ? 'text-ink-soft' : 'text-ink-muted')}>
                          {b.action}
                        </p>
                        <p className="mt-0.5 text-2xs leading-relaxed text-ink-faint">{b.detail}</p>
                        {taken && (
                          <StatusBadge tone={b.tone} size="sm" dot pulse className="mt-2">
                            Selected
                          </StatusBadge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* merge back */}
            <div className="w-full px-2">
              <div className="mx-auto h-5 w-px bg-line" />
            </div>

            {QUALITY_GATEWAY_FLOW.slice(4).map((node) => (
              <FlowNode key={node.id} node={node} highlight={Boolean(state.detections)} />
            ))}
          </div>
        </div>

        <p className="mt-4 border-t border-line-soft pt-3 text-2xs leading-relaxed text-ink-faint">
          {DATA_NOTICE} Scores and classifications on this page are produced by a simulated analyser.
        </p>
      </SectionCard>

      {/* -------------------------------------------------------- before/after */}
      <SectionCard
        title="Before / After Enhancement Preview"
        subtitle="Techniques are opt-in — nothing is applied unless you choose one"
        icon={SplitSquareVertical}
        actions={
          <>
            <StatusBadge tone={enhancementApplied ? 'warn' : 'muted'} size="sm" dot>
              Enhancement Applied: {enhancementApplied ? 'Yes' : 'No'}
            </StatusBadge>
            <Button
              variant="primary"
              size="xs"
              iconRight={ArrowRight}
              onClick={onContinue}
              disabled={!quality}
            >
              Continue to Detection
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,250px)]">
            <Viewer
              title="Original Image"
              src={previewSrc}
              filter="none"
              badge={<StatusBadge tone="muted" size="sm">Raw input</StatusBadge>}
              active={appliedTechnique === 'original'}
            />
            <Viewer
              title="Enhanced Image"
              src={previewSrc}
              filter={activeTechnique.filter}
              badge={
                <StatusBadge tone={enhancementApplied ? 'ok' : 'muted'} size="sm">
                  {enhancementApplied ? activeTechnique.label : 'No enhancement'}
                </StatusBadge>
              }
              active={appliedTechnique !== 'original'}
            />

            {/* controls */}
            <div className="space-y-2.5">
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase leading-none tracking-[0.08em] text-ink-muted">
                  <SlidersHorizontal className="h-3 w-3" />
                  Techniques
                </p>
                <div className="space-y-1">
                  {ENHANCEMENT_TECHNIQUES.map((t) => {
                    const active = appliedTechnique === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTechnique(t.id);
                          toast(
                            active ? 'Enhancement removed' : `Applied: ${t.label}`,
                            active ? 'info' : 'ok',
                          );
                        }}
                        title={t.description}
                        className={cn(
                          'flex w-full items-center gap-2 rounded border px-2.5 py-1.5 text-left transition-colors',
                          active
                            ? 'border-accent/50 bg-accent-soft text-ink'
                            : 'border-line-soft bg-base-850 text-ink-soft hover:border-line-strong hover:text-ink',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border',
                            active ? 'border-accent bg-accent' : 'border-line-strong',
                          )}
                        >
                          {active && <span className="h-1.5 w-1.5 rounded-[1px] bg-white" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs">{t.label}</span>
                          <span className="block truncate text-[10px] text-ink-faint">{t.description}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-line-soft pt-3">
                <Select
                  label="Enhancement Strategy"
                  value={strategy}
                  onChange={(v) => {
                    setAutoApply(false);
                    setStrategy(v);
                    toast(
                      v === 'auto'
                        ? 'Strategy reset to Auto — analyser decides'
                        : `Strategy locked: ${v}`,
                      v === 'auto' ? 'info' : 'warn',
                    );
                  }}
                  options={ENHANCEMENT_STRATEGIES.map((s) => ({
                    value: s.id,
                    label: s.label,
                    description: s.description,
                  }))}
                />
                <p className="mt-1.5 text-[10px] leading-relaxed text-ink-faint">
                  {ENHANCEMENT_STRATEGIES.find((s) => s.id === strategy)?.description}
                </p>
              </div>

              <div className="border-t border-line-soft pt-3">
                <Toggle
                  label="Auto-apply recommended strategy"
                  hint="Applies the analyser recommendation as soon as a report exists."
                  checked={autoApply}
                  disabled={!quality}
                  onChange={(v) => {
                    setAutoApply(v);
                    if (v) {
                      const rec = quality?.recommendedStrategy ?? 'none';
                      setStrategy(rec);
                      setTechnique(rec);
                      toast(`Applied recommended strategy: ${rec}`, 'ok');
                    } else {
                      setStrategy('none');
                      setTechnique('original');
                      toast('Enhancement disabled — original field kept', 'info');
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* active technique detail */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded border border-line-soft bg-base-850 px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-xs text-ink-soft">
              <Layers className="h-3.5 w-3.5 text-ink-muted" />
              Active technique:
              <span className="font-medium text-ink">{activeTechnique.label}</span>
            </span>
            <span className="text-2xs text-ink-faint">{activeTechnique.description}</span>
            <span className="ml-auto font-mono text-2xs text-ink-faint">
              filter: {activeTechnique.filter}
            </span>
          </div>
        </div>
      </SectionCard>

      {/* ------------------------------------------------------- gate + help */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Detection Gate" subtitle="Confidence threshold applied downstream" icon={Crosshair}>
          <Slider
            label="Confidence Threshold"
            value={state.threshold}
            onChange={setThreshold}
            min={0}
            max={0.95}
            step={0.05}
            format={(v) => v.toFixed(2)}
            hint="Detections below this score are suppressed in the detection table, the summary and the overlays."
            ticks={['0.00', '0.25', '0.50', '0.75', '0.95']}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line-soft pt-3">
            <span className="text-2xs text-ink-faint">
              IoU threshold: <span className="font-mono text-ink-muted">{state.settings.inference.iouThreshold}</span>
            </span>
            <Button variant="subtle" size="xs" iconRight={ArrowRight} onClick={() => navigate('/detection')}>
              Open Cell Detection
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Method Reference" subtitle="No-reference quality measures" icon={Info} dense>
          <dl className="divide-y divide-line-soft">
            {[
              ['Sharpness', 'Variance of the Laplacian — penalises defocus and motion blur.'],
              ['Contrast', 'RMS (Michelson) contrast — penalises washed-out or over-stained fields.'],
              ['Brightness', 'Mean luma deviation from mid-grey — penalises under/over-exposure.'],
              ['Colour quality', 'Stain saturation and channel balance — penalises off-stain batches.'],
              ['Noise index', 'High-frequency energy estimate — drives the denoising branch.'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3 py-2 first:pt-0 last:pb-0">
                <dt className="w-28 shrink-0 text-xs font-medium text-ink-soft">{k}</dt>
                <dd className="text-2xs leading-relaxed text-ink-muted">{v}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- sub-parts --- */

function FlowNode({ node, highlight = false, active = true }) {
  return (
    <div
      className={cn(
        'flex w-[300px] flex-col items-center rounded border px-3 py-2 text-center transition-colors',
        highlight ? 'border-accent/50 bg-accent-soft' : 'border-line-soft bg-base-850',
        active && 'mt-3 first:mt-0',
      )}
    >
      <p className={cn('text-[13px] font-medium', highlight ? 'text-ink' : 'text-ink-soft')}>
        {node.label}
      </p>
      <p className="mt-0.5 text-2xs text-ink-faint">{node.detail}</p>
    </div>
  );
}

function Viewer({ title, src, filter, badge, active }) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className={cn(
            'text-xs font-medium',
            active ? 'text-ink' : 'text-ink-soft',
          )}
        >
          {title}
        </span>
        {badge}
      </div>
      <ImageViewer
        src={src}
        alt={title}
        filter={filter}
        className="aspect-[4/3] w-full"
        showControls={false}
      />
    </div>
  );
}
