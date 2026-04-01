import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PaperPlaneRight, Bell, ChartBar, Sparkle, ArrowRight,
  Rocket, Warning, TrendUp, Path, FileText, Gauge,
  WaveTriangle, CaretDown, CaretRight, Database,
  Lightning, Globe, Cpu, Clock, Package, ArrowSquareOut,
  MagnifyingGlass, X, Download,
} from '@phosphor-icons/react'
import { usePersona } from '../data/persona'
import { LineChart, MultiLineChart, BarChart, mockTimeSeries } from '../components/Chart'
import { AgentDrawer } from '../components/Drawer'
import { getInvestigation } from '../data/investigations'

// ─── Empty State ──────────────────────────────────────────────────
function EmptyW({ icon: Icon, label, action, color = 'text-foreground-disabled' }) {
  return (
    <div className="rounded-lg border border-border-muted/20 border-dashed p-4 flex flex-col items-center justify-center text-center h-full min-h-[120px]">
      <Icon size={20} className={`${color} mb-2`} />
      <p className="text-[10px] text-foreground-disabled mb-1">{label}</p>
      {action && <button className="text-[9px] text-primary hover:text-primary-hover">{action}</button>}
    </div>
  )
}

function WidgetHeader({ icon: Icon, title, color, action, actionLabel = 'View all', onInvestigate }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-1.5">
        <Icon size={14} className={color} />
        <span className="text-[11px] font-medium text-foreground">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {onInvestigate && (
          <button onClick={onInvestigate} className="flex items-center gap-1 text-[9px] text-primary hover:text-primary-hover transition-colors">
            <MagnifyingGlass size={10} /> Investigate
          </button>
        )}
        {action && (
          <button onClick={action} className="flex items-center gap-0.5 text-[9px] text-primary hover:text-primary-hover">
            {actionLabel} <ArrowSquareOut size={9} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Alarm Widget ─────────────────────────────────────────────────
function AlarmsW({ services }) {
  const w = services.filter(s => s.hasAlarms).length
  if (w === 0) return <EmptyW icon={Bell} label="No alarms configured" action="Set up alarms →" />
  const data = useMemo(() => mockTimeSeries(24, w, 0), [w])
  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <WidgetHeader icon={Bell} title="Alarms" color="text-status-active" actionLabel="Manage" />
      <div className="flex gap-3 mb-3">
        <div className="flex-1 rounded-lg bg-status-active/10 p-2 text-center"><p className="text-body-l font-semibold text-status-active">{w}</p><p className="text-[8px] text-foreground-muted">OK</p></div>
        <div className="flex-1 rounded-lg bg-status-degraded/10 p-2 text-center"><p className="text-body-l font-semibold text-status-degraded">0</p><p className="text-[8px] text-foreground-muted">Alarm</p></div>
        <div className="flex-1 rounded-lg bg-foreground-muted/10 p-2 text-center"><p className="text-body-l font-semibold text-foreground-muted">0</p><p className="text-[8px] text-foreground-muted">Insuff.</p></div>
      </div>
      <p className="text-[9px] text-foreground-disabled mb-1">Alarm state changes (24h)</p>
      <div className="mt-auto"><LineChart data={data} color="#22c55e" height={64} unit="" showAxes={false} showArea={false} /></div>
    </div>
  )
}

// ─── Error Rate Widget ────────────────────────────────────────────
function ErrorRateW({ services = [] }) {
  const series = useMemo(() => services.map((s, i) => ({
    name: s, color: ['#f87171', '#fb923c', '#fbbf24'][i % 3],
    data: mockTimeSeries(24, 0.5 + Math.random() * 2, 1.5), unit: '%',
  })), [services])
  if (!services.length) return <EmptyW icon={Warning} label="No error data" color="text-red-400" />
  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <WidgetHeader icon={Warning} title="Error Rate" color="text-red-400" actionLabel="Investigate" />
      <div className="mt-auto"><MultiLineChart series={series} height={80} /></div>
      <div className="flex gap-3 mt-2">
        {series.map(s => (
          <div key={s.name} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-[8px] text-foreground-muted">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Latency Waterfall Widget ─────────────────────────────────────
function LatencyWaterfallW({ services = [] }) {
  const colors = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#22c55e', '#f97316']
  const series = useMemo(() => services.map((s, i) => ({
    name: s, color: colors[i % colors.length],
    data: mockTimeSeries(24, 50 + i * 40, 30 + i * 10), unit: 'ms',
  })), [services])
  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <WidgetHeader icon={TrendUp} title="Latency" color="text-primary" actionLabel="View traces" />
      <div className="mt-auto"><MultiLineChart series={series} height={80} /></div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {series.map(s => (
          <div key={s.name} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-[8px] text-foreground-muted">{s.name}</span>
            <span className="text-[8px] text-foreground-disabled">p50: {s.data[s.data.length - 1]?.value.toFixed(0)}ms</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Throughput Widget ────────────────────────────────────────────
function ThroughputW({ label = 'Throughput' }) {
  const data = useMemo(() => mockTimeSeries(24, 5000, 2000, 50), [])
  const current = data[data.length - 1]?.value || 0
  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <WidgetHeader icon={ChartBar} title={label} color="text-primary" />
      <p className="text-heading-m font-semibold text-foreground mb-1">{(current / 1000).toFixed(1)}K<span className="text-[10px] text-foreground-muted font-normal"> req/min</span></p>
      <div className="mt-auto"><LineChart data={data} color="#0ea5e9" height={64} unit=" req/min" /></div>
    </div>
  )
}

// ─── DB Connections Widget ────────────────────────────────────────
function DbConnectionsW({ service = '' }) {
  const data = useMemo(() => mockTimeSeries(24, 24, 8), [])
  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <WidgetHeader icon={Database} title={`${service}`} color="text-green-400" />
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-body-l font-semibold text-foreground">{data[data.length - 1]?.value.toFixed(0)}</span>
        <span className="text-[10px] text-foreground-muted">/ 100 connections</span>
      </div>
      <div className="mt-auto"><LineChart data={data} color="#22c55e" height={64} unit=" conn" thresholdValue={80} thresholdLabel="Max 100" /></div>
    </div>
  )
}

// ─── Cache Hit Widget ─────────────────────────────────────────────
function CacheHitW({ label = 'Cache hit ratio' }) {
  const data = useMemo(() => mockTimeSeries(24, 92, 6), [])
  const current = data[data.length - 1]?.value || 0
  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <WidgetHeader icon={Lightning} title={label} color="text-yellow-400" />
      <p className="text-heading-m font-semibold text-foreground mb-1">{current.toFixed(1)}%</p>
      <div className="mt-auto"><LineChart data={data} color="#facc15" height={64} unit="%" thresholdValue={80} thresholdLabel="Target 80%" /></div>
    </div>
  )
}

// ─── Lambda Stats Widget ──────────────────────────────────────────
function LambdaStatsW({ service = '' }) {
  const durData = useMemo(() => mockTimeSeries(24, 142, 60), [])
  const errData = useMemo(() => mockTimeSeries(24, 0.3, 0.5), [])
  const items = useMemo(() => [
    { label: '6h', value: 120 + Math.random() * 40, unit: 'ms' },
    { label: '5h', value: 130 + Math.random() * 50, unit: 'ms' },
    { label: '4h', value: 110 + Math.random() * 60, unit: 'ms' },
    { label: '3h', value: 140 + Math.random() * 40, unit: 'ms' },
    { label: '2h', value: 150 + Math.random() * 30, unit: 'ms' },
    { label: '1h', value: 135 + Math.random() * 45, unit: 'ms' },
    { label: 'now', value: 142 + Math.random() * 30, unit: 'ms' },
  ], [])
  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <WidgetHeader icon={Lightning} title={service} color="text-amber-400" actionLabel="View function" />
      <div className="flex gap-4 mb-3">
        <div><p className="text-body-s font-semibold text-foreground">{durData[durData.length - 1]?.value.toFixed(0)}ms</p><p className="text-[8px] text-foreground-muted">p50 duration</p></div>
        <div><p className="text-body-s font-semibold text-foreground">{(durData[durData.length - 1]?.value * 2.5).toFixed(0)}ms</p><p className="text-[8px] text-foreground-muted">p99 duration</p></div>
        <div><p className="text-body-s font-semibold text-status-active">{errData[errData.length - 1]?.value.toFixed(2)}%</p><p className="text-[8px] text-foreground-muted">error rate</p></div>
      </div>
      <p className="text-[9px] text-foreground-disabled mb-1">Duration distribution (7h)</p>
      <div className="mt-auto"><BarChart items={items} height={64} color="#f59e0b" /></div>
    </div>
  )
}

// ─── DynamoDB Capacity Widget ─────────────────────────────────────
function DynamoCapacityW({ service = '' }) {
  const readData = useMemo(() => mockTimeSeries(24, 120, 40), [])
  const writeData = useMemo(() => mockTimeSeries(24, 80, 30), [])
  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <WidgetHeader icon={Database} title={`${service} capacity`} color="text-blue-400" />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-baseline gap-1 mb-1"><span className="text-body-s font-semibold text-foreground">{readData[readData.length - 1]?.value.toFixed(0)}</span><span className="text-[9px] text-foreground-muted">RCU</span></div>
          <div className="mt-auto"><LineChart data={readData} color="#60a5fa" height={64} unit=" RCU" /></div>
        </div>
        <div>
          <div className="flex items-baseline gap-1 mb-1"><span className="text-body-s font-semibold text-foreground">{writeData[writeData.length - 1]?.value.toFixed(0)}</span><span className="text-[9px] text-foreground-muted">WCU</span></div>
          <div className="mt-auto"><LineChart data={writeData} color="#818cf8" height={64} unit=" WCU" /></div>
        </div>
      </div>
    </div>
  )
}

// ─── Queue Depth Widget ───────────────────────────────────────────
function QueueDepthW({ service = '' }) {
  const data = useMemo(() => mockTimeSeries(24, 12, 15), [])
  const ageData = useMemo(() => mockTimeSeries(24, 2.4, 3), [])
  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <WidgetHeader icon={Package} title={`${service}`} color="text-orange-400" />
      <div className="flex gap-4 mb-2">
        <div><p className="text-body-s font-semibold text-foreground">{data[data.length - 1]?.value.toFixed(0)}</p><p className="text-[8px] text-foreground-muted">queue depth</p></div>
        <div><p className="text-body-s font-semibold text-foreground">{ageData[ageData.length - 1]?.value.toFixed(1)}s</p><p className="text-[8px] text-foreground-muted">oldest msg</p></div>
      </div>
      <div className="mt-auto"><LineChart data={data} color="#fb923c" height={64} unit=" msgs" thresholdValue={50} thresholdLabel="Alert > 50" /></div>
    </div>
  )
}

// ─── Resource Utilization Widget ──────────────────────────────────
function ResourceUtilW({ services = [], label = 'Resource utilization' }) {
  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <WidgetHeader icon={Cpu} title={label} color="text-cyan-400" />
      {services.map(s => {
        const cpu = Math.round(30 + Math.random() * 50)
        const mem = Math.round(35 + Math.random() * 45)
        return (
          <div key={s} className="mb-2.5 last:mb-0">
            <span className="text-[10px] text-foreground-muted">{s}</span>
            <div className="flex gap-3 mt-1">
              <div className="flex-1">
                <div className="flex justify-between text-[8px] text-foreground-disabled mb-0.5"><span>CPU</span><span className={cpu > 80 ? 'text-red-400' : ''}>{cpu}%</span></div>
                <div className="h-2 rounded-full bg-border-muted/30 overflow-hidden"><div className={`h-full rounded-full transition-all ${cpu > 80 ? 'bg-red-400' : 'bg-cyan-400/70'}`} style={{ width: `${cpu}%` }} /></div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-[8px] text-foreground-disabled mb-0.5"><span>Memory</span><span className={mem > 80 ? 'text-red-400' : ''}>{mem}%</span></div>
                <div className="h-2 rounded-full bg-border-muted/30 overflow-hidden"><div className={`h-full rounded-full transition-all ${mem > 80 ? 'bg-red-400' : 'bg-purple-400/70'}`} style={{ width: `${mem}%` }} /></div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Model Latency Widget ─────────────────────────────────────────
function ModelLatencyW({ label = 'Model latency' }) {
  const data = useMemo(() => mockTimeSeries(24, 120, 60), [])
  const p50 = data[data.length - 1]?.value || 0
  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <WidgetHeader icon={Gauge} title={label} color="text-pink-400" actionLabel="View model" />
      <div className="flex gap-4 mb-2">
        <div><p className="text-body-s font-semibold text-foreground">{p50.toFixed(0)}ms</p><p className="text-[8px] text-foreground-muted">p50</p></div>
        <div><p className="text-body-s font-semibold text-foreground">{(p50 * 2.2).toFixed(0)}ms</p><p className="text-[8px] text-foreground-muted">p95</p></div>
        <div><p className="text-body-s font-semibold text-foreground">{(p50 * 3.1).toFixed(0)}ms</p><p className="text-[8px] text-foreground-muted">p99</p></div>
      </div>
      <div className="mt-auto"><LineChart data={data} color="#ec4899" height={64} unit="ms" thresholdValue={300} thresholdLabel="SLA 300ms" /></div>
    </div>
  )
}

// ─── Stream / Consumer Lag Widget ─────────────────────────────────
function StreamLagW({ label = 'Stream lag' }) {
  const data = useMemo(() => mockTimeSeries(24, 1200, 800), [])
  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <WidgetHeader icon={Clock} title={label} color="text-orange-400" />
      <p className="text-heading-m font-semibold text-foreground mb-1">{(data[data.length - 1]?.value / 1000).toFixed(1)}s</p>
      <div className="mt-auto"><LineChart data={data} color="#fb923c" height={64} unit="ms" thresholdValue={5000} thresholdLabel="Alert > 5s" /></div>
    </div>
  )
}

function ConsumerLagW({ label = 'Consumer lag' }) {
  const data = useMemo(() => mockTimeSeries(24, 342, 200), [])
  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <WidgetHeader icon={Clock} title={label} color="text-amber-400" />
      <p className="text-heading-m font-semibold text-foreground mb-1">{data[data.length - 1]?.value.toFixed(0)}<span className="text-[10px] text-foreground-muted font-normal"> msgs behind</span></p>
      <div className="mt-auto"><LineChart data={data} color="#f59e0b" height={64} unit=" msgs" thresholdValue={1000} thresholdLabel="Alert > 1K" /></div>
    </div>
  )
}

// ─── Top Errors Widget ────────────────────────────────────────────
function TopErrorsW({ services = [] }) {
  const errors = [
    { time: '2 min ago', svc: services[0] || 'service', msg: 'ConnectionTimeout: upstream failed to respond within 30s', count: 12 },
    { time: '8 min ago', svc: services[1] || services[0] || 'service', msg: 'ValidationError: missing required field "account_id"', count: 5 },
    { time: '14 min ago', svc: services[0] || 'service', msg: 'RateLimitExceeded: too many requests from 10.0.3.42', count: 3 },
    { time: '22 min ago', svc: services[2] || services[0] || 'service', msg: 'DatabaseError: deadlock detected on table "transactions"', count: 1 },
  ]
  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <WidgetHeader icon={Warning} title="Recent Errors" color="text-red-400" actionLabel="View logs" />
      {errors.map((e, i) => (
        <div key={i} className="py-2 border-b border-border-muted/20 last:border-0 hover:bg-primary/5 rounded px-1 -mx-1 cursor-pointer transition-colors">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-foreground-disabled">{e.time}</span>
              <span className="text-[9px] text-primary">{e.svc}</span>
            </div>
            <span className="text-[9px] text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">{e.count}×</span>
          </div>
          <p className="text-[10px] text-foreground-muted truncate">{e.msg}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Widget Renderer ──────────────────────────────────────────────
const WIDGETS = {
  'alarms': AlarmsW, 'error-rate': ErrorRateW, 'latency-waterfall': LatencyWaterfallW,
  'throughput': ThroughputW, 'db-connections': DbConnectionsW, 'cache-hit': CacheHitW,
  'lambda-stats': LambdaStatsW, 'dynamo-capacity': DynamoCapacityW, 'queue-depth': QueueDepthW,
  'resource-util': ResourceUtilW, 'model-latency': ModelLatencyW, 'stream-lag': StreamLagW,
  'consumer-lag': ConsumerLagW, 'top-errors': TopErrorsW,
}

function AppSection({ app }) {
  const [expanded, setExpanded] = useState(true)
  const alarmed = app.services.filter(s => s.hasAlarms).length
  const logged = app.services.filter(s => s.hasLogs).length
  const traced = app.services.filter(s => s.hasTraces).length

  return (
    <div className="mb-2">
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-3 w-full text-left py-3 border-b border-border-muted/20 hover:bg-primary/5 rounded px-2 -mx-2 transition-colors">
        {expanded ? <CaretDown size={14} className="text-foreground-muted" /> : <CaretRight size={14} className="text-foreground-muted" />}
        <h2 className="text-body-m font-semibold text-foreground">{app.name}</h2>
        <span className="text-[10px] text-foreground-disabled">{app.services.length} services</span>
        <span className="flex-1" />
        <div className="flex items-center gap-4 text-[10px]">
          <span className={alarmed > 0 ? 'text-status-active' : 'text-foreground-disabled'}><Bell size={10} className="inline mr-0.5" />{alarmed}/{app.services.length}</span>
          <span className={logged > 0 ? 'text-green-400' : 'text-foreground-disabled'}><FileText size={10} className="inline mr-0.5" />{logged}/{app.services.length}</span>
          <span className={traced > 0 ? 'text-orange-400' : 'text-foreground-disabled'}><Path size={10} className="inline mr-0.5" />{traced}/{app.services.length}</span>
        </div>
      </button>

      {expanded && (
        <div className="grid grid-cols-4 gap-3 pt-4 pb-2">
          {(app.widgets || []).map((w, i) => {
            const Comp = WIDGETS[w.type]
            if (!Comp) return null
            return (
              <div key={i} className={`${w.span === 2 ? 'col-span-2' : ''}`}>
                <Comp {...w} services={w.services || app.services} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Compute contextual attention items ───────────────────────────
function computeAttention(services, appName, personaAttention = []) {
  const items = []
  const noAlarms = services.filter(s => !s.hasAlarms)
  const noLogs = services.filter(s => !s.hasLogs)
  const noTraces = services.filter(s => !s.hasTraces)

  if (noAlarms.length > 0) {
    items.push({ id: `att-alarms-${appName}`, severity: 'critical', category: 'coverage', title: `${noAlarms.length} service${noAlarms.length > 1 ? 's' : ''} with no alarms`, description: `${noAlarms.map(s => s.name).slice(0, 3).join(', ')}${noAlarms.length > 3 ? ` and ${noAlarms.length - 3} more` : ''} have no CloudWatch alarms.`, app: appName, time: 'Detected just now' })
  }
  if (noTraces.length > 0) {
    items.push({ id: `att-traces-${appName}`, severity: 'high', category: 'coverage', title: `No tracing on ${noTraces.length} service${noTraces.length > 1 ? 's' : ''}`, description: `X-Ray is not enabled. No visibility into request flows.`, app: appName, time: 'Detected just now' })
  }
  if (noLogs.length > 0) {
    items.push({ id: `att-logs-${appName}`, severity: 'high', category: 'coverage', title: `${noLogs.length} service${noLogs.length > 1 ? 's' : ''} missing logs`, description: `${noLogs.map(s => s.name).slice(0, 3).join(', ')}${noLogs.length > 3 ? ` and ${noLogs.length - 3} more` : ''} not sending logs.`, app: appName, time: 'Detected just now' })
  }

  // Add persona-specific non-coverage items (insights, alarms, compliance, cost)
  const filtered = personaAttention.filter(a => {
    if (a.category === 'coverage') return false // we computed these above
    if (appName === 'All') return true
    return a.app === appName || a.app === 'All'
  })
  items.push(...filtered)

  // Sort by severity — critical first
  const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  return [...items].sort((a, b) => (sevOrder[a.severity] ?? 3) - (sevOrder[b.severity] ?? 3))
}

// ─── Needs Your Attention Feed ────────────────────────────────────
function AttentionFeed({ items, onInvestigate, services }) {
  const sevColors = { critical: 'bg-red-500', high: 'bg-status-degraded', medium: 'bg-primary', low: 'bg-foreground-muted' }
  const catLabels = { alarm: 'ALARM', coverage: 'COVERAGE', insight: 'INSIGHT', compliance: 'COMPLIANCE', cost: 'COST' }
  const catColors = { alarm: 'text-red-400 bg-red-400/10', coverage: 'text-status-degraded bg-status-degraded/10', insight: 'text-primary bg-primary/10', compliance: 'text-purple-400 bg-purple-400/10', cost: 'text-status-active bg-status-active/10' }

  if (!items || items.length === 0) return null
  return (
    <div className="glass-card p-4 flex flex-col col-span-2 overflow-hidden min-w-0" style={{ maxHeight: 280 }}>
      <WidgetHeader icon={Bell} title="Needs your attention" color="text-red-400" actionLabel={`${items.length} issues`} />
      <div className="flex flex-col flex-1 overflow-y-auto -mr-2 pr-2">
        {items.slice(0, 8).map((item) => (
          <div key={item.id} className="flex gap-2 py-2 border-b border-border-muted/20 last:border-0 hover:bg-primary/5 rounded px-1.5 -mx-1.5 cursor-pointer transition-colors" onClick={() => {
            const typeMap = { alarm: 'alarms', coverage: item.title.includes('alarm') ? 'alarms' : item.title.includes('log') ? 'enable-logs' : item.title.includes('trac') ? 'enable-tracing' : 'alarms', insight: 'insight', compliance: 'alarms', cost: item.title.includes('log') ? 'optimize-logs' : item.title.includes('stale') ? 'cleanup-stale' : 'alarms' }
            onInvestigate && onInvestigate(typeMap[item.category] || 'alarms', { appName: item.app, services })
          }}>
            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${sevColors[item.severity]}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-[7px] px-1 py-0 rounded font-medium ${catColors[item.category]}`}>{catLabels[item.category]}</span>
                <span className="text-[10px] font-medium text-foreground truncate">{item.title}</span>
              </div>
              <p className="text-[9px] text-foreground-muted truncate">{item.description}</p>
            </div>
            <span className="text-[8px] text-foreground-disabled flex-shrink-0 mt-0.5">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Service Map Widget ───────────────────────────────────────────
function ServiceMapW({ mapData, onEnableTracing }) {
  const allUnknown = mapData && mapData.nodes.every(n => n.status === 'unknown')

  if (!mapData) return (
    <div className="glass-card p-4 h-full flex flex-col col-span-2">
      <WidgetHeader icon={Globe} title="Service Map" color="text-primary" />
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <Globe size={24} className="text-foreground-disabled" />
        <p className="text-[10px] text-foreground-disabled">Enable tracing to see service dependencies</p>
        <button onClick={onEnableTracing} className="text-[10px] text-primary hover:text-primary-hover flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors">
          <Path size={12} /> Enable tracing →
        </button>
      </div>
    </div>
  )

  const statusColors = { healthy: '#22c55e', warning: '#f59e0b', critical: '#ef4444', unknown: '#475569' }

  return (
    <div className="glass-card p-4 h-full flex flex-col col-span-2">
      <WidgetHeader icon={Globe} title="Service Map" color="text-primary" actionLabel="Full map" />
      <div className="flex-1 relative" style={{ minHeight: 160 }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
          {mapData.edges.map((e, i) => {
            const from = mapData.nodes.find(n => n.id === e.from)
            const to = mapData.nodes.find(n => n.id === e.to)
            if (!from || !to) return null
            return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="rgba(51,65,85,0.4)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
          })}
        </svg>
        {mapData.nodes.map(node => (
          <div key={node.id} className="absolute flex flex-col items-center" style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}>
            <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center bg-background/80 backdrop-blur-sm" style={{ borderColor: statusColors[node.status] }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[node.status] }} />
            </div>
            <span className="text-[7px] text-foreground-muted mt-1 whitespace-nowrap">{node.label}</span>
            <span className="text-[6px] text-foreground-disabled">{node.type}</span>
          </div>
        ))}
        {allUnknown && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-2 pointer-events-none">
            <div className="pointer-events-auto flex flex-col items-center gap-1 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2">
              <p className="text-[9px] text-foreground-disabled">Health status unavailable — tracing not enabled</p>
              <button onClick={onEnableTracing} className="text-[9px] text-primary hover:text-primary-hover flex items-center gap-1">
                <Path size={10} /> Enable tracing →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── CW Agent Coverage Widget ─────────────────────────────────────
function CWAgentWidget({ cwAgent, onInstall }) {
  if (!cwAgent) return null
  const { installed, notInstalled, summary } = cwAgent
  const total = summary.total
  const installedCount = installed.length

  return (
    <div className="glass-card p-4 h-full flex flex-col col-span-2">
      <WidgetHeader icon={Cpu} title="CloudWatch Agent" color="text-cyan-400" actionLabel={installedCount === 0 ? '' : `${installedCount} installed`} />
      {total === 0 ? (
        <div className="flex-1 flex items-center justify-center"><p className="text-[10px] text-foreground-disabled">No compute resources detected</p></div>
      ) : (
        <>
          <div className="flex gap-3 mb-3">
            {summary.ecs > 0 && (
              <div className="flex-1 rounded-lg bg-background/30 border border-border-muted/20 p-2.5">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[9px] text-foreground-muted">ECS Fargate</span>
                  <span className="text-[8px] text-foreground-disabled">0% coverage</span>
                </div>
                <div className="h-1.5 rounded-full bg-border-muted/30 overflow-hidden mb-1.5"><div className="h-full rounded-full bg-cyan-400/60" style={{ width: '0%' }} /></div>
                <div className="flex justify-between text-[8px]">
                  <span className="text-foreground-muted">0/{summary.ecs} services</span>
                  <span className="text-foreground-disabled">0/{notInstalled.filter(s => s.type === 'ECS Fargate').reduce((sum, s) => sum + (s.tasks || 0), 0)} instances</span>
                </div>
              </div>
            )}
            {summary.eks > 0 && (
              <div className="flex-1 rounded-lg bg-background/30 border border-border-muted/20 p-2.5">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[9px] text-foreground-muted">EKS</span>
                  <span className="text-[8px] text-foreground-disabled">0% coverage</span>
                </div>
                <div className="h-1.5 rounded-full bg-border-muted/30 overflow-hidden mb-1.5"><div className="h-full rounded-full bg-cyan-400/60" style={{ width: '0%' }} /></div>
                <div className="flex justify-between text-[8px]">
                  <span className="text-foreground-muted">0/{summary.eks} clusters</span>
                  <span className="text-foreground-disabled">0/{notInstalled.filter(s => s.type === 'EKS').reduce((sum, s) => sum + (s.pods || 0), 0)} pods</span>
                </div>
              </div>
            )}
            {summary.ec2 > 0 && (
              <div className="flex-1 rounded-lg bg-background/30 border border-border-muted/20 p-2.5">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[9px] text-foreground-muted">EC2</span>
                  <span className="text-[8px] text-foreground-disabled">0% coverage</span>
                </div>
                <div className="h-1.5 rounded-full bg-border-muted/30 overflow-hidden mb-1.5"><div className="h-full rounded-full bg-cyan-400/60" style={{ width: '0%' }} /></div>
                <div className="flex justify-between text-[8px]">
                  <span className="text-foreground-muted">0/{summary.ec2} instances</span>
                </div>
              </div>
            )}
          </div>
          <p className="text-[10px] text-foreground-muted mb-2">Without the CW Agent, you're missing memory, disk, and custom metrics on {total} compute resources.</p>
          <button onClick={onInstall} className="text-[10px] text-primary hover:text-primary-hover flex items-center gap-1 self-start px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors">
            <Cpu size={12} /> Install CW Agent →
          </button>
        </>
      )}
    </div>
  )
}

// ─── IaC Export Modal ──────────────────────────────────────────────
function IaCExportModal({ onClose, title, subtitle }) {
  const [format, setFormat] = useState('cloudformation')
  const [showShare, setShowShare] = useState(false)
  const [shareMethod, setShareMethod] = useState('slack')
  const [shareDestination, setShareDestination] = useState('')
  const [shareMessage, setShareMessage] = useState('Here\'s the CloudWatch config I\'d like to deploy. Please review and approve.')
  const formats = [{ id: 'cloudformation', label: 'CloudFormation' }, { id: 'terraform', label: 'Terraform' }, { id: 'json', label: 'JSON' }]
  const shareMethods = [{ id: 'slack', label: 'Slack', placeholder: '#ops-team or @admin', icon: '💬' }, { id: 'email', label: 'Email', placeholder: 'admin@company.com', icon: '✉️' }, { id: 'jira', label: 'Jira', placeholder: 'OPS-123', icon: '🎫' }]

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-[640px] max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-border-muted">
          <div><h2 className="text-body-m font-semibold text-foreground">Export as Code</h2><p className="text-[11px] text-foreground-muted">{title} · {subtitle}</p></div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-background-surface-2 text-foreground-muted"><X size={16} /></button>
        </div>
        <div className="flex gap-2 px-4 pt-3">
          {formats.map(f => <button key={f.id} onClick={() => setFormat(f.id)} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${format === f.id ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-background-surface-1 text-foreground-muted border border-border-muted hover:border-primary/20'}`}>{f.label}</button>)}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <pre className="text-[10px] text-foreground-muted bg-background/60 rounded-lg p-4 border border-border-muted/30 overflow-x-auto leading-relaxed">
            {format === 'cloudformation' && `AWSTemplateFormatVersion: '2010-09-09'\nDescription: ${title}\n  Generated by CloudWatch Omni Agent\n\nResources:\n  # Selected items will be included here\n  # Full template generated on export`}
            {format === 'terraform' && `# ${title}\n# Generated by CloudWatch Omni Agent\n\n# Selected items will be included here\n# Full template generated on export`}
            {format === 'json' && JSON.stringify({ description: title, generatedBy: 'CloudWatch Omni Agent', resources: '...' }, null, 2)}
          </pre>
        </div>
        <div className="p-4 border-t border-border-muted">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-foreground-disabled">Preview only</span>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg bg-background-surface-1 border border-border-muted text-body-s text-foreground hover:bg-background-surface-2 transition-colors">Copy</button>
              <button className="px-4 py-2 rounded-lg bg-background-surface-1 border border-border-muted text-body-s text-foreground hover:bg-background-surface-2 transition-colors flex items-center gap-1.5"><Download size={14} /> Download</button>
              <button onClick={() => setShowShare(!showShare)} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-body-s font-medium transition-colors">Share</button>
            </div>
          </div>
          {showShare && (
            <div className="mt-4 pt-4 border-t border-border-muted/30">
              <div className="flex gap-2 mb-3">{shareMethods.map(m => <button key={m.id} onClick={() => setShareMethod(m.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-colors ${shareMethod === m.id ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-background-surface-1 text-foreground-muted border border-border-muted hover:border-primary/20'}`}>{m.icon} {m.label}</button>)}</div>
              <input type="text" value={shareDestination} onChange={(e) => setShareDestination(e.target.value)} placeholder={shareMethods.find(m => m.id === shareMethod)?.placeholder} className="w-full h-9 rounded-lg bg-background-surface-1 border border-border-muted px-3 text-[12px] text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-primary/40 mb-2" />
              <textarea value={shareMessage} onChange={(e) => setShareMessage(e.target.value)} rows={2} className="w-full rounded-lg bg-background-surface-1 border border-border-muted px-3 py-2 text-[11px] text-foreground focus:outline-none focus:border-primary/40 resize-none mb-3" />
              <button className="w-full px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-[11px] font-medium">Send via {shareMethods.find(m => m.id === shareMethod)?.label}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── All Overview (aggregated cross-app view) ─────────────────────
function AllOverview({ applications, onInvestigate, attention, serviceMaps, onEnableTracing, cwAgent, onInstallAgent }) {
  const allServices = applications.flatMap(a => a.services)
  const withAlarms = allServices.filter(s => s.hasAlarms).length
  const withLogs = allServices.filter(s => s.hasLogs).length
  const withTraces = allServices.filter(s => s.hasTraces).length
  const total = allServices.length

  const inv = (type, extra = {}) => () => onInvestigate(type, { appName: 'All applications', total, alarmed: withAlarms, ...extra })

  return (
    <div className="grid grid-cols-4 gap-3">
      {/* 1. Needs your attention + Service map */}
      <AttentionFeed items={computeAttention(allServices, 'All', attention)} onInvestigate={onInvestigate} services={allServices} />
      <ServiceMapW mapData={null} onEnableTracing={onEnableTracing} />

      {/* 2. CW Agent coverage + Alarms */}
      <CWAgentWidget cwAgent={cwAgent} onInstall={onInstallAgent} />
      <div className="relative group"><AlarmsW services={allServices} /><button onClick={inv('alarms')} className="absolute top-3 right-3 flex items-center gap-1 text-[9px] text-primary bg-background-surface-2/90 border border-border-muted rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"><MagnifyingGlass size={10} /> Investigate</button></div>

      {/* 3. Error rate + Latency */}
      <div className="relative group"><ErrorRateW services={applications.map(a => a.name)} /><button onClick={inv('error-rate')} className="absolute top-3 right-3 flex items-center gap-1 text-[9px] text-primary bg-background-surface-2/90 border border-border-muted rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"><MagnifyingGlass size={10} /> Investigate</button></div>
      <div className="relative group col-span-2"><LatencyWaterfallW services={applications.map(a => a.name)} /><button onClick={inv('latency-waterfall')} className="absolute top-3 right-3 flex items-center gap-1 text-[9px] text-primary bg-background-surface-2/90 border border-border-muted rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"><MagnifyingGlass size={10} /> Investigate</button></div>

      {/* 4. Top errors + Throughput */}
      <div className="relative group"><TopErrorsW services={applications.flatMap(a => a.services.slice(0, 1).map(s => s.name))} /><button onClick={inv('top-errors')} className="absolute top-3 right-3 flex items-center gap-1 text-[9px] text-primary bg-background-surface-2/90 border border-border-muted rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"><MagnifyingGlass size={10} /> Investigate</button></div>
      <div className="relative group"><ThroughputW label="Total throughput" /><button onClick={inv('throughput', { label: 'Total throughput' })} className="absolute top-3 right-3 flex items-center gap-1 text-[9px] text-primary bg-background-surface-2/90 border border-border-muted rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"><MagnifyingGlass size={10} /> Investigate</button></div>

      {/* 5. Observability posture + Application health */}
      <div className="glass-card p-4 h-full flex flex-col">
        <WidgetHeader icon={Globe} title="Observability Posture" color="text-primary" />
        <div className="flex flex-col gap-2.5 mt-auto">
          <div><div className="flex justify-between text-[9px] text-foreground-disabled mb-0.5"><span>Alarms</span><span>{withAlarms}/{total}</span></div><div className="h-2 rounded-full bg-border-muted/30 overflow-hidden"><div className="h-full rounded-full bg-status-degraded" style={{ width: `${total > 0 ? (withAlarms / total) * 100 : 0}%` }} /></div></div>
          <div><div className="flex justify-between text-[9px] text-foreground-disabled mb-0.5"><span>Logs</span><span>{withLogs}/{total}</span></div><div className="h-2 rounded-full bg-border-muted/30 overflow-hidden"><div className="h-full rounded-full bg-green-400" style={{ width: `${total > 0 ? (withLogs / total) * 100 : 0}%` }} /></div></div>
          <div><div className="flex justify-between text-[9px] text-foreground-disabled mb-0.5"><span>Traces</span><span>{withTraces}/{total}</span></div><div className="h-2 rounded-full bg-border-muted/30 overflow-hidden"><div className="h-full rounded-full bg-purple-400" style={{ width: `${total > 0 ? (withTraces / total) * 100 : 0}%` }} /></div></div>
        </div>
      </div>

      <div className="glass-card p-4 h-full flex flex-col col-span-2">
        <WidgetHeader icon={ChartBar} title="Application Health" color="text-primary" />
        <div className="flex flex-col gap-2 mt-auto">
          {applications.map(app => {
            const svcCount = app.services.length
            const alarmed = app.services.filter(s => s.hasAlarms).length
            const logged = app.services.filter(s => s.hasLogs).length
            return (
              <div key={app.id} className="flex items-center gap-3 py-1">
                <span className="text-[10px] text-foreground w-32 truncate">{app.name}</span>
                <div className="flex-1 flex gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-border-muted/30 overflow-hidden"><div className="h-full rounded-full bg-status-degraded/70" style={{ width: `${(alarmed / svcCount) * 100}%` }} /></div>
                  <div className="flex-1 h-1.5 rounded-full bg-border-muted/30 overflow-hidden"><div className="h-full rounded-full bg-green-400/70" style={{ width: `${(logged / svcCount) * 100}%` }} /></div>
                </div>
                <span className="text-[9px] text-foreground-disabled w-16 text-right">{svcCount} services</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────
export default function Day0Page() {
  const [input, setInput] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [drawerInvestigation, setDrawerInvestigation] = useState(null)
  const [showIaCModal, setShowIaCModal] = useState(false)
  const navigate = useNavigate()
  const { persona } = usePersona()
  const { user, applications, gaps, cost, attention, serviceMaps, cwAgent } = persona

  const firstName = user.name.split(' ')[0]
  const allServices = applications.flatMap(a => a.services)
  const total = allServices.length
  const isGreenfield = allServices.filter(s => s.hasAlarms).length === 0

  const activeApp = activeTab !== 'all' ? applications.find(a => a.id === activeTab) : null

  const openInvestigation = (widgetType, context) => {
    setDrawerInvestigation(getInvestigation(widgetType, context))
  }

  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-heading-xl font-normal tracking-tighter text-foreground">{isGreenfield ? `Welcome, ${firstName}` : 'Home'}</h1>
          <p className="text-body-s text-foreground-muted mt-0.5">{total} services · {applications.length} applications</p>
        </div>
        <div className="flex items-center gap-2"><Sparkle size={14} className="text-primary" weight="fill" /><span className="text-[11px] text-primary font-medium">Agent active</span></div>
      </div>

      {/* Chat */}
      <div className="max-w-3xl mb-6">
        <div className="relative">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your services, metrics, or alarms..." className="w-full h-11 rounded-xl bg-background-surface-1 border border-border-muted px-4 pr-12 text-body-s text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-primary/40 transition-colors" />
          <button className="absolute right-2 top-1.5 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"><PaperPlaneRight size={14} /></button>
        </div>
      </div>

      {/* Top row */}
      <div className={`grid ${!isGreenfield && persona.activeAlarms ? 'grid-cols-3' : 'grid-cols-[1fr_300px]'} gap-4 mb-6 items-start`}>
        {isGreenfield ? (
          <button onClick={() => navigate('/gaps')} className="ai-glass-card p-5 text-left hover:border-primary/40 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary flex-shrink-0"><Rocket size={20} /></div>
              <div>
                <h2 className="text-body-m font-semibold text-foreground">Get started</h2>
                <p className="text-[11px] text-foreground-muted mt-1">I found {total} services with no monitoring. Set up alarms, logs, tracing, and dashboards.</p>
                <span className="text-[10px] text-primary mt-2 inline-flex items-center gap-1">Set up monitoring <ArrowRight size={10} /></span>
              </div>
            </div>
          </button>
        ) : (
          <button onClick={() => navigate('/gaps')} className="ai-glass-card p-5 text-left hover:border-primary/40 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-status-degraded/20 flex items-center justify-center text-status-degraded flex-shrink-0"><Warning size={20} /></div>
              <div>
                <h2 className="text-body-m font-semibold text-foreground">{gaps.length} observability gaps found</h2>
                <p className="text-[11px] text-foreground-muted mt-1">{gaps.filter(g => g.severity === 'critical').length} critical. Select what to fix and export as code.</p>
                <span className="text-[10px] text-primary mt-2 inline-flex items-center gap-1">View gap analysis <ArrowRight size={10} /></span>
              </div>
            </div>
          </button>
        )}
        {/* Monitor widget — only for personas with active monitoring */}
        {!isGreenfield && persona.activeAlarms && (() => {
          const alarms = persona.activeAlarms
          const alarming = alarms.filter(a => a.state === 'ALARM')
          const slosData = persona.slos || []
          const sloAtRisk = slosData.filter(s => s.status === 'at-risk')
          const sloTotal = slosData.length
          const overallOk = alarming.length === 0 && sloAtRisk.length === 0
          const topAlarm = alarming.sort((a, b) => ({ critical: 0, high: 1, medium: 2, low: 3 }[a.severity] ?? 3) - ({ critical: 0, high: 1, medium: 2, low: 3 }[b.severity] ?? 3))[0]

          return (
            <button onClick={() => navigate('/monitor')} className="glass-card p-4 text-left hover:border-primary/30 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${overallOk ? 'bg-green-400' : alarming.length > 0 ? 'bg-red-400' : 'bg-orange-400'}`} style={!overallOk ? { animation: 'pulse 2s ease-in-out infinite' } : undefined} />
                <span className="text-body-s font-semibold text-foreground">{overallOk ? 'All Clear' : 'System Health'}</span>
                <span className="flex-1" />
                <span className="text-[10px] text-primary inline-flex items-center gap-1">Monitor <ArrowRight size={10} /></span>
              </div>

              <div className="flex gap-3 mb-2">
                <div><p className={`text-heading-m font-semibold ${alarming.length > 0 ? 'text-red-400' : 'text-green-400'}`}>{alarming.length}</p><p className="text-[8px] text-foreground-muted">Active alarms</p></div>
                <div><p className={`text-heading-m font-semibold ${sloAtRisk.length > 0 ? 'text-orange-400' : 'text-green-400'}`}>{sloTotal - sloAtRisk.length}/{sloTotal}</p><p className="text-[8px] text-foreground-muted">SLOs on target</p></div>
              </div>

              {topAlarm && (
                <p className="text-[9px] text-foreground-muted truncate">⚠ {topAlarm.name}: {topAlarm.value}</p>
              )}
              {sloAtRisk.length > 0 && (
                <p className="text-[9px] text-foreground-muted truncate">⚠ {sloAtRisk[0].name} burning {sloAtRisk[0].burnRate}×</p>
              )}
            </button>
          )
        })()}
        <div className="glass-card p-4">
          <span className="text-body-s font-semibold text-foreground">CloudWatch Cost</span>
          <p className="text-heading-m font-semibold text-foreground mt-1 mb-2">${cost.current.total.toLocaleString()}<span className="text-[11px] text-foreground-muted font-normal">/mo</span></p>
          {cost.current.breakdown.slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-center justify-between py-0.5"><span className="text-[10px] text-foreground-muted">{item.category}</span><span className="text-[10px] text-foreground">${item.amount.toLocaleString()}</span></div>
          ))}
          {cost.savings?.length > 0 && <p className="text-[9px] text-status-active mt-2">Potential savings: ${cost.savings.reduce((s, x) => s + x.amount, 0).toLocaleString()}/mo</p>}
        </div>
      </div>

      {/* Application tabs */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setActiveTab('all')} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${activeTab === 'all' ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-background-surface-1 text-foreground-muted border border-border-muted hover:border-primary/20'}`}>
          All ({total})
        </button>
        {applications.map(app => (
          <button key={app.id} onClick={() => setActiveTab(app.id)} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${activeTab === app.id ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-background-surface-1 text-foreground-muted border border-border-muted hover:border-primary/20'}`}>
            {app.name} ({app.services.length})
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'all' ? (
        <AllOverview applications={applications} onInvestigate={openInvestigation} attention={attention} serviceMaps={serviceMaps} onEnableTracing={() => openInvestigation('enable-tracing', { appName: 'All applications', services: allServices })} cwAgent={cwAgent} onInstallAgent={() => openInvestigation('install-cw-agent', { appName: 'All applications', cwAgent })} />
      ) : activeApp ? (
        <div className="grid grid-cols-4 gap-3">
          {/* Attention + Service Map at top */}
          <AttentionFeed items={computeAttention(activeApp.services, activeApp.name, attention)} onInvestigate={openInvestigation} services={activeApp.services} />
          <ServiceMapW mapData={serviceMaps?.[activeApp.id]} onEnableTracing={() => openInvestigation('enable-tracing', { appName: activeApp.name, services: activeApp.services })} />

          {/* CW Agent — filtered to this app's compute services */}
          {(() => {
            const appTag = activeApp.tag?.split(':')[1]
            const appAgentItems = cwAgent?.notInstalled?.filter(s => s.tags?.Application === appTag) || []
            if (appAgentItems.length === 0) return null
            const appCwAgent = { installed: [], notInstalled: appAgentItems, summary: { ecs: appAgentItems.filter(s => s.type === 'ECS Fargate').length, eks: appAgentItems.filter(s => s.type === 'EKS').length, ec2: 0, total: appAgentItems.length } }
            return <CWAgentWidget cwAgent={appCwAgent} onInstall={() => openInvestigation('install-cw-agent', { appName: activeApp.name, cwAgent: appCwAgent })} />
          })()}

          {(activeApp.widgets || []).map((w, i) => {
            const Comp = WIDGETS[w.type]
            if (!Comp) return null
            return (
              <div key={i} className={`${w.span === 2 ? 'col-span-2' : ''} relative group`}>
                <Comp {...w} services={w.services || activeApp.services} />
                <button onClick={() => openInvestigation(w.type, { appName: activeApp.name, total: activeApp.services.length, alarmed: activeApp.services.filter(s => s.hasAlarms).length, ...w })} className="absolute top-3 right-3 flex items-center gap-1 text-[9px] text-primary bg-background-surface-2/90 border border-border-muted rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10">
                  <MagnifyingGlass size={10} /> Investigate
                </button>
              </div>
            )
          })}
        </div>
      ) : null}

      {/* Agent Drawer */}
      {drawerInvestigation && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDrawerInvestigation(null)} />
          <AgentDrawer investigation={drawerInvestigation} onClose={() => setDrawerInvestigation(null)} onExportCode={() => setShowIaCModal(true)} />
        </>
      )}

      {/* IaC Modal */}
      {showIaCModal && (
        <IaCExportModal onClose={() => setShowIaCModal(false)} title={drawerInvestigation?.title || 'Export'} subtitle={drawerInvestigation?.subtitle || ''} />
      )}
    </div>
  )
}
