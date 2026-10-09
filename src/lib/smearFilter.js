const NATURAL_HUE_MIN = 70;
const NATURAL_HUE_MAX = 250;
const SATURATION_FLOOR = 0.15;
const MIN_COLORFUL_RATIO = 0.04;
const MIN_STAIN_SHARE = 0.55;
const MIN_PURPLE_SHARE = 0.01;
const MAX_NATURAL_SHARE = 0.25;
const MAX_MEAN_SATURATION = 0.75;

export function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === rn) h = 60 * (((gn - bn) / d) % 6);
  else if (max === gn) h = 60 * ((bn - rn) / d + 2);
  else h = 60 * ((rn - gn) / d + 4);
  if (h < 0) h += 360;
  return [h, s, l];
}

export function scoreSmearPixels(pixels) {
  const total = Math.floor(pixels.length / 4);
  let colorful = 0;
  let stain = 0;
  let purple = 0;
  let natural = 0;
  let sumSaturation = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    const [h, s, l] = rgbToHsl(pixels[i], pixels[i + 1], pixels[i + 2]);
    sumSaturation += s;
    if (l < 0.06 || s < SATURATION_FLOOR) continue;
    colorful += 1;
    if (h >= 260 || h <= 15) {
      stain += 1;
      if (h >= 260 && h < 330) purple += 1;
    } else if (h >= NATURAL_HUE_MIN && h <= NATURAL_HUE_MAX) {
      natural += 1;
    }
  }

  const colorfulRatio = total ? colorful / total : 0;
  const stainShare = colorful ? stain / colorful : 0;
  const purpleShare = colorful ? purple / colorful : 0;
  const naturalShare = colorful ? natural / colorful : 0;
  const meanSaturation = total ? sumSaturation / total : 0;
  const score = Math.round(100 * Math.min(1, stainShare) * (1 - Math.min(1, naturalShare)));

  return { total, colorfulRatio, stainShare, purpleShare, naturalShare, meanSaturation, score };
}

export function verdictFromScore(stats) {
  if (stats.colorfulRatio < MIN_COLORFUL_RATIO) {
    return {
      ok: false,
      score: stats.score,
      reason: 'Image has too little colour information to be a peripheral blood smear.',
    };
  }
  if (stats.naturalShare > MAX_NATURAL_SHARE) {
    return {
      ok: false,
      score: stats.score,
      reason: 'Photo rejected: green/blue scenery content detected, this is not a blood smear.',
    };
  }
  if (stats.meanSaturation > MAX_MEAN_SATURATION) {
    return {
      ok: false,
      score: stats.score,
      reason: 'Photo rejected: colours are too saturated for a stained blood smear.',
    };
  }
  if (stats.purpleShare < MIN_PURPLE_SHARE) {
    return {
      ok: false,
      score: stats.score,
      reason: 'Photo rejected: no purple-stained cell nuclei detected.',
    };
  }
  if (stats.stainShare < MIN_STAIN_SHARE) {
    return {
      ok: false,
      score: stats.score,
      reason: 'Photo rejected: purple/pink stain colouring of a blood smear was not detected.',
    };
  }
  return { ok: true, score: stats.score, reason: '' };
}

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode-failed'));
    };
    img.src = url;
  });
}

export async function analyseSmearFile(file) {
  const img = await loadImageElement(file);
  const maxSide = 160;
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);
  ctx.clearRect(0, 0, width, height);

  return verdictFromScore(scoreSmearPixels(data));
}
