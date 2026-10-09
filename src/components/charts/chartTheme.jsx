/**
 * Shared Recharts theme tokens.
 * Keeping these in one place is what makes the analytics pages look coherent.
 */
export const CHART = {
  accent: '#2D7FF9',
  info: '#2BB6C4',
  alt: '#8B7BE8',
  ok: '#2FBF71',
  warn: '#E0A33A',
  bad: '#E1555A',
  grid: 'rgba(255,255,255,0.05)',
  axis: '#68757F',
  surface: '#0F1317',
  text: '#9AA9B8',
};

export const SERIES_COLORS = [CHART.accent, CHART.info, CHART.alt, CHART.warn, CHART.ok, CHART.bad];

export const axisProps = {
  stroke: CHART.axis,
  tick: { fill: CHART.axis, fontSize: 10 },
  tickLine: false,
  axisLine: { stroke: 'rgba(255,255,255,0.08)' },
};

export const gridProps = {
  stroke: CHART.grid,
  strokeDasharray: '3 3',
  vertical: false,
};

export const tooltipStyle = {
  contentStyle: {
    background: '#0B0E11',
    border: '1px solid #222A33',
    borderRadius: 4,
    fontSize: 11.5,
    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
    padding: '6px 8px',
  },
  labelStyle: { color: '#68757F', fontSize: 10, marginBottom: 3 },
  itemStyle: { color: '#9AA9B8', fontSize: 11, padding: '0.5px 0' },
  cursor: { fill: 'rgba(255,255,255,0.035)' },
};

/** Gradient fill helper for area charts. */
export const areaGradient = (id, color, opacity = 0.22) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor={color} stopOpacity={opacity} />
    <stop offset="100%" stopColor={color} stopOpacity={0} />
  </linearGradient>
);

export const percentTick = (v) => `${Math.round(v * 100)}%`;
