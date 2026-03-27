import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PaperPlaneRight, ShieldCheck, ChartBar, Crosshair, Link as LinkIcon,
  Lightning, Bell, Clock, Sparkle, Robot, ArrowRight, Play,
  WaveTriangle, Cpu, FileText, Path, Package,
  Broadcast, Target, SignOut, CheckCircle,
  Archive, CaretDown, CaretUp, CaretRight, Info,
  CircleNotch, PushPin,
} from '@phosphor-icons/react'
import { persona } from '../data/persona'

const tierIcons = {
  bell: Bell, chart: ChartBar, wave: WaveTriangle, archive: Archive,
  cpu: Cpu, file: FileText, path: Path, container: Package,
  signal: Broadcast, target: Crosshair, route: SignOut, link: LinkIcon,
}

const simConfig = {
  't1-alarms': { steps: 42, label: (n, t) => `Creating alarm ${n} of ${t}...`, done: '42 alarms created' },
  't1-dashboard': { steps: 4, label: (n, t) => `Adding widget ${n} of ${t}...`, done: 'Dashboard created' },
  't1-anomaly': { steps: 5, label: (n, t) => `Configuring detector ${n} of ${t}...`, done: 'Anomaly detection enabled' },
  't1-logclass': { steps: 2, label: (n, t) => `Updating log group ${n} of ${t}...`, done: 'Log classes optimized' },
  't2-cw-agent': { steps: 6, label: (n, t) => `Deploying to service ${n} of ${t}...`, done: 'Agent deployed to 6 services' },
  't2-logs': { steps: 6, label: (n, t) => `Enabling logs on ${n} of ${t} services...`, done: 'Logging enabled on 14 services' },
  't2-traces': { steps: 3, label: (n, t) => `Enabling tracing on ${n} of ${t}...`, done: 'X-Ray tracing enabled' },
  't2-container-insights': { steps: 3, label: (n, t) => `Updating cluster ${n} of ${t}...`, done: 'Container Insights enabled' },
  't2-app-signals': { steps: 3, label: (n, t) => `Configuring ${n} of ${t}...`, done: 'Application Signals enabled' },
}

// Auto-pinned widgets (always show when done)
const AUTO_PIN = new Set(['t1-alarms', 't1-dashboard', 't2-logs', 't2-traces'])

function useSimulation() {
  const [states, setStates] = useState({})
  const [progress, setProgress] = useState({})
  const timers = useRef({})
  const run = useCallback((id) => {
    const config = simConfig[id]
    if (!config) return
    setStates(s => ({ ...s, [id]: 'running' }))
    setProgress(p => ({ ...p, [id]: 0 }))
    let step = 0
    timers.current[id] = setInterval(() => {
      step++
      if (step >= config.steps) {
        clearInterval(timers.current[id])
        setStates(s => ({ ...s, [id]: 'done' }))
        setProgress(p => ({ ...p, [id]: config.steps }))
      } else {
        setProgress(p => ({ ...p, [id]: step }))
      }
    }, 80)
  }, [])
  useEffect(() => () => Object.values(timers.current).forEach(clearInterval), [])
  return { states, progress, run }
}

// ─── Mini Sparkline (fake data for demo) ──────────────────────────
function Sparkline({ color = '#0ea5e9', height = 24, points = 12 }) {
  const data = useRef(Array.from({ length: points }, () => 20 + Math.random() * 60)).current
  const max = Math.max(...data)
  const w = 100
  const path = data.map((v, i) => `${(i / (points - 1)) * w},${height - (v / max) * height}`).join(' ')
  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} className="overflow-visible">
      <polyline points={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Rich Monitoring Widgets ──────────────────────────────────────

function AlarmWidget() {
  const nearThreshold = [
    { name: 'payment-service', metric: 'CPU', value: 72, threshold: 90, unit: '%' },
    { name: 'orders-db', metric: 'ReadLatency', value: 14, threshold: 20, unit: 'ms' },
    { name: 'checkout-service', metric: 'Memory', value: 68, threshold: 85, unit: '%' },
  ]
  return (
    <div className="glass-card p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-status-active" />
          <h3 className="text-body-s font-semibold text-foreground">Alarms</h3>
        </div>
        <span className="text-[10px] text-foreground-disabled">42 configured</span>
      </div>
      <div className="flex gap-2 mb-3">
        <div className="flex-1 rounded-lg bg-status-active/10 p-2 text-center">
          <p className="text-body-l font-semibold text-status-active">42</p>
          <p className="text-[9px] text-foreground-muted">OK</p>
        </div>
        <div className="flex-1 rounded-lg bg-status-degraded/10 p-2 text-center">
          <p className="text-body-l font-semibold text-status-degraded">0</p>
          <p className="text-[9px] text-foreground-muted">In alarm</p>
        </div>
        <div className="flex-1 rounded-lg bg-foreground-muted/10 p-2 text-center">
          <p className="text-body-l font-semibold text-foreground-muted">0</p>
          <p className="text-[9px] text-foreground-muted">Insufficient</p>
        </div>
      </div>
      <p className="text-[9px] text-foreground-disabled uppercase tracking-wider mb-1.5">Closest to threshold</p>
      {nearThreshold.map(a => (
        <div key={a.name} className="flex items-center gap-2 py-1">
          <span className="text-[10px] text-foreground w-28 truncate">{a.name}</span>
          <div className="flex-1 h-1.5 rounded-full bg-border-muted/30 overflow-hidden">
            <div className="h-full rounded-full bg-status-degraded/60" style={{ width: `${(a.value / a.threshold) * 100}%` }} />
          </div>
          <span className="text-[9px] text-foreground-muted w-16 text-right">{a.value}/{a.threshold}{a.unit}</span>
        </div>
      ))}
    </div>
  )
}

function DashboardWidget() {
  const metrics = [
    { name: 'API GW', color: '#0ea5e9' },
    { name: 'Checkout', color: '#8b5cf6' },
    { name: 'Payment', color: '#f59e0b' },
    { name: 'Orders DB', color: '#22c55e' },
  ]
  return (
    <div className="glass-card p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ChartBar size={16} className="text-primary" />
          <h3 className="text-body-s font-semibold text-foreground">Production Dashboard</h3>
        </div>
        <span className="text-[10px] text-primary cursor-pointer hover:text-primary-hover">Open →</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map(m => (
          <div key={m.name} className="rounded-lg bg-background/40 border border-border-muted/30 p-2">
            <p className="text-[9px] text-foreground-muted mb-1">{m.name}</p>
            <Sparkline color={m.color} height={20} />
          </div>
        ))}
      </div>
    </div>
  )
}

function AnomalyWidget() {
  const detectors = [
    { metric: 'API GW requests', status: 'normal', distance: '12%' },
    { metric: 'ECS CPU', status: 'normal', distance: '24%' },
    { metric: 'RDS latency', status: 'normal', distance: '8%' },
    { metric: 'Lambda duration', status: 'normal', distance: '31%' },
    { metric: 'SQS age', status: 'normal', distance: '5%' },
  ]
  return (
    <div className="glass-card p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <WaveTriangle size={16} className="text-purple-400" />
          <h3 className="text-body-s font-semibold text-foreground">Anomaly Detection</h3>
        </div>
        <span className="text-[10px] text-foreground-disabled">5 active</span>
      </div>
      {detectors.map(d => (
        <div key={d.metric} className="flex items-center gap-2 py-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-status-active" />
          <span className="text-[10px] text-foreground flex-1">{d.metric}</span>
          <span className="text-[9px] text-foreground-disabled">{d.distance} from band</span>
        </div>
      ))}
    </div>
  )
}

function LogsWidget() {
  const logGroups = [
    { name: 'checkout-service', volume: '1.8 GB/day' },
    { name: 'payment-service', volume: '1.2 GB/day' },
    { name: 'api-gateway', volume: '0.9 GB/day' },
  ]
  return (
    <div className="glass-card p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-green-400" />
          <h3 className="text-body-s font-semibold text-foreground">Logs</h3>
        </div>
        <span className="text-[10px] text-foreground-disabled">14 services</span>
      </div>
      <div className="flex gap-2 mb-2 text-[9px]">
        <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">Standard: 13</span>
        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">IA: 1</span>
      </div>
      <p className="text-[9px] text-foreground-disabled uppercase tracking-wider mb-1">Top by volume</p>
      {logGroups.map(g => (
        <div key={g.name} className="flex items-center justify-between py-0.5">
          <span className="text-[10px] text-foreground">{g.name}</span>
          <span className="text-[9px] text-foreground-muted">{g.volume}</span>
        </div>
      ))}
    </div>
  )
}

function TracesWidget() {
  return (
    <div className="glass-card p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Path size={16} className="text-orange-400" />
          <h3 className="text-body-s font-semibold text-foreground">Traces</h3>
        </div>
        <span className="text-[10px] text-foreground-disabled">X-Ray active</span>
      </div>
      <p className="text-[9px] text-foreground-disabled uppercase tracking-wider mb-1.5">Critical path latency</p>
      <div className="flex gap-3">
        {[{ label: 'p50', value: '82ms' }, { label: 'p95', value: '210ms' }, { label: 'p99', value: '480ms' }].map(p => (
          <div key={p.label} className="flex-1 text-center">
            <p className="text-body-s font-semibold text-foreground">{p.value}</p>
            <p className="text-[9px] text-foreground-muted">{p.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <Sparkline color="#fb923c" height={16} />
      </div>
    </div>
  )
}

function CWAgentWidget() {
  const svcs = [
    { name: 'checkout', mem: 62 }, { name: 'payment', mem: 58 },
    { name: 'user', mem: 45 }, { name: 'order', mem: 41 },
    { name: 'inventory', mem: 33 }, { name: 'search', mem: 52 },
  ]
  return (
    <div className="glass-card p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-cyan-400" />
          <h3 className="text-body-s font-semibold text-foreground">CloudWatch Agent</h3>
        </div>
        <span className="text-[10px] text-foreground-disabled">6 services</span>
      </div>
      <p className="text-[9px] text-foreground-disabled uppercase tracking-wider mb-1.5">Memory utilization</p>
      {svcs.map(s => (
        <div key={s.name} className="flex items-center gap-2 py-0.5">
          <span className="text-[10px] text-foreground w-16 truncate">{s.name}</span>
          <div className="flex-1 h-1.5 rounded-full bg-border-muted/30 overflow-hidden">
            <div className="h-full rounded-full bg-cyan-400/60" style={{ width: `${s.mem}%` }} />
          </div>
          <span className="text-[9px] text-foreground-muted w-8 text-right">{s.mem}%</span>
        </div>
      ))}
    </div>
  )
}

function ContainerInsightsWidget() {
  return (
    <div className="glass-card p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-teal-400" />
          <h3 className="text-body-s font-semibold text-foreground">Container Insights</h3>
        </div>
        <span className="text-[10px] text-foreground-disabled">3 clusters</span>
      </div>
      <div className="flex gap-2">
        {[{ name: 'east-1', tasks: 13 }, { name: 'east-2', tasks: 10 }, { name: 'west-1', tasks: 3 }].map(c => (
          <div key={c.name} className="flex-1 rounded-lg bg-background/40 border border-border-muted/30 p-2 text-center">
            <p className="text-body-s font-semibold text-foreground">{c.tasks}</p>
            <p className="text-[9px] text-foreground-muted">{c.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function AppSignalsWidget() {
  return (
    <div className="glass-card p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Broadcast size={16} className="text-pink-400" />
          <h3 className="text-body-s font-semibold text-foreground">Application Signals</h3>
        </div>
        <span className="text-[10px] text-foreground-disabled">APM active</span>
      </div>
      <p className="text-[11px] text-foreground-muted mb-2">Service map, latency breakdown, and error tracking enabled.</p>
      <span className="text-[10px] text-pink-400 cursor-pointer hover:text-pink-300">Open service map →</span>
    </div>
  )
}

function LogClassWidget() {
  return (
    <div className="glass-card p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Archive size={16} className="text-blue-400" />
          <h3 className="text-body-s font-semibold text-foreground">Log Optimization</h3>
        </div>
        <span className="text-[10px] text-foreground-disabled">~$12/mo saved</span>
      </div>
      <p className="text-[11px] text-foreground-muted">notification-service → Infrequent Access. image-processor → Standard (kept).</p>
    </div>
  )
}

// ─── Widget registry ──────────────────────────────────────────────
const widgetRegistry = {
  't1-alarms': AlarmWidget,
  't1-dashboard': DashboardWidget,
  't1-anomaly': AnomalyWidget,
  't1-logclass': LogClassWidget,
  't2-cw-agent': CWAgentWidget,
  't2-logs': LogsWidget,
  't2-traces': TracesWidget,
  't2-container-insights': ContainerInsightsWidget,
  't2-app-signals': AppSignalsWidget,
}

// ─── Shared Components ────────────────────────────────────────────

function BadgeWithTooltip({ text, tooltip, colorClass, bgClass }) {
  return (
    <span className={`relative group inline-flex items-center gap-1 text-[9px] ${colorClass} ${bgClass} px-1.5 py-0.5 rounded-full font-medium cursor-help`}>
      {text}
      <Info size={9} />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-64 px-3 py-2 rounded-lg bg-background-surface-2 border border-border-muted text-[10px] text-foreground-muted leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
        {tooltip}
      </span>
    </span>
  )
}

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange() }}
      className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${on ? 'bg-primary' : 'bg-foreground-disabled/30'}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${on ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

function DetailTable({ details, done, perResource }) {
  if (!details || details.length === 0) return null
  const keys = Object.keys(details[0])
  const showStatus = done && perResource
  return (
    <div className="mt-2 rounded-lg bg-background/40 border border-border-muted/30 overflow-hidden">
      <table className="w-full text-[10px]">
        <thead>
          <tr className="border-b border-border-muted/30">
            {keys.map(k => <th key={k} className="text-left px-2.5 py-1.5 text-foreground-disabled font-medium uppercase tracking-wider">{k}</th>)}
            {showStatus && <th className="text-left px-2.5 py-1.5 text-foreground-disabled font-medium uppercase tracking-wider">Status</th>}
          </tr>
        </thead>
        <tbody>
          {details.map((row, i) => (
            <tr key={i} className={i < details.length - 1 ? 'border-b border-border-muted/20' : ''}>
              {keys.map(k => <td key={k} className="px-2.5 py-1.5 text-foreground-muted">{row[k]}</td>)}
              {showStatus && (
                <td className="px-2.5 py-1.5">
                  <span className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-status-active"><CheckCircle size={10} weight="fill" />Created</span>
                    <button className="text-primary hover:text-primary-hover">View →</button>
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ItemStatus({ id, item, states, progress, onRun, pinned, onPin }) {
  const navigate = useNavigate()
  const state = states[id] || 'idle'
  const config = simConfig[id]
  const step = progress[id] || 0

  if (state === 'done') {
    const isAutoPin = AUTO_PIN.has(id)
    return (
      <span className="flex items-center gap-2 flex-shrink-0">
        <span className="flex items-center gap-1 text-[10px] text-status-active">
          <CheckCircle size={12} weight="fill" />
          {config?.done || 'Done'}
        </span>
        {item?.viewLabel && (
          <button onClick={(e) => { e.stopPropagation(); item.viewPath && navigate(item.viewPath) }} className="text-[10px] text-primary hover:text-primary-hover">
            {item.viewLabel} →
          </button>
        )}
        {!isAutoPin && onPin && (
          <button
            onClick={(e) => { e.stopPropagation(); onPin(id) }}
            className={`text-[10px] flex items-center gap-0.5 px-1.5 py-0.5 rounded transition-colors ${pinned ? 'text-primary bg-primary/10' : 'text-foreground-disabled hover:text-primary hover:bg-primary/10'}`}
          >
            <PushPin size={10} weight={pinned ? 'fill' : 'regular'} />
            {pinned ? 'Pinned' : 'Pin'}
          </button>
        )}
      </span>
    )
  }
  if (state === 'running') {
    return (
      <span className="flex items-center gap-1.5 text-[10px] text-primary flex-shrink-0">
        <CircleNotch size={12} className="animate-spin" />
        <span>{config?.label(step, config.steps)}</span>
      </span>
    )
  }
  return (
    <button onClick={(e) => { e.stopPropagation(); onRun(id) }} className="flex items-center gap-1 text-[10px] text-primary hover:text-primary-hover px-2 py-1 rounded-md hover:bg-primary/10 transition-colors flex-shrink-0">
      <Play size={10} weight="fill" />Run
    </button>
  )
}

function Tier1Item({ item, states, progress, onRun, pinned, onPin }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = tierIcons[item.icon] || Lightning
  const state = states[item.id] || 'idle'
  return (
    <div className="py-2">
      <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${state === 'done' ? 'bg-status-active/10 text-status-active' : state === 'running' ? 'bg-primary/10 text-primary' : 'bg-status-active/10 text-status-active'}`}>
          {state === 'done' ? <CheckCircle size={14} weight="fill" /> : state === 'running' ? <CircleNotch size={14} className="animate-spin" /> : <Icon size={14} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`text-body-s font-medium ${state === 'done' ? 'text-foreground-muted line-through' : 'text-foreground'}`}>{item.title}</p>
            {item.details && state !== 'running' && (expanded ? <CaretDown size={10} className="text-foreground-disabled" /> : <CaretRight size={10} className="text-foreground-disabled" />)}
          </div>
          {state === 'running' ? (
            <div className="mt-1"><div className="w-full h-1 rounded-full bg-border-muted/30 overflow-hidden"><div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${((progress[item.id] || 0) / simConfig[item.id].steps) * 100}%` }} /></div></div>
          ) : <p className="text-[11px] text-foreground-muted mt-0.5">{item.description}</p>}
        </div>
        <ItemStatus id={item.id} item={item} states={states} progress={progress} onRun={onRun} pinned={pinned} onPin={onPin} />
      </div>
      {expanded && state !== 'running' && <div className="ml-10"><DetailTable details={item.details} done={state === 'done'} perResource={item.detailsPerResource} /></div>}
    </div>
  )
}

function Tier2Item({ item, enabled, onToggle, states, progress, onRun, pinned, onPin }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = tierIcons[item.icon] || Lightning
  const state = states[item.id] || 'idle'
  return (
    <div className={`py-2 ${!enabled && state !== 'done' ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${state === 'done' ? 'bg-status-active/10 text-status-active' : state === 'running' ? 'bg-primary/10 text-primary' : 'bg-primary/10 text-primary'}`}>
          {state === 'done' ? <CheckCircle size={14} weight="fill" /> : state === 'running' ? <CircleNotch size={14} className="animate-spin" /> : <Icon size={14} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`text-body-s font-medium ${state === 'done' ? 'text-foreground-muted line-through' : 'text-foreground'}`}>{item.title}</p>
            {item.details && state !== 'running' && (expanded ? <CaretDown size={10} className="text-foreground-disabled" /> : <CaretRight size={10} className="text-foreground-disabled" />)}
          </div>
          {state === 'running' ? (
            <div className="mt-1"><div className="w-full h-1 rounded-full bg-border-muted/30 overflow-hidden"><div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${((progress[item.id] || 0) / simConfig[item.id].steps) * 100}%` }} /></div></div>
          ) : (
            <>
              <p className="text-[11px] text-foreground-muted mt-0.5">{item.description}</p>
              {enabled && state === 'idle' && <p className="text-[10px] text-status-degraded/80 mt-1">⚡ {item.impact}</p>}
            </>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {state === 'done' || state === 'running' ? (
            <ItemStatus id={item.id} item={item} states={states} progress={progress} onRun={onRun} pinned={pinned} onPin={onPin} />
          ) : (
            <>
              {enabled && <ItemStatus id={item.id} item={item} states={states} progress={progress} onRun={onRun} pinned={pinned} onPin={onPin} />}
              <Toggle on={enabled} onChange={onToggle} />
            </>
          )}
        </div>
      </div>
      {expanded && state !== 'running' && enabled && <div className="ml-10"><DetailTable details={item.details} done={state === 'done'} perResource={item.detailsPerResource} /></div>}
    </div>
  )
}

function Tier3Item({ item }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = tierIcons[item.icon] || Lightning
  return (
    <div className="py-2 opacity-60">
      <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="w-7 h-7 rounded-lg bg-foreground-muted/10 flex items-center justify-center text-foreground-muted flex-shrink-0 mt-0.5"><Icon size={14} /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-body-s font-medium text-foreground">{item.title}</p>
            {expanded ? <CaretDown size={10} className="text-foreground-disabled" /> : <CaretRight size={10} className="text-foreground-disabled" />}
          </div>
          <p className="text-[11px] text-foreground-muted mt-0.5">{item.suggestion}</p>
        </div>
        <span className="text-[10px] text-foreground-disabled flex-shrink-0 mt-1">After setup</span>
      </div>
      {expanded && (
        <div className="ml-10 mt-2 rounded-lg bg-background/40 border border-border-muted/30 p-3">
          <p className="text-[11px] text-foreground-muted"><span className="text-foreground font-medium">Question:</span> {item.question}</p>
        </div>
      )}
    </div>
  )
}

function ActivityItem({ item, isLast }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="flex flex-col items-center">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5" />
        {!isLast && <div className="w-px flex-1 bg-border-muted mt-1" />}
      </div>
      <div className={isLast ? '' : 'pb-3'}>
        <p className="text-[11px] text-foreground-muted">{item.action}</p>
        <p className="text-[10px] text-foreground-disabled mt-0.5">{item.time}</p>
      </div>
    </div>
  )
}

export default function Day0Page() {
  const [input, setInput] = useState('')
  const { user, application, coverage, setup, agentActivity, services } = persona
  const { states, progress, run } = useSimulation()

  const [tier2State, setTier2State] = useState(() => Object.fromEntries(setup.tier2.items.map(i => [i.id, i.defaultOn])))
  const toggleTier2 = (id) => { if (states[id] === 'running' || states[id] === 'done') return; setTier2State(prev => ({ ...prev, [id]: !prev[id] })) }

  // Pinned widgets (non-auto items that user manually pinned)
  const [pinned, setPinned] = useState({})
  const togglePin = (id) => setPinned(prev => ({ ...prev, [id]: !prev[id] }))

  const [showSetup, setShowSetup] = useState(true)
  const [showTier2, setShowTier2] = useState(true)
  const [showTier3, setShowTier3] = useState(false)

  const firstName = user.name.split(' ')[0]
  const tier2Count = Object.values(tier2State).filter(Boolean).length

  const allSetupIds = [...setup.tier1.items.map(i => i.id), ...setup.tier2.items.map(i => i.id)]
  const doneCount = allSetupIds.filter(id => states[id] === 'done').length
  const totalCount = allSetupIds.length
  const allDone = doneCount === totalCount && doneCount > 0

  // Visible widgets: auto-pinned (when done) + manually pinned (when done)
  const visibleWidgets = allSetupIds.filter(id =>
    states[id] === 'done' && (AUTO_PIN.has(id) || pinned[id])
  )

  useEffect(() => { if (allDone) setShowSetup(false) }, [allDone])

  const runAll = useCallback(() => {
    const ids = [...setup.tier1.items.map(i => i.id), ...setup.tier2.items.filter(i => tier2State[i.id]).map(i => i.id)]
    let delay = 0
    ids.forEach(id => {
      if (states[id] === 'done' || states[id] === 'running') return
      const config = simConfig[id]
      const duration = config ? config.steps * 80 + 200 : 1000
      setTimeout(() => run(id), delay)
      delay += duration
    })
  }, [run, states, tier2State, setup])

  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkle size={16} className="text-primary" weight="fill" />
          <span className="text-[11px] text-primary font-medium">Agent active</span>
        </div>
        <h1 className="text-heading-xl font-normal tracking-tighter text-foreground">
          {allDone ? `${firstName}'s Dashboard` : `Welcome, ${firstName}`}
        </h1>
        <p className="text-body-m text-foreground-muted mt-1">
          {allDone
            ? `${application.name} — ${coverage.totalServices} services monitored across ${application.regions.length} regions`
            : `I just scanned your account and found ${coverage.totalServices} services across ${application.regions.length} regions. Let's get you set up.`}
        </p>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-6">
        <div className="flex flex-col gap-5">

          {/* Monitoring Widgets */}
          {visibleWidgets.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {visibleWidgets.map(id => {
                const Widget = widgetRegistry[id]
                return Widget ? <Widget key={id} /> : null
              })}
            </div>
          )}

          {/* Setup Section */}
          {doneCount > 0 && !showSetup ? (
            <button onClick={() => setShowSetup(true)} className="glass-card p-3 flex items-center gap-3 hover:border-primary/20 transition-colors">
              <CheckCircle size={16} weight="fill" className={allDone ? 'text-status-active' : 'text-primary'} />
              <span className="text-body-s font-medium text-foreground flex-1 text-left">{allDone ? 'Setup complete' : 'Setup in progress'}</span>
              <span className="text-[11px] text-foreground-disabled">{doneCount} of {totalCount} done</span>
              <CaretDown size={14} className="text-foreground-muted" />
            </button>
          ) : (
            <>
              {!allDone && (
                <div className="ai-glass-card p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary flex-shrink-0"><Robot size={22} /></div>
                    <div className="flex-1">
                      <h2 className="text-body-l font-semibold text-foreground">{setup.summary.headline}</h2>
                      <p className="text-body-s text-foreground-muted mt-1">{setup.summary.subtext}</p>
                      <p className="text-[11px] text-foreground-disabled mt-2">Click any item to see details. Run individually or all at once.</p>
                    </div>
                    {doneCount > 0 && <button onClick={() => setShowSetup(false)} className="text-foreground-muted hover:text-foreground p-1"><CaretUp size={14} /></button>}
                  </div>
                </div>
              )}

              <div className="glass-card p-5 border-l-2 border-l-status-active/50">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={16} weight="fill" className="text-status-active" />
                  <h3 className="text-body-s font-semibold text-foreground">{setup.tier1.label}</h3>
                  <BadgeWithTooltip text={setup.tier1.badge} tooltip={setup.tier1.badgeTooltip} colorClass="text-status-active" bgClass="bg-status-active/10" />
                </div>
                <p className="text-[11px] text-foreground-muted mb-3 ml-6">{setup.tier1.description}</p>
                <div className="flex flex-col divide-y divide-border-muted/50 ml-6">
                  {setup.tier1.items.map(item => <Tier1Item key={item.id} item={item} states={states} progress={progress} onRun={run} pinned={pinned[item.id]} onPin={togglePin} />)}
                </div>
              </div>

              <div className="glass-card p-5 border-l-2 border-l-status-degraded/50">
                <button onClick={() => setShowTier2(!showTier2)} className="flex items-center gap-2 mb-1 w-full text-left">
                  <ShieldCheck size={16} className="text-status-degraded" />
                  <h3 className="text-body-s font-semibold text-foreground">{setup.tier2.label}</h3>
                  <BadgeWithTooltip text={setup.tier2.badge} tooltip={setup.tier2.badgeTooltip} colorClass="text-status-degraded" bgClass="bg-status-degraded/10" />
                  <span className="flex-1" />
                  <span className="text-[11px] text-foreground-disabled mr-2">{tier2Count} of {setup.tier2.items.length} enabled</span>
                  {showTier2 ? <CaretUp size={14} className="text-foreground-muted" /> : <CaretDown size={14} className="text-foreground-muted" />}
                </button>
                {showTier2 && (
                  <>
                    <p className="text-[11px] text-foreground-muted mb-3 ml-6">{setup.tier2.description}</p>
                    <div className="flex flex-col divide-y divide-border-muted/50 ml-6">
                      {setup.tier2.items.map(item => <Tier2Item key={item.id} item={item} enabled={tier2State[item.id]} onToggle={() => toggleTier2(item.id)} states={states} progress={progress} onRun={run} pinned={pinned[item.id]} onPin={togglePin} />)}
                    </div>
                  </>
                )}
              </div>

              <div className="glass-card p-5 border-l-2 border-l-foreground-muted/30">
                <button onClick={() => setShowTier3(!showTier3)} className="flex items-center gap-2 mb-1 w-full text-left">
                  <Clock size={16} className="text-foreground-muted" />
                  <h3 className="text-body-s font-semibold text-foreground">{setup.tier3.label}</h3>
                  <BadgeWithTooltip text={setup.tier3.badge} tooltip={setup.tier3.badgeTooltip} colorClass="text-foreground-muted" bgClass="bg-foreground-muted/10" />
                  <span className="flex-1" />
                  <span className="text-[11px] text-foreground-disabled mr-2">{setup.tier3.items.length} items</span>
                  {showTier3 ? <CaretUp size={14} className="text-foreground-muted" /> : <CaretDown size={14} className="text-foreground-muted" />}
                </button>
                {showTier3 && (
                  <>
                    <p className="text-[11px] text-foreground-muted mb-3 ml-6">{setup.tier3.description}</p>
                    <div className="flex flex-col divide-y divide-border-muted/50 ml-6">
                      {setup.tier3.items.map(item => <Tier3Item key={item.id} item={item} />)}
                    </div>
                  </>
                )}
              </div>

              {!allDone && (
                <button onClick={runAll} className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-body-m flex items-center justify-center gap-2 transition-colors">
                  <Sparkle size={18} weight="fill" />Set up everything<ArrowRight size={16} />
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3"><Robot size={16} className="text-primary" /><h3 className="text-body-s font-semibold text-foreground">Ask the agent</h3></div>
            <div className="relative">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. 'Why these alarms?'" className="w-full h-9 rounded-lg bg-background-surface-1 border border-border-muted px-3 pr-9 text-[12px] text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-primary/40 transition-colors" />
              <button className="absolute right-1.5 top-1.5 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"><PaperPlaneRight size={12} /></button>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3"><Sparkle size={14} className="text-primary" weight="fill" /><h3 className="text-body-s font-semibold text-foreground">Agent Activity</h3></div>
            <div className="flex flex-col">{agentActivity.map((item, i) => <ActivityItem key={i} item={item} isLast={i === agentActivity.length - 1} />)}</div>
          </div>
          <div className="glass-card p-4">
            <h3 className="text-body-s font-semibold text-foreground mb-3">Discovered Services</h3>
            <div className="flex flex-col gap-1.5">
              {services.slice(0, 8).map(svc => (
                <div key={svc.name} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-foreground-disabled" /><span className="text-[11px] text-foreground">{svc.name}</span></div>
                  <span className="text-[10px] text-foreground-disabled">{svc.type}</span>
                </div>
              ))}
              <button className="text-[11px] text-primary hover:text-primary-hover mt-1 text-left">View all {services.length} services →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
