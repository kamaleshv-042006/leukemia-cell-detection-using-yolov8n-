import { getClass, isMalignant } from '../data/classes.js';
import { confidenceBand } from '../data/mockData.js';

/**
 * Derives the detection summary shown next to the image viewer.
 * Kept as a pure function so the Confidence-threshold slider and the class
 * filters can recompute it instantly without touching the network.
 */
export function summariseDetections(detections, threshold = 0) {
  const visible = detections.filter((d) => d.confidence >= threshold);
  const malignant = visible.filter((d) => isMalignant(d.classId));
  const normal = visible.filter((d) => !isMalignant(d.classId));
  const avg = visible.length
    ? visible.reduce((s, d) => s + d.confidence, 0) / visible.length
    : 0;

  const band = visible.length ? confidenceBand(avg) : { label: 'NO DETECTION', tone: 'muted' };

  return {
    total: visible.length,
    hidden: detections.length - visible.length,
    malignant: malignant.length,
    normal: normal.length,
    avgConfidence: avg,
    band,
    maxConfidence: visible.reduce((m, d) => Math.max(m, d.confidence), 0),
    // Flagged as requiring human review when anything sits under the gate.
    requiresReview: visible.some((d) => d.confidence < 0.6),
  };
}

/** Per-class histogram used by the confidence bars in the summary panel. */
export function detectionBreakdown(detections, threshold = 0) {
  const visible = detections.filter((d) => d.confidence >= threshold);
  const map = new Map();
  visible.forEach((d) => {
    const entry = map.get(d.classId) ?? { classId: d.classId, count: 0, sum: 0 };
    entry.count += 1;
    entry.sum += d.confidence;
    map.set(d.classId, entry);
  });
  return [...map.values()]
    .map((e) => ({
      ...e,
      ...getClass(e.classId),
      avgConfidence: e.sum / e.count,
    }))
    .sort((a, b) => b.count - a.count || b.avgConfidence - a.avgConfidence);
}

/** Row shape for the detection results table. */
export function toDetectionRows(detections, threshold = 0) {
  return detections
    .filter((d) => d.confidence >= threshold)
    .map((d) => {
      const cls = getClass(d.classId);
      return {
        id: d.id,
        classId: d.classId,
        class: cls.label,
        confidence: d.confidence,
        status: d.confidence >= 0.85 ? 'High' : d.confidence >= 0.6 ? 'Review' : 'Low',
        x: +(d.x * 100).toFixed(2),
        y: +(d.y * 100).toFixed(2),
        width: +(d.w * 100).toFixed(2),
        height: +(d.h * 100).toFixed(2),
        type: cls.malignant ? 'Leukemia' : 'Normal',
        color: cls.color,
      };
    });
}
