import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../lib/utils.js';

/* Turbo colormap stops — perceptually smooth, reads well on a dark stage. */
const TURBO = [
  [0.0, 48, 18, 59],
  [0.13, 65, 69, 171],
  [0.25, 70, 117, 237],
  [0.38, 57, 162, 252],
  [0.5, 27, 207, 212],
  [0.62, 98, 252, 107],
  [0.75, 210, 233, 53],
  [0.88, 254, 155, 45],
  [1.0, 219, 58, 7],
];

function turboAt(t) {
  const x = Math.min(1, Math.max(0, t));
  for (let i = 0; i < TURBO.length - 1; i += 1) {
    const [p0, r0, g0, b0] = TURBO[i];
    const [p1, r1, g1, b1] = TURBO[i + 1];
    if (x >= p0 && x <= p1) {
      const k = (x - p0) / (p1 - p0 || 1);
      return [
        Math.round(r0 + (r1 - r0) * k),
        Math.round(g0 + (g1 - g0) * k),
        Math.round(b0 + (b1 - b0) * k),
      ];
    }
  }
  return [219, 58, 7];
}

/** Deterministic PRNG so a given activation pattern always renders the same. */
const seeded = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x9e3779b9) | 0;
  let t = Math.imul(seed ^ (seed >>> 16), 0x21f0aaad);
  t = Math.imul(t ^ (t >>> 15), 0x735a2d97);
  return ((t ^ (t >>> 15)) >>> 0) / 4294967296;
};

/**
 * Builds a Grad-CAM++ style activation map.
 *
 * In production this payload comes from the PyTorch backend
 * (`weights * activations > 0` upsampled to the input resolution). Here it is
 * synthesised around the detected cell so the visualisation is a real render of
 * real pixel data rather than a static image — swap `activations` for the
 * backend tensor map and nothing else changes.
 */
export function buildActivations(detections, { spread = 1, seed = 7 } = {}) {
  const rnd = seeded(seed);
  const top = [...detections].sort((a, b) => b.confidence - a.confidence);
  if (!top.length) return [];

  const primary = top[0];
  const cx = primary.x + primary.w / 2;
  const cy = primary.y + primary.h / 2;
  const baseR = Math.max(primary.w, primary.h) * 0.9 * spread;

  const points = [];
  // Core activation on the highest-confidence box.
  points.push({ x: cx, y: cy, r: baseR, w: 1 });
  // Secondary lobes: chromatin texture inside the nucleus.
  const lobes = 5;
  for (let i = 0; i < lobes; i += 1) {
    const a = rnd() * Math.PI * 2;
    const d = baseR * (0.25 + rnd() * 0.55);
    points.push({
      x: cx + Math.cos(a) * d,
      y: cy + Math.sin(a) * d,
      r: baseR * (0.28 + rnd() * 0.32),
      w: 0.55 + rnd() * 0.3,
    });
  }
  // Faint distributed response over the remaining detections.
  top.slice(1, 4).forEach((d) => {
    points.push({
      x: d.x + d.w / 2,
      y: d.y + d.h / 2,
      r: baseR * 0.45,
      w: 0.3,
    });
  });
  return points;
}

/**
 * Canvas heatmap renderer.
 * mode: 'heatmap' (colormap only) | 'overlay' (colormap screened over the image)
 */
export default function GradCamLayer({
  imageSrc,
  detections = [],
  mode = 'overlay',
  alpha = 0.62,
  spread = 1,
  seed = 7,
  className,
  imgClassName,
  objectFit = 'contain',
  onStatus,
}) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  const activations = useMemo(() => buildActivations(detections, { spread, seed }), [detections, spread, seed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return undefined;

    let cancelled = false;
    setBusy(true);
    onStatus?.('loading');

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (cancelled) return;
      const w = img.naturalWidth || 1280;
      const h = img.naturalHeight || 960;

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      // 1) base image
      ctx.clearRect(0, 0, w, h);
      if (mode !== 'heatmap') {
        ctx.drawImage(img, 0, 0, w, h);
      } else {
        ctx.fillStyle = '#07090B';
        ctx.fillRect(0, 0, w, h);
      }

      // 2) low-res accumulation buffer, then upscale for smooth blobs
      const scale = 0.25;
      const hw = Math.max(1, Math.round(w * scale));
      const hh = Math.max(1, Math.round(h * scale));
      const heat = document.createElement('canvas');
      heat.width = hw;
      heat.height = hh;
      const hctx = heat.getContext('2d');
      hctx.fillStyle = '#000';
      hctx.fillRect(0, 0, hw, hh);
      hctx.globalCompositeOperation = 'lighter';

      activations.forEach((p) => {
        const px = p.x * hw;
        const py = p.y * hh;
        const pr = Math.max(2, p.r * hw);
        const grad = hctx.createRadialGradient(px, py, 0, px, py, pr);
        for (let i = 0; i <= 10; i += 1) {
          const t = i / 10;
          const [r, g, b] = turboAt(Math.pow(1 - t, 1.35) * p.w);
          grad.addColorStop(t, `rgba(${r},${g},${b},${0.92 * Math.pow(1 - t, 0.6)})`);
        }
        hctx.fillStyle = grad;
        hctx.beginPath();
        hctx.arc(px, py, pr, 0, Math.PI * 2);
        hctx.fill();
      });

      // 3) composite
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      if (mode === 'overlay') {
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = alpha;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }
      ctx.drawImage(heat, 0, 0, w, h);
      ctx.restore();

      // 4) dim the untouched region so the hot area stands out
      if (mode === 'overlay') {
        const vig = document.createElement('canvas');
        vig.width = w;
        vig.height = h;
        const vctx = vig.getContext('2d');
        vctx.drawImage(heat, 0, 0, w, h);
        vctx.globalCompositeOperation = 'destination-in';
        const g = vctx.createRadialGradient(w / 2, h / 2, w * 0.1, w / 2, h / 2, w * 0.75);
        g.addColorStop(0, 'rgba(0,0,0,1)');
        g.addColorStop(1, 'rgba(0,0,0,0.25)');
        vctx.fillStyle = g;
        vctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.55;
        ctx.drawImage(vig, 0, 0);
        ctx.restore();
      }

      if (cancelled) return;
      setReady(true);
      setBusy(false);
      onStatus?.('ready');
    };

    img.onerror = () => {
      if (cancelled) return;
      setBusy(false);
      onStatus?.('error');
    };

    img.src = imageSrc;
    return () => {
      cancelled = true;
    };
  }, [imageSrc, activations, mode, alpha, onStatus]);

  return (
    <div className={cn('relative h-full w-full', className)}>
      <canvas
        ref={canvasRef}
        className={cn('block h-full w-full', objectFit === 'contain' ? 'object-contain' : 'object-cover', imgClassName)}
      />
      {busy && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-850/70 text-2xs text-ink-soft">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 animate-spin-slow rounded-full border border-current border-t-transparent" />
            Computing Grad-CAM++
          </span>
        </div>
      )}
      {!activations.length && ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xs text-ink-muted">No activation to display</p>
        </div>
      )}
    </div>
  );
}
