import { useEffect, useRef } from 'react';

const CELL_COUNT = 15;
const PALETTE = [
  [45, 127, 249],
  [43, 182, 196],
  [139, 123, 232],
];

function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeCells() {
  const rand = makeRng(20260208);
  const spherePoint = (rMin, rMax) => {
    let x, y, l;
    do {
      x = rand() * 2 - 1;
      y = rand() * 2 - 1;
      l = x * x + y * y;
    } while (l > 1);
    const z = rand() * 2 - 1;
    const len = Math.sqrt(x * x + y * y + z * z) || 1;
    const r = rMin + rand() * (rMax - rMin);
    return { x: (x / len) * r, y: (y / len) * r, z: (z / len) * r };
  };

  const cells = Array.from({ length: CELL_COUNT }, () => {
    const z = rand();
    return {
      nx: rand(),
      ny: rand(),
      z,
      rF: 0.035 + z * 0.085 + rand() * 0.025,
      color: PALETTE[Math.floor(rand() * PALETTE.length)],
      ry: rand() * Math.PI * 2,
      rx: (rand() - 0.5) * 1.4,
      vy: (0.12 + rand() * 0.3) * (rand() < 0.5 ? -1 : 1),
      vx: (0.06 + rand() * 0.14) * (rand() < 0.5 ? -1 : 1),
      phase: rand() * Math.PI * 2,
      nucleus: spherePoint(0.26, 0.4),
      organelles: Array.from({ length: 5 }, () => spherePoint(0.5, 0.85)),
    };
  });
  cells.sort((a, b) => a.z - b.z);
  return cells;
}

function drawCell(ctx, cell, cx, cy, R) {
  const [r, g, b] = cell.color;
  const a = 0.3 + cell.z * 0.45;
  const lx = cx - R * 0.36;
  const ly = cy - R * 0.4;

  ctx.save();
  ctx.globalAlpha = a;

  const body = ctx.createRadialGradient(lx, ly, R * 0.05, cx, cy, R * 1.05);
  body.addColorStop(0, `rgba(${Math.min(255, r + 120)},${Math.min(255, g + 120)},${Math.min(255, b + 120)},0.85)`);
  body.addColorStop(0.35, `rgba(${r},${g},${b},0.55)`);
  body.addColorStop(0.75, `rgba(${r},${g},${b},0.26)`);
  body.addColorStop(1, 'rgba(8,12,16,0.05)');

  ctx.shadowColor = `rgba(${r},${g},${b},0.55)`;
  ctx.shadowBlur = R * 0.9;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.lineWidth = Math.max(1, R * 0.03);
  ctx.strokeStyle = `rgba(${Math.min(255, r + 60)},${Math.min(255, g + 60)},${Math.min(255, b + 60)},0.5)`;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.9, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(1, R * 0.02);
  ctx.strokeStyle = 'rgba(43,182,196,0.18)';
  ctx.stroke();

  const cosX = Math.cos(cell.rx);
  const sinX = Math.sin(cell.rx);
  const cosY = Math.cos(cell.ry);
  const sinY = Math.sin(cell.ry);
  const project = (p) => {
    const y1 = p.y * cosX - p.z * sinX;
    const z1 = p.y * sinX + p.z * cosX;
    return {
      x: p.x * cosY + z1 * sinY,
      y: y1,
      z: -p.x * sinY + z1 * cosY,
    };
  };

  for (const o of cell.organelles) {
    const p = project(o);
    if (p.z < -0.25) continue;
    const fade = Math.min(1, (p.z + 0.35) * 1.6);
    const ox = cx + p.x * R;
    const oy = cy + p.y * R;
    const or = R * 0.07;
    const og = ctx.createRadialGradient(ox, oy, 0, ox, oy, or);
    og.addColorStop(0, `rgba(43,182,196,${0.9 * fade})`);
    og.addColorStop(1, 'rgba(43,182,196,0)');
    ctx.fillStyle = og;
    ctx.beginPath();
    ctx.arc(ox, oy, or, 0, Math.PI * 2);
    ctx.fill();
  }

  const n = project(cell.nucleus);
  const nx = cx + n.x * R;
  const ny = cy + n.y * R;
  const nr = R * 0.34;
  const nf = Math.min(1, Math.max(0.3, (n.z + 1) * 0.7));
  const ng = ctx.createRadialGradient(nx - nr * 0.3, ny - nr * 0.35, nr * 0.1, nx, ny, nr);
  ng.addColorStop(0, `rgba(170,160,255,${0.95 * nf})`);
  ng.addColorStop(0.55, `rgba(90,110,235,${0.85 * nf})`);
  ng.addColorStop(1, `rgba(20,24,52,${0.8 * nf})`);
  ctx.fillStyle = ng;
  ctx.beginPath();
  ctx.arc(nx, ny, nr, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(1, R * 0.02);
  ctx.strokeStyle = `rgba(139,123,232,${0.5 * nf})`;
  ctx.stroke();

  const spec = ctx.createRadialGradient(lx, ly, 0, lx, ly, R * 0.5);
  spec.addColorStop(0, 'rgba(255,255,255,0.5)');
  spec.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = spec;
  ctx.beginPath();
  ctx.arc(lx, ly, R * 0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export default function CellBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cells = makeCells();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let t = 0;
    let last = performance.now();

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      const base = Math.min(w, h) || 1;
      for (const c of cells) {
        const cx = c.nx * w + Math.sin(t * 0.13 + c.phase) * (10 + c.z * 30);
        const cy = c.ny * h + Math.cos(t * 0.11 + c.phase * 1.6) * (8 + c.z * 26);
        drawCell(ctx, c, cx, cy, c.rF * base);
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) render();
    };

    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;
      for (const c of cells) {
        c.ry += c.vy * dt;
        c.rx += c.vx * dt;
      }
      render();
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);
    if (!reduced) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="cell-wash absolute inset-0" />
      <canvas ref={canvasRef} className="cell-canvas absolute inset-0 h-full w-full" />
    </div>
  );
}
