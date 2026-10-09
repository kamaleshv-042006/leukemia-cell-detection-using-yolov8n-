import { useCallback, useRef, useState } from 'react';
import { FileImage, FileUp, RefreshCcw, Trash2, Wand2 } from 'lucide-react';
import { useApp } from '../state/AppState.jsx';
import { cn } from '../lib/utils.js';
import Button from './Button.jsx';
import StatusBadge from './StatusBadge.jsx';

export const formatBytes = (b) => {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Drag-and-drop upload area with a bundled-sample fallback so the prototype is
 * always usable even when the user has no file to hand.
 */
export default function UploadZone({ onAnalyzed, compact = false }) {
  const { state, loadSampleImage, clearImage, uploadImage, runQualityAnalysis, toast } = useApp();
  const [dragging, setDragging] = useState(false);
  const [checking, setChecking] = useState(false);
  const inputRef = useRef(null);

  const accept = useCallback(
    async (files) => {
      const file = files?.[0];
      if (!file || checking) return;
      setChecking(true);
      try {
        const accepted = await uploadImage(file);
        if (accepted) {
          toast(`Smear image accepted: ${file.name}`, 'ok');
        } else {
          toast('Rejected: this photo is not a peripheral blood smear.', 'bad');
        }
      } finally {
        setChecking(false);
      }
    },
    [uploadImage, toast, checking],
  );

  const image = state.image;

  const onAnalyze = async () => {
    const report = await runQualityAnalysis();
    if (report) {
      toast(
        `Analysis complete — quality score ${report.score.toFixed(1)} (${report.level})`,
        report.level === 'HIGH' ? 'ok' : report.level === 'MEDIUM' ? 'warn' : 'bad',
      );
      onAnalyzed?.(report);
    }
  };

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        accept(e.target.files);
        e.target.value = '';
      }}
    />
  );

  if (!image) {
    return (
      <div className="space-y-3">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            accept(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Upload peripheral blood smear image"
          className={cn(
            'group flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed text-center transition-colors',
            compact ? 'px-5 py-8' : 'px-6 py-12',
            dragging
              ? 'border-accent bg-accent-soft'
              : 'border-line bg-base-850 hover:border-line-strong hover:bg-base-800',
          )}
        >
          <span
            className={cn(
              'mb-3 flex h-11 w-11 items-center justify-center rounded-md border transition-colors',
              dragging
                ? 'border-accent/50 bg-accent-soft text-accent'
                : 'border-line bg-base-800 text-ink-muted group-hover:text-accent',
            )}
          >
            <FileUp className={cn('h-5 w-5', dragging && 'animate-bounce')} strokeWidth={1.6} />
          </span>
          <p className="text-sm font-medium text-ink">
            {checking
              ? 'Checking image content…'
              : dragging
                ? 'Release to upload'
                : 'Upload Peripheral Blood Smear Image'}
          </p>
          <p className="mt-1.5 max-w-md text-xs leading-relaxed text-ink-muted">
            Drag and drop a microscope field here, or click to browse. Photos that are not blood
            smears are rejected automatically · JPG, PNG · maximum 40 MB.
          </p>
          <p className="mt-3 text-2xs text-ink-faint">
            Step 1 of 6 · Upload → Quality → Adaptive Enhancement → YOLOv8n → Confidence Validation →
            Grad-CAM++
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button variant="subtle" size="sm" icon={FileImage} onClick={loadSampleImage}>
            Load bundled sample field
          </Button>
          <span className="text-2xs text-ink-faint">
            A synthetic microscopy field ships with the prototype for demonstration.
          </span>
        </div>

        {fileInput}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-line bg-base-850">
      <div className="flex flex-wrap items-center gap-3 border-b border-line-soft px-3.5 py-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-line bg-base-800 text-ink-muted">
          <FileImage className="h-3.5 w-3.5" strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-ink">{image.name}</p>
          <p className="tnum truncate font-mono text-2xs text-ink-muted">
            {formatBytes(image.size)} · {image.dimensions} ·{' '}
            {image.source === 'sample' ? 'bundled sample' : 'user upload'}
            {typeof image.smearScore === 'number' ? ` · smear match ${image.smearScore}%` : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <StatusBadge tone={state.quality ? 'ok' : 'muted'} size="sm" dot>
            {state.quality ? `Analysed · ${state.quality.level}` : 'Not analysed'}
          </StatusBadge>
          <Button
            variant="ghost"
            size="icon-sm"
            icon={Trash2}
            onClick={clearImage}
            aria-label="Remove image"
            title="Remove image"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-3.5 py-3">
        <Button variant="primary" icon={Wand2} onClick={onAnalyze} loading={state.qualityLoading}>
          {state.quality ? 'Re-analyze' : 'Analyze'}
        </Button>
        <Button variant="subtle" icon={RefreshCcw} onClick={() => inputRef.current?.click()}>
          Replace
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            clearImage();
            setTimeout(loadSampleImage, 0);
            toast('Bundled sample image restored', 'info');
          }}
        >
          Use sample image
        </Button>
        {fileInput}
      </div>
    </div>
  );
}
