import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PaperPlaneRight, Bell, ChartBar, Sparkle, ArrowRight,
  Rocket, Warning, TrendUp, Path, FileText, Gauge,
  WaveTriangle, CaretDown, CaretRight, Database,
  Lightning, Globe, Cpu, Clock, Package, ArrowSquareOut,
} from '@phosphor-icons/react'
import { usePersona } from '../data/persona'
import { LineChart, MultiLineChart, BarChart, mockTimeSeries } from '../components/Chart'

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

function WidgetHeader({ icon: Icon, title, color, action, actionLabel = 'View all' }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-1.5">
        <Icon size={14} className={color} />
        <span className="text-[11px] font-medium text-foreground">{title}</span>
      </div>
      {action && (
        <button onClick={action} className="flex items-center gap-0.5 text-[9px] text-primary hover:text-primary-hover">
          {actionLabel} <ArrowSquareOut size={9} />
        </button>
      )}
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

// ─── Main Page ────────────────────────────────────────────────────
export default function Day0Page() {
  const [input, setInput] = useState('')
  const navigate = useNavigate()
  const { persona } = usePersona()
  const { user, applications, gaps, cost } = persona

  const firstName = user.name.split(' ')[0]
  const allServices = applications.flatMap(a => a.services)
  const total = allServices.length
  const isGreenfield = allServices.filter(s => s.hasAlarms).length === 0

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
      <div className="grid grid-cols-[1fr_300px] gap-4 mb-8">
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
        <div className="glass-card p-4">
          <span className="text-body-s font-semibold text-foreground">CloudWatch Cost</span>
          <p className="text-heading-m font-semibold text-foreground mt-1 mb-2">${cost.current.total.toLocaleString()}<span className="text-[11px] text-foreground-muted font-normal">/mo</span></p>
          {cost.current.breakdown.slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-center justify-between py-0.5"><span className="text-[10px] text-foreground-muted">{item.category}</span><span className="text-[10px] text-foreground">${item.amount.toLocaleString()}</span></div>
          ))}
          {cost.savings?.length > 0 && <p className="text-[9px] text-status-active mt-2">Potential savings: ${cost.savings.reduce((s, x) => s + x.amount, 0).toLocaleString()}/mo</p>}
        </div>
      </div>

      {/* Application sections */}
      {applications.map(app => <AppSection key={app.id} app={app} />)}
    </div>
  )
}
