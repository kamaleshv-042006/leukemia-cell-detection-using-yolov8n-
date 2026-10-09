import { useRef, useState } from 'react';
import { ImageOff, Loader2, Maximize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '../lib/utils.js';
import Button from './Button.jsx';

/**
 * Microscopy image viewer.
 *
 * Features: pan (drag), zoom (wheel / buttons), reset, fullscreen, optional
 * CSS filter used by the enhancement preview, and a graceful fallback if the
 * image fails to load (so replacing the asset never breaks the app).
 */
export default function ImageViewer({
  src,
  alt = 'Blood smear microscopy field',
  filter = 'none',
  overlay = null,
  caption = null,
  badge = null,
  className,
  imgClassName,
  interactive = true,
  showControls = true,
  objectFit = 'contain',
  checkerboard = false,
  emptyHint = 'No image loaded',
}) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const rootRef = useRef(null);

  const clampZoom = (z) => Math.min(6, Math.max(0.4, z));
  const reset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const onWheel = (e) => {
    if (!interactive) return;
    e.preventDefault();
    setZoom((z) => clampZoom(z - e.deltaY * 0.0016));
  };

  const pointerDown = (e) => {
    if (!interactive) return;
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const pointerMove = (e) => {
    if (!dragging || !interactive) return;
    setOffset((o) => ({ x: o.x + e.movementX, y: o.y + e.movementY }));
  };
  const pointerUp = (e) => {
    setDragging(false);
    // `interactive` viewers hold pointer capture; non-interactive ones never
    // captured it, so releasing would throw NotFoundError.
    if (!interactive) return;
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      /* pointer already released */
    }
  };

  const enterFullscreen = () => {
    rootRef.current?.requestFullscreen?.().catch(() => {});
  };

  if (!src || failed) {
    return (
      <div
        className={cn(
          'relative flex min-h-[200px] flex-col items-center justify-center gap-1.5 rounded border border-dashed border-line bg-base-850 text-center',
          className,
        )}
      >
        <ImageOff className="h-5 w-5 text-ink-faint" strokeWidth={1.6} />
        <p className="text-[12px] text-ink-muted">{failed ? 'Image failed to load' : emptyHint}</p>
        {failed && src && (
          <p className="max-w-sm px-3 text-[10.5px] leading-relaxed text-ink-faint">
            Replace the file in <code className="text-ink-muted">src/assets/</code> or update{' '}
            <code className="text-ink-muted">src/data/assets.js</code>.
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        'group relative overflow-hidden rounded border border-line bg-[#07090B]',
        checkerboard && 'aq-checker',
        className,
      )}
    >
      <div
        className={cn('aq-grid-bg absolute inset-0 opacity-70')}
        aria-hidden="true"
      />

      <div
        className={cn(
          'relative flex h-full w-full items-center justify-center overflow-hidden',
          interactive && (dragging ? 'cursor-grabbing' : 'cursor-grab'),
        )}
        onWheel={onWheel}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerLeave={pointerUp}
      >
        {!loaded && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-base-850">
            <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
          </div>
        )}

        <div
          className="relative max-h-full max-w-full transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          }}
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            style={{ filter }}
            className={cn('block select-none', objectFit === 'contain' ? 'max-h-full w-auto' : 'h-full w-full', imgClassName)}
          />
          {overlay}
        </div>
      </div>

      {badge && (
        <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-wrap items-center gap-1">
          {badge}
        </div>
      )}

      {showControls && interactive && (
        <div className="absolute bottom-2 right-2 z-20 flex items-center gap-0.5 rounded-sm border border-line bg-base-900/85 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <Button variant="ghost" size="icon-sm" onClick={() => setZoom((z) => clampZoom(z - 0.25))} aria-label="Zoom out">
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="tnum min-w-[36px] text-center text-[10.5px] leading-none text-ink-soft">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="ghost" size="icon-sm" onClick={() => setZoom((z) => clampZoom(z + 0.25))} aria-label="Zoom in">
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <span className="mx-0.5 h-3.5 w-px bg-line" />
          <Button variant="ghost" size="icon-sm" onClick={reset} aria-label="Reset view">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={enterFullscreen} aria-label="Fullscreen">
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {caption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 border-t border-line-soft bg-gradient-to-t from-black/90 to-transparent px-2.5 py-1.5">
          <p className="text-[10.5px] leading-snug text-ink-soft">{caption}</p>
        </div>
      )}
    </div>
  );
}
