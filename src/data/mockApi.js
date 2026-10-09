import { SAMPLE_DETECTIONS, QUALITY_PROFILES } from './mockData.js';

/* ==========================================================================
 *  MOCK API
 * --------------------------------------------------------------------------
 *  Every asynchronous call the UI makes goes through this module. The
 *  signatures are deliberately shaped like REST endpoints so the Python /
 *  YOLOv8 service can be dropped in by re-implementing these three functions
 *  with `fetch` — no component changes required.
 *
 *    analyzeQuality({ file, strategy })  ->  POST /api/quality
 *    runDetection({ threshold, iou })     ->  POST /api/detect
 *    generateExplanation({ target })     ->  POST /api/gradcam
 * ========================================================================== */

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const rnd = (min, max) => min + Math.random() * (max - min);

/* -------------------------------------------------------------- /api/quality */

const bandFor = (score) => (score >= 75 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW');

/**
 * Derives a plausible quality report for an arbitrary input.
 * When the user uploads a file we derive values from its real byte length and
 * name so repeated analyses of the same image are stable-ish but not static.
 */
export function synthesizeQualityReport({ fileName = '', fileSize = 0, bias = 0 } = {}) {
  const sizeFactor = fileSize > 0 ? Math.min(1, fileSize / 900_000) : 0.5;
  const seed = (fileName.length * 7 + fileSize) % 1000;
  const jitter = (i, amp) => (Math.sin(seed * (i + 1)) * amp) / 2 + rnd(-amp / 2, amp / 2);

  const sharpness = clampNum(64 + sizeFactor * 26 + jitter(0, 12) + bias, 12, 99);
  const contrast = clampNum(58 + sizeFactor * 24 + jitter(1, 14) + bias, 10, 99);
  const brightness = clampNum(70 + sizeFactor * 20 + jitter(2, 10) + bias * 0.5, 15, 99);
  const colorQuality = clampNum(62 + sizeFactor * 28 + jitter(3, 13) + bias, 10, 99);
  const noiseIndex = clampNum(28 - sizeFactor * 14 + jitter(4, 8) - bias, 2, 82);

  const score = clampNum(
    sharpness * 0.28 + contrast * 0.24 + brightness * 0.16 + colorQuality * 0.24 + (100 - noiseIndex) * 0.08,
    8,
    99.4,
  );

  const level = bandFor(score);
  const profile = QUALITY_PROFILES[level.toLowerCase()];
  const noise = noiseIndex < 25 ? 'Low' : noiseIndex < 55 ? 'Moderate' : 'High';

  return {
    id: `QAR-${Date.now().toString(36).toUpperCase()}`,
    fileName: fileName || 'blood-smear-sample.jpg',
    fileSize,
    score: +score.toFixed(1),
    level,
    noise,
    noiseIndex: +noiseIndex.toFixed(1),
    metrics: {
      sharpness: +sharpness.toFixed(1),
      contrast: +contrast.toFixed(1),
      brightness: +brightness.toFixed(1),
      colorQuality: +colorQuality.toFixed(1),
      noiseIndex: +noiseIndex.toFixed(1),
    },
    decision: profile.decision,
    rationale: profile.rationale,
    recommendedStrategy: profile.strategy,
    analysedAt: new Date().toISOString(),
  };
}

const clampNum = (v, a, b) => Math.min(Math.max(v, a), b);

export async function analyzeQuality({ fileName, fileSize, strategy = 'auto' } = {}) {
  await delay(900 + Math.random() * 700);
  const report = synthesizeQualityReport({ fileName, fileSize });
  if (strategy && strategy !== 'auto' && strategy !== 'None') {
    report.appliedStrategy = strategy;
    report.rationale = `Strategy locked to "${strategy}" by operator.`;
  } else {
    report.appliedStrategy = report.recommendedStrategy;
  }
  return report;
}

/* -------------------------------------------------------------- /api/detect */

/**
 * Produces predictions for the sample field. Passing a custom image keeps the
 * same boxes (they are anchored to the bundled sample) — a real backend would
 * return geometry derived from the actual upload.
 */
export async function runDetection({ confidenceThreshold = 0.5, iouThreshold = 0.45, count = SAMPLE_DETECTIONS.length } = {}) {
  await delay(1100 + Math.random() * 900);

  const base = SAMPLE_DETECTIONS.slice(0, count).map((d) => ({
    ...d,
    // tiny deterministic wobble so repeated runs feel alive
    confidence: clampNum(d.confidence + (Math.random() - 0.5) * 0.02, 0.05, 0.999),
  }));

  return {
    model: 'YOLOv8n',
    weights: 'yolov8n-aqalcd-best.pt',
    confidenceThreshold,
    iouThreshold,
    imageSize: 640,
    inferenceMs: +(11.6 + Math.random() * 2.4).toFixed(2),
    fps: +(78 + Math.random() * 6).toFixed(1),
    device: 'CUDA:0 (simulated)',
    detections: base.map((d) => ({ ...d, confidence: +d.confidence.toFixed(3) })),
    timestamp: new Date().toISOString(),
  };
}

/* -------------------------------------------------------------- /api/gradcam */

export async function generateExplanation({ target = 'blast' } = {}) {
  await delay(1200 + Math.random() * 900);
  return {
    target,
    method: 'Grad-CAM++',
    targetLayer: 'models.22.cv2.conv (layer-9)',
    generatedAt: new Date().toISOString(),
    durationMs: +(310 + Math.random() * 220).toFixed(0),
  };
}

/* ---------------------------------------------------------- /api/system info */

export async function fetchSystemStatus() {
  await delay(180);
  return {
    modelLoaded: true,
    datasetAvailable: true,
    gradcam: true,
    qualityAnalyzer: true,
    backendConnected: false,
  };
}
