/* ==========================================================================
 *  MOCK DATA
 * --------------------------------------------------------------------------
 *  Every figure below is SYNTHETIC placeholder data for interface
 *  demonstration. Nothing here represents measured clinical performance.
 *  Replace the exported objects with API calls (see src/data/mockApi.js) when
 *  the Python / YOLOv8 service is connected.
 * ========================================================================== */

/* ---------------------------------------------------------- deterministic RNG */
const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/* ============================================================== application === */

export const APP = {
  shortName: 'cell health',
  fullName:
    'Adaptive Quality-Aware and Explainable Leukemia Cell Detection and Classification System',
  version: '1.0.0-prototype',
  build: '2026.02-r1',
  institution: 'Research Laboratory · Clinical AI Research Group',
  apiEndpoint: 'http://localhost:8000',
  apiConnected: false,
};

export const DISCLAIMER =
  'Research prototype only. This system is intended for research and educational ' +
  'purposes and is not a medical diagnostic device.';

export const DATA_NOTICE =
  'All metrics, detections and logs shown in this prototype are simulated demo data.';

/* ==================================================================== models === */

export const MODELS = [
  { id: 'yolov8n', label: 'YOLOv8n', params: 3.2, size: '6.5 MB', edge: true },
  { id: 'yolov8s', label: 'YOLOv8s', params: 11.2, size: '21.5 MB' },
  { id: 'resnet50', label: 'ResNet50', params: 25.6, size: '97.8 MB' },
  { id: 'densenet121', label: 'DenseNet121', params: 7.0, size: '30.1 MB' },
  { id: 'efficientnet', label: 'EfficientNet-B0', params: 5.3, size: '20.4 MB' },
];

export const modelLabel = (id) => MODELS.find((m) => m.id === id)?.label ?? id;

export const DATASETS = [
  {
    id: 'ALL',
    label: 'ALL Dataset',
    short: 'ALL',
    images: 14289,
    description: 'Acute Lymphoblastic Leukemia · Kaggle',
    classes: 3,
    license: 'Public research dataset',
  },
  {
    id: 'C-NMC',
    label: 'C-NMC Dataset',
    short: 'C-NMC',
    images: 4576,
    description: 'Chronic Myelogenous Leukemia · Kaggle',
    classes: 2,
    license: 'Public research dataset',
  },
];

export const DATASET_FILTERS = ['ALL', 'C-NMC', 'Both'];
export const QUALITY_FILTERS = ['High', 'Medium', 'Low'];
export const QUALITY_LEVELS = ['HIGH', 'MEDIUM', 'LOW'];

/* ================================================================ dashboard === */

export const DASHBOARD_METRICS = [
  {
    id: 'images',
    label: 'Total Images',
    value: '14,289',
    raw: 14289,
    sub: 'Labelled smear fields',
    icon: 'Images',
    tone: 'accent',
    trend: { dir: 'up', value: '+3.2%', label: 'vs last cycle' },
  },
  {
    id: 'accuracy',
    label: 'Model Accuracy',
    value: '94.2%',
    raw: 0.942,
    sub: 'Validation split',
    icon: 'Target',
    tone: 'ok',
    trend: { dir: 'up', value: '+1.8%', label: 'vs baseline' },
  },
  {
    id: 'cells',
    label: 'Detected Cells',
    value: '1,248',
    raw: 1248,
    sub: 'Across current session',
    icon: 'Microscope',
    tone: 'alt',
    trend: { dir: 'up', value: '+142', label: 'this session' },
  },
  {
    id: 'model',
    label: 'Current Model',
    value: 'YOLOv8n',
    raw: 'YOLOv8n',
    sub: '3.2M parameters',
    icon: 'Cpu',
    tone: 'info',
    trend: null,
  },
  {
    id: 'dataset',
    label: 'Dataset',
    value: 'ALL + C-NMC',
    raw: 'ALL + C-NMC',
    sub: '18,865 total images',
    icon: 'Database',
    tone: 'accent',
    trend: null,
  },
  {
    id: 'status',
    label: 'Model Status',
    value: 'Ready',
    raw: 'Ready',
    sub: 'Idle · awaiting input',
    icon: 'CircleCheck',
    tone: 'ok',
    trend: null,
  },
];

export const DATASET_DISTRIBUTION = [
  { name: 'ALL Dataset', short: 'ALL', value: 14289, images: 14289, color: '#2D7FF9' },
  { name: 'C-NMC Dataset', short: 'C-NMC', value: 4576, images: 4576, color: '#2BB6C4' },
];

export const MODEL_PERFORMANCE = [
  { metric: 'Precision', value: 0.943, target: 0.94, color: '#2D7FF9' },
  { metric: 'Recall', value: 0.921, target: 0.9, color: '#2BB6C4' },
  { metric: 'F1-score', value: 0.932, target: 0.92, color: '#8B7BE8' },
  { metric: 'mAP@0.5', value: 0.918, target: 0.9, color: '#4C9A6E' },
  { metric: 'mAP@0.5:0.95', value: 0.746, target: 0.72, color: '#E0A33A' },
];

export const RECENT_EVALUATIONS = [
  {
    id: 'EVAL-0912',
    dataset: 'ALL',
    model: 'YOLOv8n',
    quality: 'High',
    map50: 0.918,
    f1: 0.932,
    status: 'Completed',
    date: '2026-02-11 14:32',
    images: 1429,
    duration: '4m 12s',
  },
  {
    id: 'EVAL-0911',
    dataset: 'C-NMC',
    model: 'YOLOv8n',
    quality: 'Medium',
    map50: 0.884,
    f1: 0.897,
    status: 'Completed',
    date: '2026-02-11 09:05',
    images: 916,
    duration: '2m 58s',
  },
  {
    id: 'EVAL-0910',
    dataset: 'ALL',
    model: 'YOLOv8n',
    quality: 'Low',
    map50: 0.742,
    f1: 0.768,
    status: 'Review',
    date: '2026-02-10 17:48',
    images: 612,
    duration: '2m 21s',
  },
  {
    id: 'EVAL-0909',
    dataset: 'C-NMC',
    model: 'YOLOv8s',
    quality: 'High',
    map50: 0.902,
    f1: 0.914,
    status: 'Completed',
    date: '2026-02-10 11:16',
    images: 916,
    duration: '6m 44s',
  },
  {
    id: 'EVAL-0908',
    dataset: 'ALL',
    model: 'ResNet50',
    quality: 'Medium',
    map50: 0.831,
    f1: 0.845,
    status: 'Completed',
    date: '2026-02-09 16:40',
    images: 1429,
    duration: '18m 09s',
  },
  {
    id: 'EVAL-0907',
    dataset: 'C-NMC',
    model: 'DenseNet121',
    quality: 'Low',
    map50: 0.764,
    f1: 0.781,
    status: 'Failed',
    date: '2026-02-09 08:22',
    images: 458,
    duration: '9m 33s',
  },
  {
    id: 'EVAL-0906',
    dataset: 'ALL',
    model: 'EfficientNet',
    quality: 'High',
    map50: 0.869,
    f1: 0.883,
    status: 'Completed',
    date: '2026-02-08 15:57',
    images: 1429,
    duration: '12m 04s',
  },
  {
    id: 'EVAL-0905',
    dataset: 'C-NMC',
    model: 'YOLOv8n',
    quality: 'Medium',
    map50: 0.879,
    f1: 0.891,
    status: 'Completed',
    date: '2026-02-08 10:14',
    images: 916,
    duration: '3m 02s',
  },
];

export const SYSTEM_STATUS = [
  { id: 'model', label: 'Model loaded', value: 'YOLOv8n', status: 'ok', detail: 'Loaded in 1.24 s' },
  { id: 'dataset', label: 'Dataset available', value: '18,865 images', status: 'ok', detail: 'ALL + C-NMC' },
  {
    id: 'gpu',
    label: 'GPU status',
    value: 'CUDA available',
    status: 'warn',
    detail: 'Simulated · 4.2 GB used',
  },
  { id: 'gradcam', label: 'Grad-CAM++ available', value: 'Enabled', status: 'ok', detail: 'Target layer: layer-9' },
  { id: 'quality', label: 'Quality analyzer available', value: 'Enabled', status: 'ok', detail: '5 metrics' },
];

export const PIPELINE_STAGES = [
  { id: 'upload', label: 'Blood Smear', href: '/quality-assessment' },
  { id: 'quality', label: 'Quality Assessment', href: '/quality-assessment' },
  { id: 'enhance', label: 'Adaptive Enhancement', href: '/quality-assessment' },
  { id: 'detect', label: 'YOLOv8n Detection', href: '/detection' },
  { id: 'validate', label: 'Confidence Validation', href: '/detection' },
  { id: 'explain', label: 'Grad-CAM++', href: '/explainability' },
  { id: 'analytics', label: 'Analytics', href: '/performance' },
];

/* =============================================================== detection === */

/**
 * Mock predictions for the bundled sample field.
 * Box geometry is normalised (0..1) and was aligned to the cells present in
 * `src/assets/blood-smear-sample.jpg`, so overlays land on real cells.
 */
export const SAMPLE_DETECTIONS = [
  {
    id: 1,
    classId: 'blast',
    confidence: 0.96,
    x: 0.2633,
    y: 0.2667,
    w: 0.1031,
    h: 0.1375,
  },
  {
    id: 2,
    classId: 'lymphocyte',
    confidence: 0.91,
    x: 0.4117,
    y: 0.7552,
    w: 0.0969,
    h: 0.1292,
  },
  {
    id: 3,
    classId: 'blast',
    confidence: 0.87,
    x: 0.6234,
    y: 0.551,
    w: 0.1031,
    h: 0.1375,
  },
  {
    id: 4,
    classId: 'neutrophil',
    confidence: 0.98,
    x: 0.7938,
    y: 0.2063,
    w: 0.1031,
    h: 0.1375,
  },
  {
    id: 5,
    classId: 'blast',
    confidence: 0.985,
    x: 0.0414,
    y: 0.2354,
    w: 0.0969,
    h: 0.1292,
  },
];

export const PREDICTION_STATUS_BANDS = [
  { min: 0.85, label: 'HIGH CONFIDENCE', tone: 'ok' },
  { min: 0.6, label: 'MODERATE CONFIDENCE', tone: 'warn' },
  { min: 0, label: 'LOW CONFIDENCE', tone: 'bad' },
];

export const confidenceBand = (avg) =>
  PREDICTION_STATUS_BANDS.find((b) => avg >= b.min) ?? PREDICTION_STATUS_BANDS.at(-1);

/* ============================================================== performance === */

export const PERFORMANCE_METRICS = [
  { id: 'precision', label: 'Precision', value: 0.943, display: '94.3%', sub: 'True positives / predicted', tone: 'accent', icon: 'Crosshair' },
  { id: 'recall', label: 'Recall', value: 0.921, display: '92.1%', sub: 'Sensitivity', tone: 'info', icon: 'ScanEye' },
  { id: 'f1', label: 'F1-score', value: 0.932, display: '93.2%', sub: 'Harmonic mean', tone: 'alt', icon: 'Scale' },
  { id: 'map50', label: 'mAP@0.5', value: 0.918, display: '91.8%', sub: 'Mean average precision', tone: 'ok', icon: 'ChartLine' },
  { id: 'map5095', label: 'mAP@0.5:0.95', value: 0.746, display: '74.6%', sub: 'Strict IoU average', tone: 'warn', icon: 'Radar' },
  { id: 'inference', label: 'Inference Time', value: 12.4, display: '12.4 ms', raw: 12.4, sub: 'Per image · batch 1', tone: 'accent', icon: 'Timer' },
  { id: 'fps', label: 'Throughput', value: 80.6, display: '80.6 FPS', raw: 80.6, sub: 'Simulated GPU', tone: 'info', icon: 'Gauge' },
  { id: 'params', label: 'Parameters', value: 3.2, display: '3.2M', raw: 3.2, sub: 'YOLOv8n backbone', tone: 'alt', icon: 'Boxes' },
];

/** 120-epoch training history, generated once with a fixed seed. */
export const EPOCHS = 120;
const trainingRnd = mulberry32(4242);
export const TRAINING_HISTORY = Array.from({ length: EPOCHS }, (_, i) => {
  const e = i + 1;
  const p = e / EPOCHS;
  const ease = 1 - Math.pow(1 - p, 2.2);
  const noise = (amp) => (trainingRnd() - 0.5) * amp;
  return {
    epoch: e,
    box_loss: +Math.max(0.42, 1.86 * Math.pow(1 - ease, 1.5) + 0.42 + noise(0.05)).toFixed(4),
    obj_loss: +Math.max(0.55, 2.42 * Math.pow(1 - ease, 1.6) + 0.55 + noise(0.07)).toFixed(4),
    cls_loss: +Math.max(0.36, 2.08 * Math.pow(1 - ease, 1.7) + 0.36 + noise(0.06)).toFixed(4),
    val_box_loss: +Math.max(0.5, 1.86 * Math.pow(1 - ease, 1.4) + 0.5 + noise(0.09) + 0.12).toFixed(4),
    val_obj_loss: +Math.max(0.62, 2.42 * Math.pow(1 - ease, 1.5) + 0.62 + noise(0.12) + 0.16).toFixed(4),
    val_cls_loss: +Math.max(0.44, 2.08 * Math.pow(1 - ease, 1.6) + 0.44 + noise(0.1) + 0.1).toFixed(4),
    precision: +Math.min(0.951, 0.55 + 0.4 * ease + noise(0.018)).toFixed(4),
    recall: +Math.min(0.934, 0.48 + 0.45 * ease + noise(0.02)).toFixed(4),
    map50: +Math.min(0.931, 0.62 + 0.31 * ease + noise(0.016)).toFixed(4),
    map5095: +Math.min(0.758, 0.31 + 0.45 * ease + noise(0.014)).toFixed(4),
    lr: +((0.01 * 0.5 * (1 + Math.cos(Math.PI * p)) + 0.0002).toFixed(6)),
  };
});

const curveRnd = mulberry32(9091);
const curve = (start, end, n, dip = 0, jitter = 0.004) =>
  Array.from({ length: n }, (_, i) => {
    const p = i / (n - 1);
    const v = start + (end - start) * (1 - Math.pow(1 - p, 2.4));
    return +Math.min(0.999, Math.max(0, v + (curveRnd() - 0.5) * jitter - dip * Math.sin(p * Math.PI))).toFixed(4);
  });

/** Precision–recall curve (ALL validation split). */
export const PR_CURVE = Array.from({ length: 41 }, (_, i) => {
  const recall = +(i / 40).toFixed(2);
  const p = +(0.985 - 0.72 * Math.pow(recall, 2.6) + 0.06 * Math.sin(recall * 7)).toFixed(4);
  return { recall, precision: Math.max(0.02, Math.min(0.99, p)), f1: 0 };
}).map((d) => ({
  ...d,
  f1: +((2 * d.precision * d.recall) / (d.precision + d.recall || 1)).toFixed(4),
}));

/** Precision vs confidence threshold. */
export const PRECISION_CURVE = Array.from({ length: 21 }, (_, i) => {
  const t = i / 20;
  return {
    threshold: +t.toFixed(2),
    precision: +Math.min(0.96, 0.72 + 0.24 * Math.pow(t, 0.7)).toFixed(4),
    f1: +Math.min(0.95, 0.66 + 0.3 * Math.pow(t, 0.75)).toFixed(4),
  };
});

/** Recall vs confidence threshold. */
export const RECALL_CURVE = Array.from({ length: 21 }, (_, i) => {
  const t = i / 20;
  return {
    threshold: +t.toFixed(2),
    recall: +Math.max(0.06, 0.97 - 0.6 * Math.pow(t, 1.4)).toFixed(4),
  };
});

export const MAP50_CURVE = TRAINING_HISTORY.map((d) => ({ epoch: d.epoch, map50: d.map50 }));
export const MAP5095_CURVE = TRAINING_HISTORY.map((d) => ({ epoch: d.epoch, map5095: d.map5095 }));

/** Histogram of raw-model confidences across the validation split. */
export const CONFIDENCE_DISTRIBUTION = [
  { bin: '0.0–0.1', count: 84, predicted: 41, actual: 43 },
  { bin: '0.1–0.2', count: 112, predicted: 63, actual: 49 },
  { bin: '0.2–0.3', count: 146, predicted: 96, actual: 50 },
  { bin: '0.3–0.4', count: 178, predicted: 128, actual: 50 },
  { bin: '0.4–0.5', count: 205, predicted: 158, actual: 47 },
  { bin: '0.5–0.6', count: 231, predicted: 189, actual: 42 },
  { bin: '0.6–0.7', count: 264, predicted: 229, actual: 35 },
  { bin: '0.7–0.8', count: 289, predicted: 258, actual: 31 },
  { bin: '0.8–0.9', count: 276, predicted: 258, actual: 18 },
  { bin: '0.9–1.0', count: 305, predicted: 301, actual: 4 },
];

/* =========================================================== cross-dataset === */

export const CROSS_DATASET_EXPERIMENTS = [
  {
    id: 'EXP-1',
    title: 'Experiment 1',
    subtitle: 'In-domain baseline',
    train: 'ALL',
    test: 'ALL',
    domain: 'In-domain',
    tone: 'ok',
    metrics: { precision: 0.943, recall: 0.921, f1: 0.932, map50: 0.918, map5095: 0.746 },
    counts: { fp: 118, fn: 96, tp: 1042, tn: 0 },
    inferenceMs: 12.4,
  },
  {
    id: 'EXP-2',
    title: 'Experiment 2',
    subtitle: 'In-domain baseline',
    train: 'C-NMC',
    test: 'C-NMC',
    domain: 'In-domain',
    tone: 'ok',
    metrics: { precision: 0.929, recall: 0.904, f1: 0.916, map50: 0.903, map5095: 0.721 },
    counts: { fp: 74, fn: 68, tp: 612, tn: 0 },
    inferenceMs: 11.8,
  },
  {
    id: 'EXP-3',
    title: 'Experiment 3',
    subtitle: 'Cross-domain transfer',
    train: 'ALL',
    test: 'C-NMC',
    domain: 'Cross-domain',
    tone: 'warn',
    metrics: { precision: 0.862, recall: 0.831, f1: 0.846, map50: 0.847, map5095: 0.658 },
    counts: { fp: 106, fn: 112, tp: 568, tn: 0 },
    inferenceMs: 12.9,
  },
  {
    id: 'EXP-4',
    title: 'Experiment 4',
    subtitle: 'Cross-domain transfer',
    train: 'C-NMC',
    test: 'ALL',
    domain: 'Cross-domain',
    tone: 'bad',
    metrics: { precision: 0.804, recall: 0.782, f1: 0.793, map50: 0.796, map5095: 0.601 },
    counts: { fp: 178, fn: 196, tp: 926, tn: 0 },
    inferenceMs: 13.4,
  },
];

export const CROSS_DATASET_TABLE = CROSS_DATASET_EXPERIMENTS.map((e) => ({
  id: e.id,
  dataset: e.test,
  training: e.train,
  testing: e.test,
  precision: e.metrics.precision,
  recall: e.metrics.recall,
  f1: e.metrics.f1,
  map50: e.metrics.map50,
  map5095: e.metrics.map5095,
  domain: e.domain,
}));

/** 3×3 confusion matrix (background / normal / leukaemia). */
export const CONFUSION_MATRIX = [
  [1284, 62, 18],
  [41, 864, 37],
  [29, 58, 613],
];
export const CONFUSION_LABELS = ['Background / Normal RBC', 'Normal WBC', 'Leukaemia Cell'];

/* ================================================================ ablation === */

export const ABLATION_MODELS = [
  {
    id: 'A',
    code: 'Model A',
    name: 'Basic YOLOv8n',
    stack: ['YOLOv8n'],
    metrics: { precision: 0.851, recall: 0.792, f1: 0.82, map50: 0.813, map5095: 0.612 },
    inferenceMs: 12.1,
    params: 3.2,
    tone: 'muted',
  },
  {
    id: 'B',
    code: 'Model B',
    name: 'YOLOv8n + Preprocessing',
    stack: ['YOLOv8n', 'Static preprocessing'],
    metrics: { precision: 0.882, recall: 0.836, f1: 0.858, map50: 0.851, map5095: 0.649 },
    inferenceMs: 13.0,
    params: 3.2,
    tone: 'muted',
  },
  {
    id: 'C',
    code: 'Model C',
    name: 'YOLOv8n + Image Quality Assessment',
    stack: ['YOLOv8n', 'Quality assessment'],
    metrics: { precision: 0.906, recall: 0.871, f1: 0.888, map50: 0.877, map5095: 0.682 },
    inferenceMs: 13.6,
    params: 3.25,
    tone: 'muted',
  },
  {
    id: 'D',
    code: 'Model D',
    name: 'YOLOv8n + Adaptive Enhancement',
    stack: ['YOLOv8n', 'Quality assessment', 'Adaptive enhancement'],
    metrics: { precision: 0.921, recall: 0.898, f1: 0.909, map50: 0.901, map5095: 0.714 },
    inferenceMs: 14.2,
    params: 3.27,
    tone: 'muted',
  },
  {
    id: 'E',
    code: 'Model E',
    name: 'YOLOv8n + Adaptive Enhancement + Optimization',
    stack: ['YOLOv8n', 'Quality assessment', 'Adaptive enhancement', 'Hyper-parameter optimisation'],
    metrics: { precision: 0.934, recall: 0.912, f1: 0.923, map50: 0.912, map5095: 0.734 },
    inferenceMs: 14.4,
    params: 3.27,
    tone: 'muted',
  },
  {
    id: 'F',
    code: 'Model F',
    name: 'Final Proposed Model (A-QALCD)',
    stack: [
      'Quality assessment',
      'Adaptive enhancement',
      'Optimised YOLOv8n',
      'Confidence validation',
      'Grad-CAM++',
    ],
    metrics: { precision: 0.943, recall: 0.921, f1: 0.932, map50: 0.918, map5095: 0.746 },
    inferenceMs: 15.1,
    params: 3.29,
    tone: 'final',
    isFinal: true,
  },
];

export const ABLATION_METRICS = ['precision', 'recall', 'f1', 'map50', 'map5095', 'inferenceMs'];

/* =========================================================== error analysis === */

export const ERROR_CATEGORIES = [
  { id: 'false_positive', label: 'False Positive', tone: 'bad', count: 118, share: 0.31 },
  { id: 'false_negative', label: 'False Negative', tone: 'bad', count: 96, share: 0.25 },
  { id: 'low_quality', label: 'Low Quality', tone: 'warn', count: 74, share: 0.19 },
  { id: 'blur', label: 'Blur', tone: 'warn', count: 61, share: 0.16 },
  { id: 'low_contrast', label: 'Low Contrast', tone: 'warn', count: 52, share: 0.14 },
  { id: 'overlapping', label: 'Overlapping Cells', tone: 'info', count: 45, share: 0.12 },
  { id: 'similar_morphology', label: 'Similar Morphology', tone: 'alt', count: 38, share: 0.1 },
  { id: 'staining', label: 'Staining Variation', tone: 'info', count: 31, share: 0.08 },
  { id: 'annotation', label: 'Annotation Problem', tone: 'muted', count: 22, share: 0.06 },
  { id: 'dataset_specific', label: 'Dataset-Specific Variation', tone: 'muted', count: 17, share: 0.04 },
];

export const ERROR_EXAMPLES = [
  {
    id: 'ERR-001',
    image: 'lowQuality',
    errorType: 'Low Quality',
    predicted: 'Background',
    actual: 'Blast',
    confidence: 0.41,
    cause: 'Defocused field below the sharpness threshold; adaptive enhancement insufficient.',
    severity: 'High',
  },
  {
    id: 'ERR-002',
    image: 'lowContrast',
    errorType: 'Low Contrast',
    predicted: 'Normal Cell',
    actual: 'Lymphoblast',
    confidence: 0.58,
    cause: 'Faint staining removed nuclear chromatin detail during segmentation.',
    severity: 'High',
  },
  {
    id: 'ERR-003',
    image: 'crowded',
    errorType: 'Overlapping Cells',
    predicted: 'Single Blast',
    actual: '3 × Blast',
    confidence: 0.72,
    cause: 'Non-maximum suppression merged adjacent cells in a dense cluster.',
    severity: 'Medium',
  },
  {
    id: 'ERR-004',
    image: 'stainVariation',
    errorType: 'Staining Variation',
    predicted: 'Promyelocyte',
    actual: 'Myelocyte',
    confidence: 0.64,
    cause: 'Stain intensity outside the training distribution skewed class features.',
    severity: 'Medium',
  },
  {
    id: 'ERR-005',
    image: 'overexposed',
    errorType: 'False Positive',
    predicted: 'Blast',
    actual: 'Background',
    confidence: 0.67,
    cause: 'Saturated pixel region mimicked a high nucleus-to-cytoplasm ratio.',
    severity: 'Medium',
  },
  {
    id: 'ERR-006',
    image: 'lowQuality',
    errorType: 'Blur',
    predicted: 'Blast',
    actual: 'Normal Cell',
    confidence: 0.55,
    cause: 'Motion blur removed the chromatin texture used for discrimination.',
    severity: 'Medium',
  },
  {
    id: 'ERR-007',
    image: 'crowded',
    errorType: 'Similar Morphology',
    predicted: 'Lymphocyte',
    actual: 'Lymphoblast',
    confidence: 0.69,
    cause: 'High nucleus-to-cytoplasm ratio ambiguous at this magnification.',
    severity: 'High',
  },
  {
    id: 'ERR-008',
    image: 'stainVariation',
    errorType: 'Annotation Problem',
    predicted: 'Background',
    actual: 'Myelocyte',
    confidence: 0.38,
    cause: 'Ground-truth box offset from the labelled cell boundary.',
    severity: 'Low',
  },
  {
    id: 'ERR-009',
    image: 'sample',
    errorType: 'Dataset-Specific Variation',
    predicted: 'Normal Cell',
    actual: 'Blast',
    confidence: 0.62,
    cause: 'Mature morphology resembling C-NMC training distribution.',
    severity: 'Medium',
  },
  {
    id: 'ERR-010',
    image: 'overexposed',
    errorType: 'False Negative',
    predicted: '—',
    actual: 'Blast',
    confidence: 0.31,
    cause: 'Cell lost after brightness correction clipped the highlight region.',
    severity: 'High',
  },
  {
    id: 'ERR-011',
    image: 'lowContrast',
    errorType: 'False Negative',
    predicted: '—',
    actual: 'Promyelocyte',
    confidence: 0.44,
    cause: 'Granular cytoplasm below the contrast threshold used for gating.',
    severity: 'Medium',
  },
  {
    id: 'ERR-012',
    image: 'crowded',
    errorType: 'False Positive',
    predicted: 'Myelocyte',
    actual: 'Background',
    confidence: 0.61,
    cause: 'RBC edge artefact classified as a granulocyte precursor.',
    severity: 'Low',
  },
];

/* =========================================================== quality metrics === */

/** Mock analysis outcome per quality band — used when a synthetic report is
 *  requested without supplying an explicit profile. */
export const QUALITY_PROFILES = {
  high: {
    level: 'HIGH',
    score: 84.7,
    metrics: { sharpness: 82.4, contrast: 74.8, brightness: 91.2, colorQuality: 86.5 },
    noise: 'Low',
    decision: 'Direct Processing',
    rationale: 'No enhancement required',
    strategy: 'None',
  },
  medium: {
    level: 'MEDIUM',
    score: 61.3,
    metrics: { sharpness: 58.2, contrast: 54.6, brightness: 76.9, colorQuality: 55.7 },
    noise: 'Moderate',
    decision: 'Mild Enhancement Applied',
    rationale: 'CLAHE + mild contrast correction',
    strategy: 'CLAHE',
  },
  low: {
    level: 'LOW',
    score: 37.5,
    metrics: { sharpness: 26.7, contrast: 31.4, brightness: 62.1, colorQuality: 29.8 },
    noise: 'High',
    decision: 'Strong Enhancement Applied',
    rationale: 'Denoising + CLAHE + stain normalisation',
    strategy: 'Denoising',
  },
};

export const ENHANCEMENT_TECHNIQUES = [
  {
    id: 'original',
    label: 'Original',
    description: 'Raw input, no processing',
    filter: 'none',
    available: 'all',
  },
  {
    id: 'clahe',
    label: 'CLAHE',
    description: 'Contrast Limited Adaptive Histogram Equalisation',
    filter: 'contrast(1.28) saturate(1.1)',
    available: 'all',
  },
  {
    id: 'contrast',
    label: 'Contrast Enhancement',
    description: 'Global contrast stretch',
    filter: 'contrast(1.4) brightness(1.04)',
    available: 'all',
  },
  {
    id: 'brightness',
    label: 'Brightness Correction',
    description: 'Gamma-based exposure correction',
    filter: 'brightness(1.18) contrast(1.06)',
    available: 'all',
  },
  {
    id: 'denoise',
    label: 'Noise Reduction',
    description: 'Edge-preserving smoothing',
    filter: 'contrast(1.12) saturate(1.04)',
    available: 'all',
  },
  {
    id: 'colorNorm',
    label: 'Colour Normalisation',
    description: 'White-balance / channel equalisation',
    filter: 'saturate(0.78) brightness(1.05)',
    available: 'all',
  },
  {
    id: 'stainNorm',
    label: 'Stain Normalisation',
    description: 'Macenko stain colour deconvolution',
    filter: 'saturate(1.16) hue-rotate(-8deg) contrast(1.08)',
    available: 'all',
  },
];

export const ENHANCEMENT_STRATEGIES = [
  { id: 'auto', label: 'Auto', description: 'Chosen by the quality analyser' },
  { id: 'none', label: 'None', description: 'Use the original field without enhancement' },
  { id: 'clahe', label: 'CLAHE', description: 'Local contrast equalisation' },
  { id: 'contrast', label: 'Contrast', description: 'Global contrast stretch' },
  { id: 'denoising', label: 'Denoising', description: 'Noise reduction only' },
  { id: 'colorNorm', label: 'Colour Normalisation', description: 'Channel equalisation' },
  { id: 'stainNorm', label: 'Stain Normalisation', description: 'Macenko deconvolution' },
];

export const QUALITY_GATEWAY_FLOW = [
  { id: 'input', label: 'Input Image', detail: 'Peripheral blood smear' },
  { id: 'analysis', label: 'Image Quality Analysis', detail: '5 no-reference metrics' },
  { id: 'classification', label: 'Quality Classification', detail: 'High / Medium / Low' },
  {
    id: 'decision',
    label: 'Adaptive Decision',
    detail: 'Branches on measured quality',
    branch: true,
  },
  { id: 'normalize', label: 'Normalization', detail: 'Tensor scaling 0–255 → 0–1' },
  { id: 'detect', label: 'YOLOv8n', detail: 'Detection & classification' },
];

export const QUALITY_BRANCHES = [
  {
    level: 'HIGH',
    tone: 'ok',
    action: 'Direct Processing',
    detail: 'No enhancement required',
    scoreRange: '≥ 75',
  },
  {
    level: 'MEDIUM',
    tone: 'warn',
    action: 'Mild Enhancement',
    detail: 'CLAHE + contrast correction',
    scoreRange: '50 – 74.9',
  },
  {
    level: 'LOW',
    tone: 'bad',
    action: 'Strong Enhancement',
    detail: 'Denoising + CLAHE + stain normalisation',
    scoreRange: '< 50',
  },
];

/* ============================================================ explainability === */

export const GRADCAM_SUMMARY = {
  prediction: 'Blast Cell',
  confidence: 0.964,
  targetLayer: 'models.22.cv2.conv (layer-9)',
  classIndex: 0,
  positiveGradientShare: 0.61,
  topRegion: 'nucleus / high chromatin density',
  generatedAt: '2026-02-12 10:24:07',
};

export const GRADCAM_COMPARISON = [
  {
    id: 'high',
    label: 'High Quality',
    image: 'sample',
    score: 84.7,
    confidence: 0.964,
    focus: 'Nucleus',
    note: 'Heatmap concentrates on chromatin texture; attribution is stable.',
    sharpness: 82.4,
    color: '#2FBF71',
  },
  {
    id: 'medium',
    label: 'Medium Quality',
    image: 'lowContrast',
    score: 61.3,
    confidence: 0.887,
    focus: 'Nucleus + boundary',
    note: 'Attribution spreads towards the cell boundary as contrast drops.',
    sharpness: 58.2,
    color: '#E0A33A',
  },
  {
    id: 'low',
    label: 'Low Quality',
    image: 'lowQuality',
    score: 37.5,
    confidence: 0.712,
    focus: 'Diffuse',
    note: 'Attribution becomes diffuse; low confidence flagged by validation.',
    sharpness: 26.7,
    color: '#E1555A',
  },
];

/* ================================================================= settings === */

export const DEFAULT_SETTINGS = {
  model: {
    name: 'YOLOv8n',
    version: '8.0.101',
    weights: 'yolov8n-aqalcd-best.pt',
    weightsSize: '6.5 MB',
    device: 'CUDA:0',
    inputChannels: 3,
    classes: 7,
  },
  training: {
    learningRate: 0.01,
    batchSize: 16,
    epochs: 120,
    imageSize: 640,
    optimizer: 'SGD',
    momentum: 0.937,
    weightDecay: 0.0005,
    warmupEpochs: 3,
    patience: 30,
  },
  inference: {
    confidenceThreshold: 0.5,
    iouThreshold: 0.45,
    maxDetections: 300,
    imageSize: 640,
    halfPrecision: false,
  },
  optimization: {
    method: 'Bayesian Optimization',
    trials: 60,
    searchSpace: 'lr ∈ [1e-5, 1e-1] · batch ∈ {8,16,32} · wd ∈ [0, 1e-3]',
  },
  quality: {
    sharpnessThreshold: 60,
    contrastThreshold: 55,
    brightnessThreshold: 45,
    noiseThreshold: 18,
    colorThreshold: 55,
    highCutoff: 75,
    lowCutoff: 50,
  },
  explainability: {
    enabled: true,
    method: 'Grad-CAM++',
    targetLayer: 'layer-9',
    alpha: 0.55,
    colormap: 'Turbo',
  },
};

export const OPTIMIZATION_METHODS = [
  { id: 'random', label: 'Random Search', trials: 100, desc: 'Uniform sampling of the hyper-parameter space.' },
  { id: 'grid', label: 'Grid Search', trials: 36, desc: 'Exhaustive sweep across a discrete grid.' },
  { id: 'bayesian', label: 'Bayesian Optimization', trials: 60, desc: 'Optuna TPE surrogate, lowest evaluation budget.' },
];

export const OPTIMIZERS = ['SGD', 'Adam', 'AdamW', 'RMSProp'];

export const IMAGE_SIZES = [320, 416, 512, 640, 768, 960];
export const BATCH_SIZES = [4, 8, 16, 32, 64];

/* ============================================================= notifications === */

export const NOTIFICATIONS = [
  {
    id: 'N1',
    tone: 'ok',
    title: 'Evaluation completed',
    body: 'ALL · YOLOv8n reached mAP@0.5 = 0.918 on the high-quality split.',
    time: '12 min ago',
  },
  {
    id: 'N2',
    tone: 'warn',
    title: 'Cross-domain drop detected',
    body: 'Train C-NMC → Test ALL dropped 12.2 mAP points against the in-domain baseline.',
    time: '1 h ago',
  },
  {
    id: 'N3',
    tone: 'info',
    title: 'Backend not connected',
    body: 'Running on simulated inference. Connect the YOLOv8 service in Settings → Backend.',
    time: '2 h ago',
  },
  {
    id: 'N4',
    tone: 'alt',
    title: 'Ablation complete',
    body: 'Model F (A-QALCD) improves mAP@0.5:0.95 by +13.4 points over Model A.',
    time: 'Yesterday',
  },
];

/* =============================================================== integrity === */

/** Provenance block surfaced in the UI so demo data is never mistaken for real
 *  experimental results. */
export const MOCK_DATA_MANIFEST = {
  generated: '2026-02-12T10:24:07Z',
  records: {
    trainingEpochs: EPOCHS,
    evaluations: RECENT_EVALUATIONS.length,
    experiments: CROSS_DATASET_EXPERIMENTS.length,
    ablationModels: ABLATION_MODELS.length,
    errorExamples: ERROR_EXAMPLES.length,
  },
  note: 'Simulated dataset shipped with the prototype for interface demonstration.',
};
