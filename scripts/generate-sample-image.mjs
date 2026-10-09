/**
 * Generates the local demo microscopy assets used by the A-QALCD interface.
 *
 * The images are synthesised offline (Wright-Giemsa-like palette) so the project
 * never depends on a remote URL. To swap in your own dataset imagery, simply
 * replace the files in `src/assets/` keeping the same file names, or point
 * `src/data/assets.js` at your own files.
 *
 *   node scripts/generate-sample-image.mjs
 */
import { encode } from 'jpeg-js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '..', 'src', 'assets');
const SAMPLE_DIR = resolve(OUT_DIR, 'samples');

const W = 1280;
const H = 960;

/* ------------------------------------------------------------------ math --- */

const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

function makeNoise(seed) {
  const rnd = mulberry32(seed);
  const size = 256;
  const grid = new Float32Array(size * size);
  for (let i = 0; i < grid.length; i += 1) grid[i] = rnd();
  const at = (a, b) =>
    grid[(((b % size) + size) % size) * size + (((a % size) + size) % size)];
  return (x, y) => {
    x *= size;
    y *= size;
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const top = lerp(at(x0, y0), at(x0 + 1, y0), sx);
    const bot = lerp(at(x0, y0 + 1), at(x0 + 1, y0 + 1), sx);
    return lerp(top, bot, sy);
  };
}

const noiseA = makeNoise(1337);
const noiseB = makeNoise(9001);

const fbm = (x, y) => {
  let v = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < 4; i += 1) {
    v += noiseA(x * f, y * f) * amp;
    f *= 2.07;
    amp *= 0.5;
  }
  return v;
};

const gauss = (rnd) => {
  let u = 0;
  let v = 0;
  while (u === 0) u = rnd();
  while (v === 0) v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

/* --------------------------------------------------------------- palette --- */

const P = {
  bg: [231, 214, 219],
  bgDeep: [214, 190, 199],
  rbc: [211, 122, 118],
  rbcDark: [178, 88, 88],
  rbcPale: [240, 196, 190],
  cyto: [203, 207, 233],
  cytoWarm: [226, 214, 226],
  nucleus: [104, 56, 132],
  nucleusDeep: [70, 32, 96],
  blast: [86, 40, 116],
  blastDeep: [52, 20, 78],
  platelet: [122, 74, 138],
};

/* -------------------------------------------------------------- painting --- */

const buf = new Float32Array(W * H * 3);

function paintBackground() {
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const u = x / W;
      const v = y / H;
      const t = fbm(u * 3.1, v * 3.1) * 0.55 + fbm(u * 9.4, v * 9.4) * 0.2;
      let c = mix(P.bgDeep, P.bg, clamp(0.35 + t * 0.9, 0, 1));
      // uneven illumination / lens shading
      const vig =
        1 -
        0.2 *
          (Math.pow((u - 0.5) * 1.7, 2) + Math.pow((v - 0.5) * 1.7, 2));
      const i = (y * W + x) * 3;
      buf[i] = c[0] * vig;
      buf[i + 1] = c[1] * vig;
      buf[i + 2] = c[2] * vig;
    }
  }
}

/**
 * Paints an anti-aliased rotated ellipse.
 * `shade(xn, yn, d, rim)` returns an RGB triple for the normalised position.
 */
function paintEllipse(cx, cy, rx, ry, rot, shade, opacity = 1, clip = 0) {
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const ext = Math.max(rx, ry) * (1 + clip) + 2;
  const x0 = Math.max(0, Math.floor(cx - ext));
  const x1 = Math.min(W - 1, Math.ceil(cx + ext));
  const y0 = Math.max(0, Math.floor(cy - ext));
  const y1 = Math.min(H - 1, Math.ceil(cy + ext));

  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      const xn = dx * cos + dy * sin;
      const yn = -dx * sin + dy * cos;
      const d = Math.sqrt(xn * xn + yn * yn);
      if (d > 1) continue;
      const cover = smoothstep(1, 0.965, d);
      if (cover <= 0) continue;
      const i = (y * W + x) * 3;
      const c = shade(xn, yn, d, smoothstep(0.86, 1, d));
      const a = cover * opacity;
      buf[i] = lerp(buf[i], c[0], a);
      buf[i + 1] = lerp(buf[i + 1], c[1], a);
      buf[i + 2] = lerp(buf[i + 2], c[2], a);
    }
  }
}

function drawRBC(rnd, cx, cy, r) {
  const hueShift = (rnd() - 0.5) * 0.22;
  const body = [
    clamp(P.rbc[0] + hueShift * 40, 0, 255),
    clamp(P.rbc[1] - hueShift * 18, 0, 255),
    clamp(P.rbc[2] - hueShift * 10, 0, 255),
  ];
  const squash = 0.86 + rnd() * 0.16;
  const ox = (rnd() - 0.5) * r * 0.34;
  const oy = (rnd() - 0.5) * r * 0.34;
  const noiseScale = 9 + rnd() * 6;

  paintEllipse(cx, cy, r, r * squash, (rnd() - 0.5) * 0.8, (xn, yn, d, rim) => {
    // central pallor
    const pcx = xn - ox / r;
    const pcy = yn - oy / r;
    const pd = Math.sqrt(pcx * pcx + pcy * pcy);
    const pallor = smoothstep(0.5, 0.12, pd) * 0.85;
    let c = mix(body, P.rbcPale, pallor);
    // biconcave rim shading
    c = mix(c, P.rbcDark, rim * 0.55);
    c = mix(c, P.rbcPale, smoothstep(0.55, 0.95, d) * 0.18);
    const g = (fbm((cx + xn * r) / 90, (cy + yn * r) / 90) - 0.5) * 14;
    return [c[0] + g, c[1] + g * 0.7, c[2] + g * 0.7];
  });
  void noiseScale;
}

function drawBlast(rnd, cx, cy, r) {
  const rot = rnd() * Math.PI;
  // faint cytoplasm halo
  paintEllipse(
    cx,
    cy,
    r,
    r * 0.95,
    rot,
    (xn, yn, d, rim) => {
      const c = mix(P.cyto, P.cytoWarm, smoothstep(0.2, 0.9, d));
      return mix(c, P.blast, rim * 0.18);
    },
    0.92,
  );
  // high N:C nucleus
  const nr = r * 0.8;
  paintEllipse(cx, cy, nr, nr * 0.95, rot, (xn, yn, d, rim) => {
    let c = mix(P.blast, P.blastDeep, smoothstep(0.1, 0.95, d) * 0.7);
    c = mix(c, P.nucleusDeep, rim * 0.5);
    // chromatin granularity
    const g =
      (fbm((cx + xn * nr) / 7, (cy + yn * nr) / 7) - 0.5) * 34 +
      (noiseB((cx + xn * nr) / 2.4, (cy + yn * nr) / 2.4) - 0.5) * 16;
    return [c[0] + g, c[1] + g * 0.8, c[2] + g];
  });
  // nucleoli
  const n = 1 + Math.floor(rnd() * 2);
  for (let i = 0; i < n; i += 1) {
    const a = rnd() * Math.PI * 2;
    const d = rnd() * nr * 0.42;
    const px = cx + Math.cos(a) * d;
    const py = cy + Math.sin(a) * d;
    paintEllipse(
      px,
      py,
      nr * (0.13 + rnd() * 0.07),
      nr * (0.11 + rnd() * 0.06),
      0,
      (xn, yn, d2) => mix(P.blastDeep, [42, 20, 70], smoothstep(0, 1, d2) * 0.5),
      0.55,
    );
  }
}

function drawLymphocyte(rnd, cx, cy, r) {
  const rot = rnd() * Math.PI;
  paintEllipse(cx, cy, r, r * 0.96, rot, (xn, yn, d, rim) => {
    const c = mix(P.cyto, P.cytoWarm, smoothstep(0.2, 0.95, d));
    return mix(c, P.nucleus, rim * 0.15);
  });
  const nr = r * 0.74;
  paintEllipse(cx, cy, nr, nr * 0.97, rot, (xn, yn, d, rim) => {
    let c = mix(P.nucleus, P.nucleusDeep, smoothstep(0.1, 0.95, d) * 0.72);
    c = mix(c, P.nucleusDeep, rim * 0.45);
    const g = (fbm((cx + xn * nr) / 6, (cy + yn * nr) / 6) - 0.5) * 30;
    return [c[0] + g, c[1] + g * 0.8, c[2] + g];
  });
}

function drawNeutrophil(rnd, cx, cy, r) {
  const rot = rnd() * Math.PI;
  paintEllipse(cx, cy, r, r * 0.94, rot, (xn, yn, d, rim) => {
    const c = mix(P.cyto, P.cytoWarm, smoothstep(0.2, 0.95, d));
    return mix(c, P.nucleus, rim * 0.12);
  });
  const lobes = 3 + Math.floor(rnd() * 2);
  const baseA = rnd() * Math.PI * 2;
  for (let i = 0; i < lobes; i += 1) {
    const a = baseA + (i / lobes) * Math.PI * 2 + (rnd() - 0.5) * 0.4;
    const dist = r * (0.3 + rnd() * 0.12);
    const lr = r * (0.28 + rnd() * 0.09);
    paintEllipse(
      cx + Math.cos(a) * dist,
      cy + Math.sin(a) * dist,
      lr,
      lr * (0.85 + rnd() * 0.2),
      a,
      (xn, yn, d, rim) => {
        let c = mix(P.nucleus, P.nucleusDeep, smoothstep(0.1, 0.95, d) * 0.6);
        c = mix(c, P.nucleusDeep, rim * 0.4);
        const g = (fbm((cx + xn * lr) / 5, (cy + yn * lr) / 5) - 0.5) * 26;
        return [c[0] + g, c[1] + g * 0.8, c[2] + g];
      },
      0.96,
    );
  }
}

function drawPlatelets(rnd, cx, cy, r) {
  const n = 4 + Math.floor(rnd() * 5);
  for (let i = 0; i < n; i += 1) {
    const a = rnd() * Math.PI * 2;
    const d = rnd() * r;
    const pr = r * (0.1 + rnd() * 0.11);
    paintEllipse(
      cx + Math.cos(a) * d,
      cy + Math.sin(a) * d,
      pr * 1.35,
      pr * 0.85,
      rnd() * Math.PI,
      (xn, yn, dd, rim) => mix(P.platelet, [86, 50, 104], smoothstep(0, 1, dd) * 0.5 + rim * 0.4),
      0.8,
    );
  }
}

function drawScene() {
  const rnd = mulberry32(20240517);
  paintBackground();

  // Red blood cell monolayer, back to front for a natural overlap order.
  const cells = [];
  const attempts = 1500;
  for (let i = 0; i < attempts; i += 1) {
    const cx = -40 + rnd() * (W + 80);
    const cy = -40 + rnd() * (H + 80);
    const r = 26 + rnd() * 16;
    cells.push({ cx, cy, r });
  }
  cells.sort((a, b) => a.cy - b.cy);
  cells.forEach(({ cx, cy, r }) => drawRBC(rnd, cx, cy, r));

  // A few overlapping clusters (a common cause of FN errors).
  for (let c = 0; c < 7; c += 1) {
    const cx = 120 + rnd() * (W - 240);
    const cy = 120 + rnd() * (H - 240);
    const n = 3 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i += 1) {
      drawRBC(rnd, cx + (rnd() - 0.5) * 70, cy + (rnd() - 0.5) * 70, 28 + rnd() * 12);
    }
  }

  // Leukocytes
  const leuko = [
    { t: 'blast', x: 0.315, y: 0.335 },
    { t: 'blast', x: 0.675, y: 0.62 },
    { t: 'neut', x: 0.845, y: 0.275 },
    { t: 'lymph', x: 0.145, y: 0.74 },
    { t: 'neut', x: 0.545, y: 0.185 },
    { t: 'lymph', x: 0.46, y: 0.82 },
    { t: 'neut', x: 0.9, y: 0.72 },
    { t: 'blast', x: 0.09, y: 0.3 },
  ];
  leuko.forEach(({ t, x, y }, idx) => {
    const cx = x * W;
    const cy = y * H;
    const r = 50 + rnd() * 14;
    if (t === 'blast') drawBlast(rnd, cx, cy, r);
    else if (t === 'lymph') drawLymphocyte(rnd, cx, cy, r * 0.95);
    else drawNeutrophil(rnd, cx, cy, r);
    if (rnd() > 0.35) drawPlatelets(rnd, cx + (rnd() - 0.5) * 90, cy + (rnd() - 0.5) * 90, 26);
    void idx;
  });
}

/* -------------------------------------------------------- post-processing --- */

function boxBlur(src, radius, passes) {
  let a = Float32Array.from(src);
  let b = new Float32Array(src.length);
  const w = radius * 2 + 1;
  for (let p = 0; p < passes; p += 1) {
    // horizontal
    for (let y = 0; y < H; y += 1) {
      for (let ch = 0; ch < 3; ch += 1) {
        let sum = 0;
        for (let k = -radius; k <= radius; k += 1) {
          sum += a[(y * W + clamp(k, 0, W - 1)) * 3 + ch];
        }
        for (let x = 0; x < W; x += 1) {
          b[(y * W + x) * 3 + ch] = sum / w;
          const add = a[(y * W + clamp(x + radius + 1, 0, W - 1)) * 3 + ch];
          const sub = a[(y * W + clamp(x - radius, 0, W - 1)) * 3 + ch];
          sum += add - sub;
        }
      }
    }
    [a, b] = [b, a];
    // vertical
    for (let x = 0; x < W; x += 1) {
      for (let ch = 0; ch < 3; ch += 1) {
        let sum = 0;
        for (let k = -radius; k <= radius; k += 1) {
          sum += a[(clamp(k, 0, H - 1) * W + x) * 3 + ch];
        }
        for (let y = 0; y < H; y += 1) {
          b[(y * W + x) * 3 + ch] = sum / w;
          const add = a[(clamp(y + radius + 1, 0, H - 1) * W + x) * 3 + ch];
          const sub = a[(clamp(y - radius, 0, H - 1) * W + x) * 3 + ch];
          sum += add - sub;
        }
      }
    }
    [a, b] = [b, a];
  }
  return a;
}

function toRGBA(pixels, opts) {
  const {
    contrast = 1,
    brightness = 1,
    gamma = 1,
    noise = 0,
    vignette = 0.12,
    tint = null,
    tintAmount = 0,
    blurRadius = 0,
  } = opts;

  let src = pixels;
  if (blurRadius > 0) src = boxBlur(src, blurRadius, 2);

  const out = Buffer.alloc(W * H * 4);
  const rnd = mulberry32(777);

  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const i = (y * W + x) * 3;
      const o = (y * W + x) * 4;
      const u = x / W - 0.5;
      const v = y / H - 0.5;
      const vig = 1 - vignette * (u * u + v * v) * 2.4;
      const n = noise ? gauss(rnd) * noise : 0;
      for (let ch = 0; ch < 3; ch += 1) {
        let c = src[i + ch] * brightness;
        c = 128 + (c - 128) * contrast;
        if (tint) c = lerp(c, tint[ch], tintAmount);
        c = clamp(c * vig + n, 0, 255);
        out[o + ch] = clamp(Math.pow(c / 255, gamma) * 255, 0, 255);
      }
      out[o + 3] = 255;
    }
  }
  return out;
}

function write(path, data, quality) {
  const enc = encode({ data, width: W, height: H }, quality);
  writeFileSync(path, enc.data);
  console.log(
    `  ${path.replace(resolve(OUT_DIR, '..'), 'src/assets')}  ${W}x${H}  ${(
      enc.data.length / 1024
    ).toFixed(0)} KB`,
  );
}

/* ------------------------------------------------------------------ main --- */

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(SAMPLE_DIR, { recursive: true });

console.log('Rendering synthetic blood-smear field...');
drawScene();
const scene = Float32Array.from(buf);

console.log('Encoding JPEG assets...');

// 1. Primary sample — well focused, well stained.
write(
  resolve(OUT_DIR, 'blood-smear-sample.jpg'),
  toRGBA(scene, { contrast: 1.1, brightness: 1.0, gamma: 1.0, noise: 2.2 }),
  90,
);

// 2. Degraded — motion blur + low contrast + sensor noise.
write(
  resolve(SAMPLE_DIR, 'blood-smear-low-quality.jpg'),
  toRGBA(scene, { contrast: 0.55, brightness: 0.94, gamma: 1.08, noise: 12, blurRadius: 3 }),
  82,
);

// 3. Over-exposed / washed out.
write(
  resolve(SAMPLE_DIR, 'blood-smear-overexposed.jpg'),
  toRGBA(scene, { contrast: 0.72, brightness: 1.22, gamma: 0.78, noise: 3 }),
  84,
);

// 4. Stain variation (under-stained, greenish cast).
write(
  resolve(SAMPLE_DIR, 'blood-smear-stain-variation.jpg'),
  toRGBA(scene, {
    contrast: 0.86,
    brightness: 1.02,
    gamma: 1.02,
    noise: 4,
    tint: [188, 214, 198],
    tintAmount: 0.28,
  }),
  84,
);

// 5. Low-contrast faint smear (used by the error-analysis gallery).
write(
  resolve(SAMPLE_DIR, 'blood-smear-low-contrast.jpg'),
  toRGBA(scene, { contrast: 0.46, brightness: 1.06, gamma: 1.0, noise: 5, blurRadius: 1 }),
  84,
);

// 6. Crowded field — tight crop for the overlapping-cells error card.
write(
  resolve(SAMPLE_DIR, 'blood-smear-crowded.jpg'),
  toRGBA(scene, { contrast: 0.95, brightness: 0.99, noise: 3, blurRadius: 1 }),
  86,
);

console.log('Done.');
