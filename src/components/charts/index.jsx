import {
  Area,
  AreaChart,
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RLineChart,
  Pie,
  PieChart as RPieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar as RRadar,
  RadarChart as RRadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { axisProps, CHART, gridProps, SERIES_COLORS, tooltipStyle } from './chartTheme.jsx';

/* ============================================================== line chart === */

export function LineChart({
  data,
  series,
  xKey,
  height = 240,
  xDomain,
  yDomain,
  yFormat = (v) => v,
  xFormat = (v) => v,
  referenceLines = [],
  showLegend = true,
  legendHeight = 22,
  area = false,
  strokeWidth = 1.8,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RLineChart data={data} margin={{ top: 6, right: 12, bottom: 0, left: -14 }}>
        <CartesianGrid {...gridProps} />
        <XAxis
          dataKey={xKey}
          {...axisProps}
          domain={xDomain}
          tickFormatter={xFormat}
          minTickGap={24}
        />
        <YAxis {...axisProps} domain={yDomain} tickFormatter={yFormat} width={46} />
        <Tooltip {...tooltipStyle} formatter={(v, n) => [yFormat(v), n]} labelFormatter={xFormat} />
        {showLegend && (
          <Legend
            verticalAlign="top"
            align="right"
            height={legendHeight}
            iconType="plainline"
            iconSize={12}
            wrapperStyle={{ fontSize: 11, paddingRight: 6 }}
          />
        )}
        {referenceLines.map((r) => (
          <ReferenceLine
            key={`${r.y}-${r.label ?? ''}`}
            y={r.y}
            stroke={r.color ?? CHART.axis}
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: r.label,
              position: 'insideTopRight',
              fill: r.color ?? CHART.axis,
              fontSize: 10,
            }}
          />
        ))}
        {series.map((s, i) =>
          area ? (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label ?? s.key}
              stroke={s.color ?? SERIES_COLORS[i % SERIES_COLORS.length]}
              strokeWidth={strokeWidth}
              fill={s.fill ?? s.color ?? SERIES_COLORS[i % SERIES_COLORS.length]}
              fillOpacity={s.fillOpacity ?? 0.12}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          ) : (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label ?? s.key}
              stroke={s.color ?? SERIES_COLORS[i % SERIES_COLORS.length]}
              strokeWidth={s.strokeWidth ?? strokeWidth}
              strokeDasharray={s.dashed ? '4 3' : undefined}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          ),
        )}
      </RLineChart>
    </ResponsiveContainer>
  );
}

/* ============================================================= area chart === */

export function SingleAreaChart({
  data,
  dataKey,
  color = CHART.accent,
  xKey,
  height = 240,
  yDomain,
  yFormat = (v) => v,
  xFormat = (v) => v,
  fillId = 'aq-area',
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 6, right: 12, bottom: 0, left: -14 }}>
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.24} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey={xKey} {...axisProps} tickFormatter={xFormat} minTickGap={24} />
        <YAxis {...axisProps} domain={yDomain} tickFormatter={yFormat} width={46} />
        <Tooltip {...tooltipStyle} formatter={(v) => [yFormat(v), dataKey]} labelFormatter={xFormat} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={1.8}
          fill={`url(#${fillId})`}
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ============================================================== bar chart === */

export function BarChart({
  data,
  series,
  xKey,
  height = 240,
  yFormat = (v) => v,
  yDomain,
  xFormat = (v) => v,
  stacked = false,
  showLegend = true,
  legendHeight = 22,
  barSize,
  layout = 'horizontal',
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RBarChart
        data={data}
        layout={layout}
        margin={{ top: 6, right: 12, bottom: 0, left: layout === 'vertical' ? 8 : -14 }}
        barGap={2}
      >
        <CartesianGrid {...gridProps} vertical={layout === 'vertical'} horizontal={layout !== 'vertical'} />
        {layout === 'vertical' ? (
          <>
            <XAxis type="number" {...axisProps} tickFormatter={yFormat} />
            <YAxis type="category" dataKey={xKey} {...axisProps} width={96} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} {...axisProps} tickFormatter={xFormat} interval="preserveStartEnd" />
            <YAxis {...axisProps} tickFormatter={yFormat} width={46} domain={yDomain} />
          </>
        )}
        <Tooltip {...tooltipStyle} formatter={(v) => [yFormat(v)]} cursor={{ fill: 'rgba(255,255,255,0.035)' }} />
        {showLegend && series.length > 1 && (
          <Legend
            verticalAlign="top"
            align="right"
            height={legendHeight}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingRight: 6 }}
          />
        )}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label ?? s.key}
            fill={s.color ?? SERIES_COLORS[i % SERIES_COLORS.length]}
            stackId={stacked ? 'a' : undefined}
            radius={stacked ? 0 : layout === 'vertical' ? [0, 3, 3, 0] : [3, 3, 0, 0]}
            barSize={barSize}
            maxBarSize={38}
            isAnimationActive={false}
          >
            {s.cellColors &&
              data.map((_, idx) => <Cell key={idx} fill={s.cellColors[idx % s.cellColors.length]} />)}
          </Bar>
        ))}
      </RBarChart>
    </ResponsiveContainer>
  );
}

/* ================================================================== donut === */

export function DonutChart({
  data,
  height = 200,
  valueKey = 'value',
  nameKey = 'name',
  innerRadius = '62%',
  outerRadius = '86%',
  centerLabel,
  centerValue,
  padAngle = 2,
}) {
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RPieChart>
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={nameKey}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={padAngle}
            stroke="#0F1317"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {data.map((d) => (
              <Cell key={d[nameKey]} fill={d.color} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} formatter={(v) => [v.toLocaleString('en-US')]} />
        </RPieChart>
      </ResponsiveContainer>
      {(centerValue || centerLabel) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && <span className="tnum text-xl font-semibold leading-none text-ink">{centerValue}</span>}
          {centerLabel && <span className="mt-1 text-2xs uppercase tracking-[0.07em] text-ink-muted">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}

/* ================================================================== radar === */

export function RadarChart({
  data,
  series,
  angleKey = 'metric',
  height = 260,
  domain = [0, 1],
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RRadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="rgba(255,255,255,0.07)" />
        <PolarAngleAxis dataKey={angleKey} tick={{ fill: CHART.axis, fontSize: 10 }} />
        <PolarRadiusAxis domain={domain} tick={{ fill: CHART.axis, fontSize: 9 }} tickCount={5} axisLine={false} />
        <Tooltip {...tooltipStyle} formatter={(v) => [`${(v * 100).toFixed(1)}%`]} />
        {series.map((s, i) => (
          <RRadar
            key={s.key}
            dataKey={s.key}
            name={s.label ?? s.key}
            stroke={s.color ?? SERIES_COLORS[i % SERIES_COLORS.length]}
            fill={s.color ?? SERIES_COLORS[i % SERIES_COLORS.length]}
            fillOpacity={0.14}
            strokeWidth={1.6}
          />
        ))}
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11 }}
        />
      </RRadarChart>
    </ResponsiveContainer>
  );
}

/* ============================================================ confusion === */

/**
 * Matrix rendered as coloured cells — clearer than a Recharts treemap, and
 * lets the diagonal read as the axis of interest for a classifier.
 */
export function ConfusionMatrix({ matrix, labels }) {
  const flat = matrix.flat();
  const max = Math.max(...flat);
  const total = flat.reduce((a, b) => a + b, 0);
  const correct = matrix.reduce((sum, row, r) => sum + (row[r] ?? 0), 0);

  return (
    <div className="flex flex-col gap-2">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `minmax(80px, 112px) repeat(${matrix[0].length}, minmax(0, 1fr))` }}
      >
        <div className="flex items-center justify-end pr-1 text-right text-[9.5px] font-semibold uppercase leading-tight tracking-[0.07em] text-ink-faint">
          Actual ↓
        </div>
        {labels.map((l) => (
          <div
            key={l}
            className="flex items-center justify-center px-1 text-center text-[10px] font-semibold uppercase leading-tight tracking-[0.05em] text-ink-muted"
          >
            {l}
          </div>
        ))}

        {matrix.map((row, r) => (
          <MatrixRow key={labels[r]} label={labels[r]} row={row} rowIndex={r} labels={labels} max={max} />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
        <p className="tnum text-[10.5px] leading-none text-ink-faint">
          Total {total.toLocaleString('en-US')} · accuracy{' '}
          <span className="font-medium text-ok">
            {total ? `${((correct / total) * 100).toFixed(1)}%` : '—'}
          </span>
        </p>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="text-[9.5px] uppercase leading-none tracking-[0.07em] text-ink-faint">low</span>
          {[0.06, 0.2, 0.34, 0.48, 0.68].map((a) => (
            <span
              key={a}
              className="h-2.5 w-4 rounded-[2px] border border-line-soft"
              style={{ backgroundColor: `rgba(45,127,249,${a.toFixed(2)})` }}
            />
          ))}
          <span className="text-[9.5px] uppercase leading-none tracking-[0.07em] text-ink-faint">high</span>
        </div>
      </div>
    </div>
  );
}

function MatrixRow({ label, row, rowIndex, labels, max }) {
  return (
    <>
      <div className="flex items-center justify-end pr-2 text-[10px] font-semibold uppercase leading-tight tracking-[0.05em] text-ink-soft">
        {label}
      </div>
      {row.map((v, c) => {
        const intensity = max ? v / max : 0;
        // The diagonal is the cell at rowIndex === columnIndex; only mark it
        // when it actually holds samples, so empty classes stay unmarked.
        const isDiagonal = c === rowIndex && v > 0;
        return (
          <div
            key={`${label}-${c}`}
            className="tnum flex items-center justify-center rounded-sm border text-[11.5px] font-medium leading-none transition-colors hover:border-line-strong"
            style={{
              backgroundColor: `rgba(45,127,249,${(0.05 + intensity * 0.6).toFixed(3)})`,
              color: intensity > 0.5 ? '#fff' : intensity > 0.15 ? '#C9D5E1' : '#68757F',
              borderColor: isDiagonal ? 'rgba(47,191,113,0.45)' : undefined,
              minHeight: 40,
            }}
            title={`Actual ${label} → predicted ${labels[c]}: ${v.toLocaleString('en-US')}`}
          >
            {v.toLocaleString('en-US')}
          </div>
        );
      })}
    </>
  );
}
