import { useState, useRef, useCallback } from 'react'

export function mockTimeSeries(points = 24, base = 50, variance = 30, trend = 0) {
  return Array.from({ length: points }, (_, i) => ({
    time: new Date(Date.now() - (points - 1 - i) * 3600000),
    value: Math.max(0, base + trend * i + (Math.random() - 0.5) * variance),
  }))
}

function fmt(d) { return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }

function yRange(values, thresholdValue) {
  let mn = Math.min(...values)
  let mx = Math.max(...values)
  if (thresholdValue != null) { mn = Math.min(mn, thresholdValue); mx = Math.max(mx, thresholdValue) }
  const pad = (mx - mn) * 0.1 || 1
  return { min: mn - pad, max: mx + pad, range: (mx - mn + pad * 2) || 1 }
}

// All charts use percentage-based coordinates so they scale with container width
// Text is rendered as HTML overlays to avoid SVG text stretching

export function LineChart({
  data, color = '#0ea5e9', height = 80, unit = '', label = '',
  showAxes = true, showArea = true, thresholdValue, thresholdLabel,
}) {
  const [hover, setHover] = useState(null)
  const ref = useRef(null)

  const onMove = useCallback((e) => {
    if (!ref.current || !data.length) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const idx = Math.round((x / rect.width) * (data.length - 1))
    if (idx >= 0 && idx < data.length) setHover(idx)
  }, [data])

  if (!data?.length) return null
  const { min, max, range } = yRange(data.map(d => d.value), thresholdValue)
  const toXPct = (i) => (i / (data.length - 1)) * 100
  const toYPct = (v) => (1 - (v - min) / range) * 100
  const pts = data.map((d, i) => `${toXPct(i)}%,${toYPct(d.value)}%`).join(' ')

  return (
    <div className="relative" onMouseLeave={() => setHover(null)} style={{ height }}>
      {label && <p className="text-[9px] text-foreground-disabled mb-1">{label}</p>}

      {/* SVG chart area — stretches to fill */}
      <svg ref={ref} width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="cursor-crosshair absolute inset-0" onMouseMove={onMove}>
        {/* Area */}
        {showArea && <path d={`M${data.map((d, i) => `${toXPct(i)},${toYPct(d.value)}`).join(' L')} L100,100 L0,100 Z`} fill={color} opacity="0.4" />}
        {/* Line */}
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        {/* Threshold */}
        {thresholdValue != null && <line x1="0" y1={`${toYPct(thresholdValue)}%`} x2="100" y2={`${toYPct(thresholdValue)}%`} stroke="#ef4444" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray="4 2" opacity="0.5" />}
        {/* Grid */}
        <line x1="0" y1="0" x2="100" y2="0" stroke="rgba(51,65,85,0.1)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1="100" x2="100" y2="100" stroke="rgba(51,65,85,0.1)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(51,65,85,0.08)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" strokeDasharray="4 4" />
        {/* Hover line */}
        {hover != null && <>
          <line x1={`${toXPct(hover)}%`} y1="0" x2={`${toXPct(hover)}%`} y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </>}
      </svg>

      {/* Hover dot — HTML so it doesn't stretch */}
      {hover != null && (
        <div className="absolute w-2 h-2 rounded-full border-2 pointer-events-none" style={{ backgroundColor: color, borderColor: '#0a0e1a', left: `${toXPct(hover)}%`, top: `${toYPct(data[hover].value)}%`, transform: 'translate(-50%,-50%)' }} />
      )}

      {/* HTML text overlays */}
      {showAxes && <>
        <span className="absolute text-[7px] text-foreground-disabled" style={{ top: 0, right: 0 }}>{max.toFixed(0)}</span>
        <span className="absolute text-[7px] text-foreground-disabled" style={{ bottom: 0, right: 0 }}>{min.toFixed(0)}</span>
        <span className="absolute text-[7px] text-foreground-disabled" style={{ bottom: -12, left: 0 }}>{fmt(data[0].time)}</span>
        <span className="absolute text-[7px] text-foreground-disabled" style={{ bottom: -12, right: 0 }}>{fmt(data[data.length - 1].time)}</span>
      </>}
      {thresholdLabel && thresholdValue != null && (
        <span className="absolute text-[7px] text-red-400 right-0" style={{ top: `calc(${toYPct(thresholdValue)}% - 10px)` }}>{thresholdLabel}</span>
      )}

      {/* Tooltip */}
      {hover != null && (
        <div className="absolute bg-background-surface-2 border border-border-muted rounded-md px-2 py-1 text-[9px] text-foreground pointer-events-none z-10 shadow-lg whitespace-nowrap" style={{ left: `${toXPct(hover)}%`, top: -24, transform: 'translateX(-50%)' }}>
          <span className="text-foreground-muted">{fmt(data[hover].time)}</span>
          <span className="ml-2 font-semibold" style={{ color }}>{data[hover].value.toFixed(1)}{unit}</span>
        </div>
      )}
    </div>
  )
}

// ─── Multi-Line Chart ─────────────────────────────────────────────
export function MultiLineChart({ series, height = 80, showAxes = true }) {
  const [hover, setHover] = useState(null)
  const ref = useRef(null)

  const onMove = useCallback((e) => {
    if (!ref.current || !series.length) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const len = series[0]?.data?.length || 0
    const idx = Math.round((x / rect.width) * (len - 1))
    if (idx >= 0 && idx < len) setHover(idx)
  }, [series])

  if (!series.length || !series[0].data?.length) return null
  const allVals = series.flatMap(s => s.data.map(d => d.value))
  const { min, max, range } = yRange(allVals)
  const len = series[0].data.length
  const toXPct = (i) => (i / (len - 1)) * 100
  const toYPct = (v) => (1 - (v - min) / range) * 100

  return (
    <div className="relative" onMouseLeave={() => setHover(null)} style={{ height }}>
      <svg ref={ref} width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="cursor-crosshair absolute inset-0" onMouseMove={onMove}>
        <line x1="0" y1="100" x2="100" y2="100" stroke="rgba(51,65,85,0.1)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        {series.map((s, si) => (
          <polyline key={si} points={s.data.map((d, i) => `${toXPct(i)},${toYPct(d.value)}`).join(' ')} fill="none" stroke={s.color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" opacity={hover != null ? 0.4 : 1} />
        ))}
        {hover != null && <line x1={`${toXPct(hover)}`} y1="0" x2={`${toXPct(hover)}`} y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
      </svg>

      {showAxes && <>
        <span className="absolute text-[7px] text-foreground-disabled" style={{ top: 0, right: 0 }}>{max.toFixed(0)}</span>
        <span className="absolute text-[7px] text-foreground-disabled" style={{ bottom: 0, right: 0 }}>{min.toFixed(0)}</span>
        <span className="absolute text-[7px] text-foreground-disabled" style={{ bottom: -12, left: 0 }}>{fmt(series[0].data[0].time)}</span>
        <span className="absolute text-[7px] text-foreground-disabled" style={{ bottom: -12, right: 0 }}>{fmt(series[0].data[len - 1].time)}</span>
      </>}

      {hover != null && (
        <div className="absolute bg-background-surface-2 border border-border-muted rounded-md px-2 py-1 text-[9px] pointer-events-none z-10 shadow-lg whitespace-nowrap" style={{ left: `${toXPct(hover)}%`, top: -24, transform: 'translateX(-50%)' }}>
          <span className="text-foreground-muted">{fmt(series[0].data[hover].time)}</span>
          {series.map((s, i) => <span key={i} className="ml-2 font-semibold" style={{ color: s.color }}>{s.data[hover]?.value.toFixed(1)}{s.unit || ''}</span>)}
        </div>
      )}
    </div>
  )
}

// ─── Bar Chart ────────────────────────────────────────────────────
export function BarChart({ items, height = 60, color = '#0ea5e9' }) {
  const [hoverIdx, setHoverIdx] = useState(null)
  const max = Math.max(...items.map(i => i.value), 1)
  return (
    <div className="flex items-end gap-1" style={{ height }} onMouseLeave={() => setHoverIdx(null)}>
      {items.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center relative" onMouseEnter={() => setHoverIdx(i)}>
          <div className="w-full rounded-t transition-colors" style={{ height: `${(item.value / max) * (height - 14)}px`, backgroundColor: hoverIdx === i ? color : `${color}80` }} />
          <span className="text-[6px] text-foreground-disabled mt-0.5 truncate w-full text-center">{item.label}</span>
          {hoverIdx === i && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-background-surface-2 border border-border-muted rounded px-1.5 py-0.5 text-[8px] text-foreground whitespace-nowrap z-10 shadow-lg">
              {item.value.toFixed(1)}{item.unit || ''}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
