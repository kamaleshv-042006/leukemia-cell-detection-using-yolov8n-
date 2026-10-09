import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Download,
  FileText,
  FlaskConical,
  Image as ImageIcon,
  Info,
  Layers,
  ScanEye,
  Sparkles,
  TriangleAlert,
  Zap,
} from 'lucide-react';

import PageHeader, { MetaItem } from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Button from '../components/Button.jsx';
import Tabs from '../components/Tabs.jsx';
import Modal from '../components/Modal.jsx';
import ImageViewer from '../components/ImageViewer.jsx';
import DetectionOverlay from '../components/DetectionOverlay.jsx';
import GradCamLayer from '../components/GradCamLayer.jsx';
import { useApp } from '../state/AppState.jsx';
import { IMAGES } from '../data/assets.js';
import { SAMPLE_DETECTIONS, GRADCAM_COMPARISON, GRADCAM_SUMMARY, DATA_NOTICE } from '../data/mockData.js';
import { downloadText, timestampSlug } from '../lib/exporters.js';
import { cn } from '../lib/utils.js';

const VIEWS = [
  { id: 'original', label: 'Original', icon: ImageIcon },
  { id: 'detection', label: 'Detection', icon: Layers },
  { id: 'gradcam', label: 'Grad-CAM++', icon: Sparkles },
  { id: 'overlay', label: 'Overlay', icon: ScanEye },
];

const VIEW_HINT = {
  original: 'The unmodified input field as received by the detector.',
  detection: 'Bounding boxes from the YOLOv8n forward pass.',
  gradcam: 'Class-discriminative localisation from the Grad-CAM++ algorithm.',
  overlay: 'The activation map screened over the original field for context.',
};

export default function Explainability() {
  const navigate = useNavigate();
  const { state, runExplanation, setActiveView, toast } = useApp();
  const [reportOpen, setReportOpen] = useState(false);

  const { explanation, explanationLoading, detections, image, quality, threshold, activeView } = state;

  const view = explanation ? explanation.view : activeView;
  const source = image?.url ?? IMAGES.sample;
  const effDetections = detections ?? SAMPLE_DETECTIONS;
  const visible = useMemo(
    () => effDetections.filter((d) => d.confidence >= threshold),
    [effDetections, threshold],
  );
  const top = useMemo(
    () => [...effDetections].sort((a, b) => b.confidence - a.confidence)[0],
    [effDetections],
  );

  const qualityFactor = quality
    ? Math.max(0.55, 1 - (100 - quality.score) / 240)
    : 1;

  const onGenerate = async (target) => {
    const result = await runExplanation(target);
    if (result) {
      setActiveView(target);
      toast(`Grad-CAM++ generated in ${result.durationMs} ms (simulated)`, 'ok');
    }
  };

  const onDownload = () => {
    const text = [
      'A-QALCD — Grad-CAM++ Explanation Report',
      '='.repeat(56),
      `Generated      : ${new Date().toLocaleString()}`,
      `Report file    : aqalcd-gradcam-${timestampSlug()}.txt`,
      `Input image    : ${image?.name ?? 'blood-smear-sample.jpg'}`,
      `Model          : YOLOv8n (yolov8n-aqalcd-best.pt)`,
      `Target layer   : ${GRADCAM_SUMMARY.targetLayer}`,
      '',
      'PREDICTION',
      '-'.repeat(56),
      `Predicted class      : ${GRADCAM_SUMMARY.prediction}`,
      `Confidence           : ${(GRADCAM_SUMMARY.confidence * 100).toFixed(1)}%`,
      `Class index          : ${GRADCAM_SUMMARY.classIndex}`,
      `Confidence threshold : ${threshold.toFixed(2)}`,
      `Input quality        : ${quality ? `${quality.level} (${quality.score.toFixed(1)}/100)` : 'not analysed'}`,
      '',
      'ATTRIBUTION SUMMARY',
      '-'.repeat(56),
      `Positive gradient share : ${(GRADCAM_SUMMARY.positiveGradientShare * 100).toFixed(0)}%`,
      `Primary focus region    : ${GRADCAM_SUMMARY.topRegion}`,
      '',
      'QUALITY-AWARE COMPARISON',
      '-'.repeat(56),
      ...GRADCAM_COMPARISON.map(
        (c) =>
          `  ${c.label.padEnd(14)} score ${String(c.score).padStart(5)}  conf ${(
            c.confidence * 100
          ).toFixed(1)}%  focus: ${c.focus}\n${' '.repeat(22)}${c.note}`,
      ),
      '',
      'DETECTIONS IN FIELD',
      '-'.repeat(56),
      ...visible.map(
        (d) =>
          `  #${d.id}  ${d.classId.padEnd(12)} conf ${d.confidence.toFixed(3)}  box [${(
            d.x * 100
          ).toFixed(1)}%, ${(d.y * 100).toFixed(1)}%, ${(d.w * 100).toFixed(1)}%, ${(d.h * 100).toFixed(1)}%]`,
      ),
      '',
      '='.repeat(56),
      'DISCLAIMER',
      DATA_NOTICE,
      'This Grad-CAM++ map is an AI attribution visualisation produced by a neural',
      'network. It is NOT a clinical interpretation and NOT a medical diagnosis.',
      'It must not be used to guide diagnosis, treatment or patient management.',
    ].join('\n');

    downloadText(text, `aqalcd-gradcam-${timestampSlug()}.txt`);
    toast('Explanation report downloaded', 'ok');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Step 6 · Workflow"
        icon={Sparkles}
        title="AI Explanation — Grad-CAM++"
        subtitle="Class-discriminative localisation for the top detection"
        description="Grad-CAM++ produces a coarse localisation map from the target convolutional layer. This is a model-attribution visualisation, not a clinical finding."
        actions={
          <>
            <StatusBadge tone={explanation ? 'ok' : 'muted'} dot pulse={explanationLoading}>
              {explanation ? `Generated · ${explanation.durationMs} ms` : 'Not generated'}
            </StatusBadge>
            <Button
              variant="primary"
              icon={Zap}
              onClick={() => onGenerate('gradcam')}
              loading={explanationLoading}
            >
              Generate Explanation
            </Button>
            <Button variant="subtle" icon={Download} onClick={onDownload} disabled={!explanation}>
              Download Report
            </Button>
          </>
        }
        meta={
          <>
            <MetaItem icon={FlaskConical} label="Method" value="Grad-CAM++" tone="accent" />
            <MetaItem icon={Layers} label="Target layer" value={GRADCAM_SUMMARY.targetLayer} />
            <MetaItem icon={ImageIcon} label="Input" value={image?.name ?? 'sample field'} />
          </>
        }
      />

      {/* clinical disclaimer strip — deliberately prominent on this page */}
      <div className="flex items-start gap-2.5 rounded-md border border-[rgba(224,163,58,0.3)] bg-warn-soft px-3.5 py-2.5">
        <TriangleAlert className="mt-px h-4 w-4 shrink-0 text-warn" />
        <div className="min-w-0">
          <p className="text-xs font-medium text-warn">AI visualisation — not a clinical diagnosis</p>
          <p className="mt-0.5 text-2xs leading-relaxed text-ink-soft">
            The heatmap shows which image regions contributed most to a neural-network prediction. It is
            generated by Grad-CAM++ from a research prototype model, has not been clinically validated, and
            must not be used to diagnose, stage or treat leukaemia. Consult a qualified haematopathologist
            for any clinical question.
          </p>
        </div>
        <Button
          variant="ghost"
          size="xs"
          icon={FileText}
          onClick={() => setReportOpen(true)}
          className="ml-auto hidden shrink-0 sm:inline-flex"
        >
          Full notice
        </Button>
      </div>

      {/* ------------------------------------------------------- viewer + panel */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,330px)]">
        <SectionCard
          title="Explanation Viewer"
          subtitle={VIEW_HINT[view]}
          icon={ScanEye}
          padded={false}
          actions={
            <Tabs
              items={VIEWS.map((v) => ({ ...v, disabled: !explanation && (v.id === 'gradcam' || v.id === 'overlay') }))}
              value={view}
              onChange={(v) => {
                if (!explanation && (v === 'gradcam' || v === 'overlay')) {
                  toast('Generate an explanation first', 'warn');
                  return;
                }
                setActiveView(v);
              }}
              size="sm"
              ariaLabel="Visualisation mode"
            />
          }
        >
          <div className="relative aspect-[4/3] w-full bg-[#07090B]">
            {view === 'original' && (
              <ImageViewer
                src={source}
                alt="Original field"
                className="h-full w-full rounded-none border-0"
                showControls={false}
                checkerboard={false}
              />
            )}

            {view === 'detection' && (
              <div className="relative h-full w-full">
                <ImageViewer
                  src={source}
                  alt="Detected field"
                  className="h-full w-full rounded-none border-0"
                  showControls={false}
                />
                <DetectionOverlay detections={visible} showBoxes showLabels />
              </div>
            )}

            {(view === 'gradcam' || view === 'overlay') && (
              <div className="relative h-full w-full">
                {view === 'overlay' && (
                  <ImageViewer
                    src={source}
                    alt="Field under activation map"
                    className="absolute inset-0 h-full w-full rounded-none border-0"
                    showControls={false}
                  />
                )}
                <GradCamLayer
                  imageSrc={source}
                  detections={visible.length ? visible : effDetections}
                  mode={view === 'gradcam' ? 'heatmap' : 'overlay'}
                  alpha={0.6}
                  className="absolute inset-0 h-full w-full"
                />
                <DetectionOverlay
                  detections={visible}
                  showBoxes={view === 'overlay'}
                  showLabels={view === 'overlay'}
                  labelPlacement="outside-top"
                />
              </div>
            )}

            {/* legend */}
            {(view === 'gradcam' || view === 'overlay') && (
              <div className="pointer-events-none absolute bottom-3 left-3 z-10 rounded border border-line bg-base-900/85 px-2.5 py-1.5 backdrop-blur-sm">
                <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-ink-faint">
                  Activation
                </p>
                <div
                  className="mt-1 h-1.5 w-32 rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, #30123B, #4145AB, #4675ED, #39A2FC, #1BCFD4, #62FC6B, #D2E935, #FE9B2D, #DB3A07)',
                  }}
                />
                <div className="mt-0.5 flex justify-between text-[9px] text-ink-faint">
                  <span>low</span>
                  <span>high</span>
                </div>
              </div>
            )}

            {!explanation && (view === 'gradcam' || view === 'overlay') && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-base-900/70">
                <Button variant="primary" icon={Zap} onClick={() => onGenerate('gradcam')}>
                  Generate Explanation
                </Button>
              </div>
            )}
          </div>
        </SectionCard>

        {/* right panel */}
        <div className="space-y-4">
          <SectionCard title="Prediction" subtitle="Top-scoring class" icon={Sparkles}>
            <div className="rounded border border-line-soft bg-base-850 px-3 py-3">
              <p className="text-2xs uppercase tracking-[0.07em] text-ink-faint">Prediction</p>
              <p className="mt-1 text-lg font-semibold leading-tight text-ink">{GRADCAM_SUMMARY.prediction}</p>
              <div className="mt-2.5 flex items-baseline justify-between gap-2">
                <span className="text-2xs uppercase tracking-[0.07em] text-ink-faint">Confidence</span>
                <span className="tnum text-xl font-semibold leading-none text-accent">
                  {(GRADCAM_SUMMARY.confidence * qualityFactor).toFixed(1)}%
                </span>
              </div>
              <ProgressBar
                className="mt-2"
                value={GRADCAM_SUMMARY.confidence * qualityFactor}
                size="sm"
                marker={threshold}
              />
              <p className="mt-1.5 text-[10px] text-ink-faint">
                Tick mark = detection threshold {threshold.toFixed(2)}
              </p>
            </div>

            <div className="mt-3 rounded border border-line-soft bg-base-850 px-3 py-2.5">
              <p className="text-2xs uppercase tracking-[0.07em] text-ink-faint">Explanation</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                Highlighted regions indicate areas contributing to the model prediction. Strong red/yellow
                areas carried the most positive weight for the class score.
              </p>
            </div>

            <dl className="mt-3 divide-y divide-line-soft border-t border-line-soft">
              {[
                ['Target layer', GRADCAM_SUMMARY.targetLayer],
                ['Class index', GRADCAM_SUMMARY.classIndex],
                ['Positive gradient share', `${(GRADCAM_SUMMARY.positiveGradientShare * 100).toFixed(0)}%`],
                ['Primary focus', GRADCAM_SUMMARY.topRegion],
                ['BBox source', top ? `#${top.id} · ${top.classId}` : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-3 py-1.5">
                  <dt className="shrink-0 text-2xs text-ink-faint">{k}</dt>
                  <dd className="truncate text-right font-mono text-2xs text-ink-soft">{v}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>

          <SectionCard title="Colormap & Blend" subtitle="Visualisation parameters" icon={Layers} dense>
            <div className="space-y-2">
              {[
                ['Algorithm', 'Grad-CAM++'],
                ['Colormap', 'Turbo'],
                ['Blend mode', 'Screen'],
                ['Alpha', '0.60'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-2">
                  <span className="text-2xs text-ink-faint">{k}</span>
                  <span className="text-2xs font-medium text-ink-soft">{v}</span>
                </div>
              ))}
            </div>
            <Button
              variant="subtle"
              size="xs"
              icon={Download}
              onClick={onDownload}
              disabled={!explanation}
              className="mt-3 w-full justify-center"
            >
              Download Report
            </Button>
          </SectionCard>
        </div>
      </div>

      {/* --------------------------------------- quality-aware explainability */}
      <SectionCard
        title="Quality-Aware Explainability"
        subtitle="How attribution stability changes as input quality degrades"
        icon={FlaskConical}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {GRADCAM_COMPARISON.map((c) => {
            const t = c.id;
            return (
              <article
                key={c.id}
                className={cn(
                  'overflow-hidden rounded-md border bg-base-850 transition-colors',
                  t === 'high'
                    ? 'border-[rgba(47,191,113,0.3)]'
                    : t === 'medium'
                      ? 'border-[rgba(224,163,58,0.3)]'
                      : 'border-[rgba(225,85,90,0.3)]',
                )}
              >
                <div className="relative aspect-[4/3] w-full bg-[#07090B]">
                  <ImageViewer
                    src={IMAGES[c.image]}
                    alt={`${c.label} heatmap preview`}
                    className="h-full w-full rounded-none border-0"
                    showControls={false}
                  />
                  <GradCamLayer
                    imageSrc={IMAGES[c.image]}
                    detections={effDetections}
                    mode="overlay"
                    alpha={t === 'low' ? 0.5 : 0.62}
                    spread={t === 'low' ? 1.5 : t === 'medium' ? 1.25 : 1}
                    seed={t === 'high' ? 7 : t === 'medium' ? 19 : 31}
                    className="pointer-events-none absolute inset-0 h-full w-full"
                  />
                  <div className="pointer-events-none absolute left-2 top-2">
                    <StatusBadge tone={t === 'high' ? 'ok' : t === 'medium' ? 'warn' : 'bad'} size="sm">
                      {c.label}
                    </StatusBadge>
                  </div>
                </div>

                <div className="space-y-2.5 p-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ['Score', c.score.toFixed(1)],
                      ['Confidence', `${(c.confidence * 100).toFixed(1)}%`],
                      ['Sharpness', c.sharpness.toFixed(1)],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p className="text-[10px] uppercase tracking-[0.06em] text-ink-faint">{k}</p>
                        <p className="tnum mt-0.5 text-xs font-medium text-ink">{v}</p>
                      </div>
                    ))}
                  </div>

                  <ProgressBar value={c.confidence} size="xs" tone={t === 'high' ? 'ok' : t === 'medium' ? 'warn' : 'bad'} />

                  <p className="text-2xs text-ink-soft">
                    <span className="text-ink-faint">Focus:</span> {c.focus}
                  </p>
                  <p className="text-2xs leading-relaxed text-ink-muted">{c.note}</p>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-3.5 flex items-start gap-2 border-t border-line-soft pt-3 text-2xs leading-relaxed text-ink-faint">
          <Info className="mt-px h-3 w-3 shrink-0" />
          Attribution becomes progressively more diffuse as image quality falls — the reason the pipeline
          gates on quality before inference and flags low-confidence outputs for review.
        </p>
      </SectionCard>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-base-800 px-3.5 py-3">
        <p className="min-w-0 text-2xs leading-relaxed text-ink-faint">{DATA_NOTICE}</p>
        <Button variant="subtle" size="sm" iconRight={ArrowRight} onClick={() => navigate('/performance')}>
          Performance Analytics
        </Button>
      </div>

      {/* ------------------------------------------------------ full notice modal */}
      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Interpretation notice"
        icon={Info}
        size="md"
        footer={
          <Button variant="subtle" onClick={() => setReportOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-3 text-xs leading-relaxed text-ink-soft">
          <p>
            <span className="font-medium text-ink">What this view shows.</span> Grad-CAM++ is a class
            discriminative localisation technique. It takes the gradients of a target class score with
            respect to the activations of a chosen convolutional layer, weights the positive gradients, and
            upsamples the result to the input resolution. The resulting map approximates the regions of the
            image that contributed most to the score.
          </p>
          <p>
            <span className="font-medium text-ink">What it does not show.</span> It does not show cellular
            morphology, does not measure staining quality, and does not represent a pathologist's judgement.
            Coarse spatial resolution and a strong dependence on the chosen layer mean the map must be read
            as a debugging and interpretability aid only.
          </p>
          <p>
            <span className="font-medium text-ink">Status of the underlying model.</span> This prototype
            reports simulated outputs from an unvalidated research model. No clinical accuracy,
            sensitivity or specificity claim is made or implied.
          </p>
          <p className="rounded border border-[rgba(224,163,58,0.3)] bg-warn-soft px-3 py-2 text-warn">
            Research prototype only. Not a medical diagnostic device. Not for clinical use.
          </p>
        </div>
      </Modal>
    </div>
  );
}
